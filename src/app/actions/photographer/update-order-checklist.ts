"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

interface UpdateChecklistInput {
  type: "contact" | "schedule" | "dropbox";
  dropboxUrl?: string;
  notes?: string;
  scheduledDate?: Date;
}

export async function updateOrderChecklist(
  orderId: string,
  input: UpdateChecklistInput
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify photographer has access to this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        photographer: {
          select: {
            clerkId: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (!order.photographer || order.photographer.clerkId !== userId) {
      throw new Error("Unauthorized: Not your order");
    }

    // Update in transaction to ensure consistency
    const [checklist] = await prisma.$transaction([
      // Update checklist
      prisma.orderChecklist.upsert({
        where: { orderId },
        create: {
          orderId,
          contactedAt: input.type === "contact" ? new Date() : null,
          scheduledAt: input.type === "schedule" ? input.scheduledDate : null,
          dropboxUrl: input.type === "dropbox" ? input.dropboxUrl : null,
          contactNotes: input.type === "contact" ? input.notes : null,
          schedulingNotes: input.type === "schedule" ? input.notes : null,
          uploadNotes: input.type === "dropbox" ? input.notes : null,
          uploadedAt: input.type === "dropbox" ? new Date() : null,
        },
        update: {
          contactedAt: input.type === "contact" ? new Date() : undefined,
          scheduledAt:
            input.type === "schedule" ? input.scheduledDate : undefined,
          dropboxUrl: input.type === "dropbox" ? input.dropboxUrl : undefined,
          contactNotes: input.type === "contact" ? input.notes : undefined,
          schedulingNotes: input.type === "schedule" ? input.notes : undefined,
          uploadNotes: input.type === "dropbox" ? input.notes : undefined,
          uploadedAt: input.type === "dropbox" ? new Date() : undefined,
        },
      }),

      // Update order scheduledDate if provided
      ...(input.type === "schedule" && input.scheduledDate
        ? [
            prisma.order.update({
              where: { id: orderId },
              data: {
                scheduledDate: input.scheduledDate,
                status: "IN_PROGRESS",
              },
            }),
          ]
        : []),

      // Create status history entry for scheduling
      ...(input.type === "schedule"
        ? [
            prisma.statusHistory.create({
              data: {
                orderId,
                status: order.status,
                changedBy: userId,
                notes: `Fotograf har booket tidspunkt: ${input.notes}`,
              },
            }),
          ]
        : []),
    ]);

    // If dropbox URL is added, update order status to EDITING
    if (input.type === "dropbox" && input.dropboxUrl) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.EDITING,
            editingStartedAt: new Date(),
            uploadedAt: new Date(),
          },
        });

        await tx.statusHistory.create({
          data: {
            orderId,
            status: OrderStatus.EDITING,
            changedBy: userId,
            notes:
              input.notes ||
              "Fotograf har lastet opp media. Oppdraget er sendt til redigering.",
          },
        });
      });
    }

    revalidatePath(`/fotograf/ordre/${orderId}`);
    revalidatePath("/fotograf");
    revalidatePath("/ordre");
    return { success: true, checklist };
  } catch (error) {
    console.error("Error in updateOrderChecklist:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update checklist",
    };
  }
}
