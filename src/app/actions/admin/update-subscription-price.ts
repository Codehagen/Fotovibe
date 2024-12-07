"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";

interface UpdateSubscriptionPriceResult {
  success: boolean;
  error?: string;
  subscription?: any;
}

export async function updateSubscriptionPrice(
  subscriptionId: string,
  newMonthlyPrice: number
): Promise<UpdateSubscriptionPriceResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const subscription = await prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        customMonthlyPrice: newMonthlyPrice,
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
    console.error("Error updating subscription price:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update price",
    };
  }
}
