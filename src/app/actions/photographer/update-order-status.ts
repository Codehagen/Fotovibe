"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export async function updateOrderStatus(
  orderId: string,
  status: "IN_PROGRESS" | "COMPLETED"
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

    // Update order in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: status as OrderStatus,
          startedAt: status === "IN_PROGRESS" ? new Date() : undefined,
          completedAt: status === "COMPLETED" ? new Date() : undefined,
        },
      });

      // Create status history
      await tx.statusHistory.create({
        data: {
          orderId,
          status,
          changedBy: userId,
          notes:
            status === "IN_PROGRESS"
              ? "Fotograf har startet oppdraget"
              : "Fotograf har fullført oppdraget",
        },
      });

      return updated;
    });

    revalidatePath(`/fotograf/ordre/${orderId}`);
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}
