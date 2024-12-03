"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
