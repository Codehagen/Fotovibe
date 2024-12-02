"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

interface ReviewOrderInput {
  type: "approve" | "request_changes";
  comment: string;
}

export async function reviewOrder(orderId: string, input: ReviewOrderInput) {
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

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status:
            input.type === "approve"
              ? OrderStatus.COMPLETED
              : OrderStatus.EDITING,
          completedAt: input.type === "approve" ? new Date() : null,
        },
      });

      // Create status history
      await tx.statusHistory.create({
        data: {
          orderId,
          status:
            input.type === "approve"
              ? OrderStatus.COMPLETED
              : OrderStatus.EDITING,
          changedBy: userId,
          notes: input.comment,
        },
      });

      // If requesting changes, reset editor checklist completion
      if (input.type === "request_changes") {
        await tx.editorChecklist.update({
          where: { orderId },
          data: {
            completedAt: null,
          },
        });
      }
    });

    revalidatePath(`/fotograf/review/${orderId}`);
    revalidatePath("/fotograf");
    return { success: true };
  } catch (error) {
    console.error("Error in reviewOrder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to review order",
    };
  }
}
