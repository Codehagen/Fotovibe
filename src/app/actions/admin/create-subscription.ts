"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";

interface CreateSubscriptionParams {
  workspaceId: string;
  planId: string;
  isYearly: boolean;
}

interface CreateSubscriptionResult {
  success: boolean;
  error?: string;
  subscription?: any;
}

export async function createSubscription({
  workspaceId,
  planId,
  isYearly,
}: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
  try {
    console.log("Creating subscription with params:", {
      workspaceId,
      planId,
      isYearly,
    });

    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      console.log("Unauthorized user attempted to create subscription");
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the plan first
    const plan = await prisma.plan.findFirst({
      where: {
        name: planId,
        isActive: true,
      },
    });

    console.log("Found plan:", plan);

    if (!plan) {
      console.log("No plan found with name:", planId);
      return {
        success: false,
        error: "Invalid plan selected",
      };
    }

    // Check if workspace already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        workspaceId,
        isActive: true,
      },
    });

    console.log("Existing subscription:", existingSubscription);

    if (existingSubscription) {
      // Instead of returning error, update the existing subscription
      const updatedSubscription = await prisma.subscription.update({
        where: {
          id: existingSubscription.id,
        },
        data: {
          planId: plan.id,
          isYearly,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        include: {
          plan: true,
          workspace: true,
        },
      });

      console.log("Updated subscription:", updatedSubscription);

      revalidatePath("/admin");
      revalidatePath(`/admin/workspaces/${workspaceId}`);

      return {
        success: true,
        subscription: updatedSubscription,
      };
    }

    console.log("Creating new subscription...");

    const subscription = await prisma.subscription.create({
      data: {
        workspaceId,
        planId: plan.id,
        isYearly,
        isActive: true,
        startDate: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: {
        plan: true,
        workspace: true,
      },
    });

    console.log("Created subscription:", subscription);

    revalidatePath("/admin");
    revalidatePath(`/admin/workspaces/${workspaceId}`);

    return {
      success: true,
      subscription,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create subscription",
    };
  }
}
