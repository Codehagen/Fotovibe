"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

interface SubscriptionResponse {
  subscription: {
    name: string;
    package: "basic" | "premium" | "enterprise";
    amount: number;
    isActive: boolean;
  } | null;
  usage: {
    photosUsed: number;
    videosUsed: number;
    locationsUsed: number;
  };
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    dueDate: Date;
    fikenId: string | null;
  }>;
}

export async function getWorkspaceSubscription(workspaceId: string): Promise<{
  success: boolean;
  data?: SubscriptionResponse;
  error?: string;
}> {
  try {
    console.log(
      "Starting getWorkspaceSubscription for workspace:",
      workspaceId
    );

    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized: No user found");
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperUser: true },
    });

    if (!user?.isSuperUser) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get active subscription
    const subscription = await prisma.subscription.findUnique({
      where: {
        workspaceId,
      },
    });
    console.log("Found subscription:", subscription);

    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usage = await prisma.order.aggregate({
      where: {
        workspaceId,
        orderDate: {
          gte: startOfMonth,
        },
        status: {
          not: "CANCELLED",
        },
      },
      _sum: {
        photoCount: true,
        videoCount: true,
      },
      _count: {
        location: true,
      },
    });
    console.log("Current usage:", usage);

    // Get recent invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        dueDate: "desc",
      },
      take: 12, // Last 12 months
    });
    console.log("Recent invoices:", invoices);

    return {
      success: true,
      data: {
        subscription: subscription
          ? {
              name: subscription.name,
              package: subscription.package as
                | "basic"
                | "premium"
                | "enterprise",
              amount: subscription.amount,
              isActive: subscription.isActive,
            }
          : null,
        usage: {
          photosUsed: usage._sum.photoCount || 0,
          videosUsed: usage._sum.videoCount || 0,
          locationsUsed: usage._count.location || 0,
        },
        invoices,
      },
    };
  } catch (error) {
    console.error("Error in getWorkspaceSubscription:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch subscription",
    };
  }
}
