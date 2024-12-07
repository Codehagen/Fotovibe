"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";

interface UpdateSubscriptionParams {
  subscriptionId: string;
  planName: string;
}

interface UpdateSubscriptionResult {
  success: boolean;
  error?: string;
  subscription?: any;
}

export async function updateSubscription({
  subscriptionId,
  planName,
}: UpdateSubscriptionParams): Promise<UpdateSubscriptionResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the new plan
    const plan = await prisma.plan.findFirst({
      where: {
        name: planName,
        isActive: true,
      },
    });

    if (!plan) {
      return {
        success: false,
        error: "Invalid plan selected",
      };
    }

    // Update the subscription
    const subscription = await prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        planId: plan.id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: {
        plan: true,
        workspace: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/workspaces/${subscription.workspaceId}`);

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
