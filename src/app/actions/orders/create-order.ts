"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createInvoice } from "../invoices/create-invoice";
import { Order, Subscription } from "@prisma/client";

const createOrderSchema = z.object({
  workspaceId: z.string(),
  photographerId: z.string().optional(),
  location: z.string(),
  scheduledDate: z.string(),
  requirements: z.string().optional(),
  photoCount: z.number().optional(),
  videoCount: z.number().optional(),
});

async function calculateOrderAmount(order: Order) {
  // Get the workspace's active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      workspaceId: order.workspaceId,
      isActive: true,
      endDate: {
        gt: new Date(), // Subscription hasn't ended
      },
    },
    include: {
      Plan: true, // Include the plan details
    },
  });

  if (!subscription) {
    throw new Error("No active subscription found for workspace");
  }

  // Base pricing from subscription plan
  const basePrice = subscription.amount;

  // Calculate extra costs if order exceeds subscription limits
  let extraPhotosCost = 0;
  let extraVideosCost = 0;

  if (subscription.Plan) {
    // Extra photos beyond plan limit
    if (
      order.photoCount &&
      order.photoCount > subscription.Plan.photosPerMonth
    ) {
      const extraPhotos = order.photoCount - subscription.Plan.photosPerMonth;
      extraPhotosCost = extraPhotos * 100; // 100 NOK per extra photo
    }

    // Extra videos beyond plan limit
    if (
      order.videoCount &&
      subscription.Plan.videosPerMonth &&
      order.videoCount > subscription.Plan.videosPerMonth
    ) {
      const extraVideos = order.videoCount - subscription.Plan.videosPerMonth;
      extraVideosCost = extraVideos * 500; // 500 NOK per extra video
    }
  }

  // Calculate total
  const totalAmount = basePrice + extraPhotosCost + extraVideosCost;

  // Add VAT (25% in Norway)
  const vatRate = 0.25;
  const totalWithVAT = totalAmount * (1 + vatRate);

  return Math.round(totalWithVAT); // Round to nearest NOK
}

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
          // Create initial status history
          statusHistory: {
            create: {
              status: "PENDING_PHOTOGRAPHER",
              changedBy: user.id,
              notes: "Ordre opprettet av admin",
            },
          },
          // Create photographer checklist
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
          // Create editor checklist
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
          workspace: true,
          photographer: true,
          editor: true,
          statusHistory: {
            orderBy: {
              createdAt: "desc",
            },
          },
          checklist: true,
          EditorChecklist: true,
        },
      });

      // Calculate amount based on subscription and extras
      const amount = await calculateOrderAmount(order);

      // Create invoice
      await createInvoice({
        orderId: order.id,
        workspaceId: order.workspaceId,
        amount,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
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
