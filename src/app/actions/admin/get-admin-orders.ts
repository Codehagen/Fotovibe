"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { OrderStatus } from "@prisma/client";

export async function getAdminOrders() {
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

    // Get orders and counts in parallel
    const [orders, activeCount, pendingCount, completedCount] =
      await Promise.all([
        prisma.order.findMany({
          include: {
            workspace: {
              select: {
                name: true,
              },
            },
            photographer: {
              select: {
                name: true,
              },
            },
            editor: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            orderDate: "desc",
          },
        }),
        prisma.order.count({
          where: {
            status: {
              in: [
                OrderStatus.NOT_STARTED,
                OrderStatus.IN_PROGRESS,
                OrderStatus.EDITING,
                OrderStatus.IN_REVIEW,
              ],
            },
          },
        }),
        prisma.order.count({
          where: {
            status: OrderStatus.PENDING_PHOTOGRAPHER,
          },
        }),
        prisma.order.count({
          where: {
            status: OrderStatus.COMPLETED,
          },
        }),
      ]);

    return {
      success: true,
      data: {
        orders,
        activeOrders: activeCount,
        pendingOrders: pendingCount,
        completedOrders: completedCount,
      },
    };
  } catch (error) {
    console.error("Error in getAdminOrders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}
