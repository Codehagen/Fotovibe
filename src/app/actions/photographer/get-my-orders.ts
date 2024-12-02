"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getMyOrders() {
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

    // Get photographer's orders
    const orders = await prisma.order.findMany({
      where: {
        photographerId: photographer.id,
        status: {
          not: "PENDING_PHOTOGRAPHER",
        },
      },
      select: {
        id: true,
        orderDate: true,
        scheduledDate: true,
        location: true,
        status: true,
        workspace: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
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