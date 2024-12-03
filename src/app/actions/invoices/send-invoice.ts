"use server";

import { prisma } from "@/lib/db";
import { createFikenInvoice } from "@/lib/fiken/fiken";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";

interface SendInvoiceInput {
  orderId: string;
  workspaceId: string;
  amount: number;
  dueDate?: Date;
}

export async function sendInvoice(input: SendInvoiceInput) {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      throw new Error("Unauthorized");
    }

    // Get full workspace details
    const workspace = await prisma.workspace.findUnique({
      where: { id: input.workspaceId },
      select: {
        id: true,
        name: true,
        orgnr: true,
        address: true,
        city: true,
        zip: true,
        subscriptions: {
          where: {
            isActive: true,
            endDate: {
              gt: new Date(),
            },
          },
          include: {
            Plan: true,
          },
          orderBy: {
            startDate: "desc",
          },
          take: 1,
        },
        orders: {
          where: {
            id: input.orderId,
          },
          select: {
            photoCount: true,
            videoCount: true,
            location: true,
            scheduledDate: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (!workspace.subscriptions[0]) {
      throw new Error("No active subscription found");
    }

    const order = workspace.orders[0];
    if (!order) {
      throw new Error("Order not found");
    }

    // Calculate final amount based on subscription and extras
    const subscription = workspace.subscriptions[0];
    const plan = subscription.Plan;

    let extraCharges = 0;
    let extraDetails = [];

    if (plan) {
      if (order.photoCount && order.photoCount > plan.photosPerMonth) {
        const extraPhotos = order.photoCount - plan.photosPerMonth;
        const photoCharge = extraPhotos * 100; // 100 NOK per extra photo
        extraCharges += photoCharge;
        extraDetails.push(`${extraPhotos} ekstra bilder: ${photoCharge} NOK`);
      }

      if (
        order.videoCount &&
        plan.videosPerMonth &&
        order.videoCount > plan.videosPerMonth
      ) {
        const extraVideos = order.videoCount - plan.videosPerMonth;
        const videoCharge = extraVideos * 500; // 500 NOK per extra video
        extraCharges += videoCharge;
        extraDetails.push(`${extraVideos} ekstra videoer: ${videoCharge} NOK`);
      }
    }

    const totalAmount = subscription.amount + extraCharges;

    // Create invoice in Fiken
    const fikenResult = await createFikenInvoice({
      orderId: input.orderId,
      workspaceId: workspace.id,
      amount: totalAmount,
      dueDate: input.dueDate,
      description: [
        `Fotovibe oppdrag #${input.orderId}`,
        `Lokasjon: ${order.location}`,
        `Dato: ${
          order.scheduledDate
            ? new Date(order.scheduledDate).toLocaleDateString("nb-NO")
            : "Ikke planlagt"
        }`,
        `Abonnement: ${subscription.package} - ${subscription.amount} NOK`,
        ...(extraDetails.length > 0 ? ["Tillegg:", ...extraDetails] : []),
      ].join("\n"),
    });

    // Create invoice record in our database
    const invoice = await prisma.invoice.create({
      data: {
        orderId: input.orderId,
        workspaceId: workspace.id,
        amount: totalAmount,
        status: "SENT",
        fikenId: fikenResult.fikenId,
        dueDate: input.dueDate,
      },
    });

    revalidatePath("/admin");
    revalidatePath(`/ordre/${input.orderId}`);

    return { success: true, data: invoice };
  } catch (error) {
    console.error("Error sending invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invoice",
    };
  }
}
