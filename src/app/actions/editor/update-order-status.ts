"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export async function updateEditorOrderStatus(orderId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify editor has access to this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        editor: {
          select: {
            clerkId: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (!order.editor || order.editor.clerkId !== userId) {
      throw new Error("Unauthorized: Not your order");
    }

    // Update order in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Create status history
      await tx.statusHistory.create({
        data: {
          orderId,
          status: OrderStatus.COMPLETED,
          changedBy: userId,
          notes: "Editor har fullført redigering av materialet",
        },
      });

      return updated;
    });

    revalidatePath(`/editor/ordre/${orderId}`);
    revalidatePath("/editor");
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error("Error in updateEditorOrderStatus:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}
