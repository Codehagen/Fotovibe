"use server";

import { prisma } from "@/lib/db";

export async function getWorkspaceSubscription(workspaceId: string) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        workspaceId,
        isActive: true,
      },
      select: {
        id: true,
        workspaceId: true,
        customMonthlyPrice: true,
        plan: {
          select: {
            id: true,
            name: true,
            monthlyPrice: true,
            yearlyMonthlyPrice: true,
          },
        },
        isYearly: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
      },
    });

    // Get usage stats for current period
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const usage = await prisma.order.aggregate({
      where: {
        workspaceId,
        orderDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      _sum: {
        photoCount: true,
        videoCount: true,
      },
      _count: true,
    });

    // Get recent invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return {
      success: true,
      data: {
        subscription,
        usage: {
          photosUsed: usage._sum.photoCount || 0,
          videosUsed: usage._sum.videoCount || 0,
          locationsUsed: usage._count || 0,
        },
        invoices,
      },
    };
  } catch (error) {
    console.error("Error fetching workspace subscription:", error);
    return {
      success: false,
      error: "Failed to fetch subscription details",
    };
  }
}
