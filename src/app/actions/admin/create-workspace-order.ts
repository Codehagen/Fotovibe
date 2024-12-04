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

export async function createWorkspaceOrder(
  workspaceId: string,
  input: CreateWorkspaceOrderInput
) {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
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

    return orderResult;
  } catch (error) {
    console.error("Error creating workspace order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}
