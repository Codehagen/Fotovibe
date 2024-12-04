"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createFikenInvoice } from "@/lib/fiken";
import { Order } from "@prisma/client";

const createOrderSchema = z.object({
  workspaceId: z.string(),
  photographerId: z.string().optional(),
  location: z.string(),
  scheduledDate: z.string(),
  requirements: z.string().optional(),
  photoCount: z.number().optional(),
  videoCount: z.number().optional(),
});

export async function createOrder(input: z.infer<typeof createOrderSchema>) {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validatedFields = createOrderSchema.parse(input);

    // Create order with checklists in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          workspaceId: validatedFields.workspaceId,
          photographerId: validatedFields.photographerId,
          status: "PENDING_PHOTOGRAPHER",
          orderDate: new Date(),
          scheduledDate: new Date(validatedFields.scheduledDate),
          location: validatedFields.location,
          requirements: validatedFields.requirements,
          photoCount: validatedFields.photoCount,
          videoCount: validatedFields.videoCount,
          statusHistory: {
            create: {
              status: "PENDING_PHOTOGRAPHER",
              changedBy: user.id,
              notes: "Ordre opprettet av admin",
            },
          },
          checklist: {
            create: {
              contactedAt: null,
              scheduledAt: null,
              dropboxUrl: null,
              uploadedAt: null,
              contactNotes: null,
              schedulingNotes: null,
              uploadNotes: null,
            },
          },
          EditorChecklist: {
            create: {
              editingStartedAt: null,
              uploadedAt: null,
              completedAt: null,
              reviewUrl: null,
            },
          },
        },
        include: {
          workspace: {
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
            },
          },
        },
      });

      // Calculate invoice amount based on subscription
      const subscription = newOrder.workspace.subscriptions[0];
      if (!subscription) {
        throw new Error("No active subscription found for workspace");
      }

      // Calculate invoice amount
      let totalAmount = subscription.amount;

      // Add extra charges if order exceeds subscription limits
      if (subscription.Plan) {
        if (
          validatedFields.photoCount &&
          validatedFields.photoCount > subscription.Plan.photosPerMonth
        ) {
          const extraPhotos =
            validatedFields.photoCount - subscription.Plan.photosPerMonth;
          totalAmount += extraPhotos * 100; // 100 NOK per extra photo
        }

        if (
          validatedFields.videoCount &&
          subscription.Plan.videosPerMonth &&
          validatedFields.videoCount > subscription.Plan.videosPerMonth
        ) {
          const extraVideos =
            validatedFields.videoCount - subscription.Plan.videosPerMonth;
          totalAmount += extraVideos * 500; // 500 NOK per extra video
        }
      }

      // Create invoice in Fiken first
      const fikenResult = await createFikenInvoice({
        orderId: newOrder.id,
        workspaceId: newOrder.workspaceId,
        amount: totalAmount,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        description: `Fotovibe oppdrag - ${newOrder.location}\nOrdre ID: ${newOrder.id}`,
      });

      // Create invoice in our database
      await tx.invoice.create({
        data: {
          orderId: newOrder.id,
          workspaceId: newOrder.workspaceId,
          amount: totalAmount,
          status: "SENT",
          fikenId: fikenResult.fikenId,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      return newOrder;
    });

    revalidatePath("/admin");
    return { success: true, data: order };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}
