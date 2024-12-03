"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export async function acceptOrder(orderId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get photographer profile
    const photographer = await prisma.photographer.findUnique({
      where: { clerkId: user.id },
    });

    if (!photographer) {
      throw new Error("Photographer profile not found");
    }

    // Update order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          photographerId: photographer.id,
          status: OrderStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });

      // Create status history
      await tx.statusHistory.create({
        data: {
          orderId,
          status: OrderStatus.IN_PROGRESS,
          changedBy: user.id,
          notes: "Fotograf har startet oppdraget",
        },
      });

      return updatedOrder;
    });

    revalidatePath("/fotograf");
    return { success: true, order };
  } catch (error) {
    console.error("Error accepting order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept order",
    };
  }
}
