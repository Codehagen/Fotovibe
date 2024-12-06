"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { createOrder } from "../orders/create-order";
import { revalidatePath } from "next/cache";

interface CreateWorkspaceOrderInput {
  location: string;
  scheduledDate: Date;
  requirements?: string;
  photoCount?: number;
  videoCount?: number;
}

interface CreateWorkspaceOrderResult {
  success: boolean;
  error?: string | string[];
  order?: any;
}

export async function createWorkspaceOrder(
  workspaceId: string,
  input: CreateWorkspaceOrderInput
): Promise<CreateWorkspaceOrderResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Verify workspace has an active subscription
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        subscriptions: {
          where: {
            isActive: true,
            OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
          },
          include: {
            plan: true,
          },
          orderBy: { startDate: "desc" },
          take: 1,
        },
      },
    });

    if (!workspace) {
      return {
        success: false,
        error: "Workspace not found",
      };
    }

    const activeSubscription = workspace.subscriptions[0];
    if (!activeSubscription) {
      return {
        success: false,
        error: "No active subscription found",
      };
    }

    // Add price logging
    console.log("Order Pricing Details:", {
      planName: activeSubscription.plan.name,
      baseMonthlyPrice: activeSubscription.plan.monthlyPrice,
      yearlyMonthlyPrice: activeSubscription.plan.yearlyMonthlyPrice,
      isYearly: activeSubscription.isYearly,
      customMonthlyPrice: activeSubscription.customMonthlyPrice,
      effectivePrice: activeSubscription.customMonthlyPrice || 
        (activeSubscription.isYearly 
          ? activeSubscription.plan.yearlyMonthlyPrice 
          : activeSubscription.plan.monthlyPrice),
      photoCount: input.photoCount,
      videoCount: input.videoCount,
    });

    // Verify order limits based on subscription plan
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

    const monthlyOrders = await prisma.order.count({
      where: {
        workspaceId,
        orderDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    // Check if adding this order would exceed the plan limits
    const plan = activeSubscription.plan;
    const totalPhotos = (input.photoCount || 0) + monthlyOrders;
    if (totalPhotos > plan.photosPerMonth) {
      return {
        success: false,
        error: `This order would exceed the monthly photo limit of ${plan.photosPerMonth}`,
      };
    }

    if (plan.videosPerMonth !== null) {
      const totalVideos = (input.videoCount || 0) + monthlyOrders;
      if (totalVideos > plan.videosPerMonth) {
        return {
          success: false,
          error: `This order would exceed the monthly video limit of ${plan.videosPerMonth}`,
        };
      }
    }

    // Create the order using the existing createOrder action
    const orderResult = await createOrder({
      workspaceId,
      location: input.location,
      scheduledDate: input.scheduledDate.toISOString(),
      requirements: input.requirements,
      photoCount: input.photoCount,
      videoCount: input.videoCount,
    });

    if (!orderResult.success) {
      return orderResult;
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/workspaces/${workspaceId}`);

    return orderResult;
  } catch (error) {
    console.error("Error creating workspace order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}
