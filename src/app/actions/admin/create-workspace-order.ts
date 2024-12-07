"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { createOrder } from "../orders/create-order";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

interface CreateWorkspaceOrderInput {
  packageType: "BASIC" | "PRO" | "ENTERPRISE";
  packagePrice: number;
  yearlyPackagePrice: number;
  requirements?: string;
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
      effectivePrice:
        activeSubscription.customMonthlyPrice ||
        (activeSubscription.isYearly
          ? activeSubscription.plan.yearlyMonthlyPrice
          : activeSubscription.plan.monthlyPrice),
      packageType: input.packageType,
      packagePrice: input.packagePrice,
      yearlyPackagePrice: input.yearlyPackagePrice,
    });

    // Create the order using the existing createOrder action
    const orderResult = await createOrder({
      workspaceId,
      status: OrderStatus.PENDING_PHOTOGRAPHER,
      requirements: input.requirements,
      packageType: input.packageType,
      packagePrice: activeSubscription.isYearly
        ? input.yearlyPackagePrice
        : input.packagePrice,
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
