"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getAvailableOrders() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get available orders (those with PENDING_PHOTOGRAPHER status)
    const orders = await prisma.order.findMany({
      where: {
        status: "PENDING_PHOTOGRAPHER",
        photographerId: null, // Make sure no photographer is assigned
      },
      select: {
        id: true,
        orderDate: true,
        scheduledDate: true,
        location: true,
        workspace: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "asc", // Show nearest dates first
      },
    });

    return { success: true, data: { orders } };
  } catch (error) {
    console.error("Error in getAvailableOrders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}
