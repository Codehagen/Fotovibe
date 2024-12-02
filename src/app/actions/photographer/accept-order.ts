"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export async function acceptOrder(orderId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if order is already taken
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { photographerId: true, status: true },
    });

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    if (
      existingOrder.photographerId ||
      existingOrder.status !== "PENDING_PHOTOGRAPHER"
    ) {
      throw new Error("This order is no longer available");
    }

    // Get or create photographer profile
    let photographer = await prisma.photographer.findUnique({
      where: { clerkId: userId },
    });

    if (!photographer) {
      // Create photographer profile if it doesn't exist
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      photographer = await prisma.photographer.create({
        data: {
          clerkId: userId,
          name: user?.name || null,
          email: user?.email || null,
          language: "norwegian",
        },
      });
    }

    // Update order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          photographerId: photographer.id,
          status: "NOT_STARTED" as OrderStatus,
        },
      });

      // Create status history
      await tx.statusHistory.create({
        data: {
          orderId: updatedOrder.id,
          status: "NOT_STARTED",
          changedBy: userId,
          notes: "Fotograf har tatt oppdraget",
        },
      });

      return updatedOrder;
    });

    revalidatePath("/fotograf");
    revalidatePath("/ordre");
    return { success: true, order };
  } catch (error) {
    console.error("Error in acceptOrder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept order",
    };
  }
}
