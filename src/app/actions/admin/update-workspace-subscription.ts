"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";

interface UpdateSubscriptionResult {
  success: boolean;
  error?: string;
  subscription?: any;
}

export async function updateWorkspaceSubscription(
  workspaceId: string,
  planId: string,
  isYearly: boolean
): Promise<UpdateSubscriptionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // First verify the plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return {
        success: false,
        error: "Selected plan does not exist",
      };
    }

    // Calculate period dates
    const startDate = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Use a transaction to ensure data consistency
    const subscription = await prisma.$transaction(async (tx) => {
      // First deactivate all active subscriptions for this workspace
      await tx.subscription.updateMany({
        where: {
          workspaceId,
          isActive: true,
        },
        data: {
          isActive: false,
          endDate: startDate,
        },
      });

      // Then create the new subscription
      return tx.subscription.create({
        data: {
          workspace: {
            connect: { id: workspaceId },
          },
          plan: {
            connect: { id: planId },
          },
          isActive: true,
          isYearly,
          startDate,
          currentPeriodStart: startDate,
          currentPeriodEnd,
        },
        include: {
          plan: true,
          workspace: true,
        },
      });
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/workspaces/${workspaceId}`);

    return {
      success: true,
      subscription,
    };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update subscription",
    };
  }
}
