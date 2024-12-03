"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface UpdateSubscriptionInput {
  name: string;
  package: "basic" | "premium" | "enterprise";
  amount: number;
  isActive: boolean;
}

export async function updateSubscription(
  workspaceId: string,
  input: UpdateSubscriptionInput
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperUser: true },
    });

    if (!user?.isSuperUser) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update or create subscription
    const subscription = await prisma.subscription.upsert({
      where: {
        workspaceId,
      },
      update: {
        name: input.name,
        package: input.package,
        amount: input.amount,
        isActive: input.isActive,
        endDate: input.isActive ? null : new Date(),
      },
      create: {
        workspaceId,
        name: input.name,
        package: input.package,
        amount: input.amount,
        isActive: input.isActive,
        startDate: new Date(),
      },
    });

    revalidatePath(`/admin/workspaces/${workspaceId}`);
    return { success: true, data: subscription };
  } catch (error) {
    console.error("Error in updateSubscription:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update subscription",
    };
  }
}
