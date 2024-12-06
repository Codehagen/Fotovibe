"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";

export async function cancelWorkspaceSubscription(subscriptionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/workspaces/[id]");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return {
      success: false,
      error: "Failed to cancel subscription",
    };
  }
}
