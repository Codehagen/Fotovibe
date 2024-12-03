"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface DeleteOrderResponse {
  success: boolean;
  error?: string;
}

export async function deleteWorkspaceOrder(orderId: string): Promise<DeleteOrderResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperUser: true },
    });

    if (!user?.isSuperUser) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get workspace ID for revalidation
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { workspaceId: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Delete in transaction to handle all related records
    await prisma.$transaction([
      // Delete status history
      prisma.statusHistory.deleteMany({
        where: { orderId },
      }),

      // Delete checklists
      prisma.orderChecklist.deleteMany({
        where: { orderId },
      }),

      prisma.editorChecklist.deleteMany({
        where: { orderId },
      }),

      // Delete media
      prisma.media.deleteMany({
        where: { orderId },
      }),

      // Delete the order
      prisma.order.delete({
        where: { id: orderId },
      }),
    ]);

    // Revalidate paths
    revalidatePath(`/admin/workspaces/${order.workspaceId}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteWorkspaceOrder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete order",
    };
  }
}