"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";

const createOrderSchema = z.object({
  photographerId: z.string().min(1, "Photographer is required"),
  scheduledDate: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  requirements: z.string().optional(),
  photoCount: z.number().min(0).optional(),
  videoCount: z.number().min(0).optional(),
});

export async function createOrder(input: z.infer<typeof createOrderSchema>) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized: No user found");
    }

    // Get user's workspace
    const userWorkspace = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        workspaces: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!userWorkspace?.workspaces[0]?.id) {
      throw new Error("No workspace found for user");
    }

    const workspaceId = userWorkspace.workspaces[0].id;
    const validatedFields = createOrderSchema.parse(input);

    // Create the order with all fields that would be set by a cron job
    const order = await prisma.order.create({
      data: {
        photographerId: validatedFields.photographerId,
        workspaceId: workspaceId,
        scheduledDate: new Date(validatedFields.scheduledDate),
        location: validatedFields.location,
        requirements: validatedFields.requirements || null,
        photoCount: validatedFields.photoCount || 0,
        videoCount: validatedFields.videoCount || 0,
        status: "NOT_STARTED" as OrderStatus,
        orderDate: new Date(),
        editorId: null,
        startedAt: null,
        editingStartedAt: null,
        reviewStartedAt: null,
        completedAt: null,
        cancelReason: null,
        deliveryDate: null
      },
      // Include related data in the response
      include: {
        photographer: {
          select: {
            name: true,
          },
        },
        editor: {
          select: {
            name: true,
          },
        },
        workspace: {
          select: {
            name: true,
          },
        },
      },
    });

    // Create initial status history entry
    await prisma.statusHistory.create({
      data: {
        orderId: order.id,
        status: "NOT_STARTED",
        changedBy: userId,
        notes: "Order created",
      },
    });

    revalidatePath("/ordre");
    return { success: true, order };
  } catch (error) {
    console.error("Error in createOrder:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "An unexpected error occurred while creating the order",
    };
  }
}