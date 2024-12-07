"use server";

import { prisma } from "@/lib/db";

interface SubscriptionData {
  id: string;
  workspaceId: string;
  plan: {
    id: string;
    name: string;
    monthlyPrice: number;
    yearlyMonthlyPrice: number;
  };
  isYearly: boolean;
  isActive: boolean;
  startDate: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

interface GetWorkspaceSubscriptionResult {
  success: boolean;
  error?: string;
  data: {
    subscription: SubscriptionData | null;
    usage: {
      photosUsed: number;
      videosUsed: number;
      locationsUsed: number;
    };
    invoices: any[];
  };
}

export async function getWorkspaceSubscription(
  workspaceId: string
): Promise<GetWorkspaceSubscriptionResult> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        workspaceId,
        isActive: true,
      },
      include: {
        plan: true,
      },
    });

    console.log("Found subscription:", subscription);

    // Always return a consistent structure
    return {
      success: true,
      data: {
        subscription: subscription
          ? {
              id: subscription.id,
              workspaceId: subscription.workspaceId,
              plan: {
                id: subscription.plan.id,
                name: subscription.plan.name,
                monthlyPrice: subscription.plan.monthlyPrice,
                yearlyMonthlyPrice: subscription.plan.yearlyMonthlyPrice,
              },
              isYearly: subscription.isYearly,
              isActive: subscription.isActive,
              startDate: subscription.startDate,
              currentPeriodEnd: subscription.currentPeriodEnd,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            }
          : null,
        usage: {
          photosUsed: 0, // Implement actual usage counting
          videosUsed: 0,
          locationsUsed: 0,
        },
        invoices: [],
      },
    };
  } catch (error) {
    console.error("Error getting workspace subscription:", error);
    return {
      success: false,
      error: "Failed to get workspace subscription",
      data: {
        subscription: null,
        usage: {
          photosUsed: 0,
          videosUsed: 0,
          locationsUsed: 0,
        },
        invoices: [],
      },
    };
  }
}
