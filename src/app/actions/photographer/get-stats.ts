"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { OrderStatus } from "@prisma/client";

interface PhotographerStats {
  availableOrders: number;
  activeOrders: number;
  completedOrders: number;
  nextShoot: Date | null;
}

export async function getPhotographerStats(): Promise<{
  success: boolean;
  data?: PhotographerStats;
  error?: string;
}> {
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

    // Get stats in parallel
    const [availableOrders, activeOrders, completedOrders, nextShoot] =
      await Promise.all([
        // Available orders
        prisma.order.count({
          where: {
            status: OrderStatus.PENDING_PHOTOGRAPHER,
            photographerId: null,
          },
        }),

        // Active orders
        prisma.order.count({
          where: {
            photographerId: photographer.id,
            status: {
              in: [OrderStatus.NOT_STARTED, OrderStatus.IN_PROGRESS],
            },
          },
        }),

        // Completed orders
        prisma.order.count({
          where: {
            photographerId: photographer.id,
            status: OrderStatus.COMPLETED,
          },
        }),

        // Next shoot
        prisma.order.findFirst({
          where: {
            photographerId: photographer.id,
            scheduledDate: {
              gte: new Date(), // Future dates only
            },
            status: {
              in: [OrderStatus.NOT_STARTED, OrderStatus.IN_PROGRESS],
            },
          },
          orderBy: {
            scheduledDate: "asc",
          },
          select: {
            scheduledDate: true,
          },
        }),
      ]);

    return {
      success: true,
      data: {
        availableOrders,
        activeOrders,
        completedOrders,
        nextShoot: nextShoot?.scheduledDate || null,
      },
    };
  } catch (error) {
    console.error("Error in getPhotographerStats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
    };
  }
}
