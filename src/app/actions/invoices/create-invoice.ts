"use server";

import { prisma } from "@/lib/db";
import { createFikenInvoice } from "@/lib/fiken/fiken";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";

interface CreateInvoiceInput {
  orderId: string;
  workspaceId: string;
  dueDate?: Date;
}

export async function createInvoice(input: CreateInvoiceInput) {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      throw new Error("Unauthorized");
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId: input.orderId },
    });

    if (existingInvoice) {
      return {
        success: false,
        error: "En faktura eksisterer allerede for denne ordren",
        data: existingInvoice, // Return the existing invoice
      };
    }

    // Get workspace's active subscription
    const workspace = await prisma.workspace.findUnique({
      where: { id: input.workspaceId },
      include: {
        subscriptions: {
          where: {
            isActive: true,
            OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
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
          where: { id: input.orderId },
          select: {
            photoCount: true,
            videoCount: true,
          },
        },
      },
    });

    if (!workspace?.subscriptions[0]) {
      throw new Error("No active subscription found for workspace");
    }

    const subscription = workspace.subscriptions[0];
    const order = workspace.orders[0];

    // Calculate total amount including any extra charges
    let totalAmount = subscription.amount;

    // Add extra charges if order exceeds subscription limits
    if (subscription.Plan) {
      if (
        order.photoCount &&
        order.photoCount > subscription.Plan.photosPerMonth
      ) {
        const extraPhotos = order.photoCount - subscription.Plan.photosPerMonth;
        totalAmount += extraPhotos * 100; // 100 NOK per extra photo
      }

      if (
        order.videoCount &&
        subscription.Plan.videosPerMonth &&
        order.videoCount > subscription.Plan.videosPerMonth
      ) {
        const extraVideos = order.videoCount - subscription.Plan.videosPerMonth;
        totalAmount += extraVideos * 500; // 500 NOK per extra video
      }
    }

    const fikenResult = await createFikenInvoice({
      ...input,
      amount: totalAmount,
    });

    // Create invoice in our database
    const invoice = await prisma.invoice.create({
      data: {
        orderId: input.orderId,
        workspaceId: input.workspaceId,
        amount: totalAmount,
        dueDate: input.dueDate,
        fikenId: fikenResult.fikenId,
        status: "SENT",
      },
    });

    revalidatePath("/admin");
    revalidatePath(`/ordre/${input.orderId}`);

    return { success: true, data: invoice };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}
