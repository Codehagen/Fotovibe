"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { OrderStatus } from "@prisma/client";

export async function getMyOrders(type: "active" | "completed") {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get photographer profile
    const photographer = await prisma.photographer.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!photographer) {
      throw new Error("Photographer profile not found");
    }

    // Get orders based on type
    const orders = await prisma.order.findMany({
      where: {
        photographerId: photographer.id,
        status: {
          in:
            type === "active"
              ? [
                  OrderStatus.NOT_STARTED,
                  OrderStatus.IN_PROGRESS,
                  OrderStatus.EDITING,
                  OrderStatus.IN_REVIEW,
                ]
              : [OrderStatus.COMPLETED],
        },
      },
      select: {
        id: true,
        orderDate: true,
        location: true,
        status: true,
        workspace: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        orderDate: type === "active" ? "asc" : "desc",
      },
    });

    return { success: true, data: { orders } };
  } catch (error) {
    console.error("Error in getMyOrders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}
