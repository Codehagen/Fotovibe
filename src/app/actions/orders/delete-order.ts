"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteOrder(orderId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Delete all related records in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete status history
      await tx.statusHistory.deleteMany({
        where: { orderId },
      });

      // Delete checklists
      await tx.orderChecklist.deleteMany({
        where: { orderId },
      });

      await tx.editorChecklist.deleteMany({
        where: { orderId },
      });

      // Delete the order
      await tx.order.delete({
        where: { id: orderId },
      });
    });

    revalidatePath("/fotograf");
    revalidatePath("/editor");
    revalidatePath("/ordre");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete order",
    };
  }
}
