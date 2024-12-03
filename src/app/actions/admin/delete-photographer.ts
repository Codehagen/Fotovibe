"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";

interface DeletePhotographerResponse {
  success: boolean;
  error?: string;
}

export async function deletePhotographer(
  photographerId: string
): Promise<DeletePhotographerResponse> {
  try {
    const user = await getCurrentUser();

    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // Check if photographer has any active orders
    const photographerWithOrders = await prisma.photographer.findUnique({
      where: { id: photographerId },
      select: {
        orders: {
          where: {
            status: {
              in: ["NOT_STARTED", "IN_PROGRESS", "EDITING", "IN_REVIEW"],
            },
          },
        },
      },
    });

    if (photographerWithOrders?.orders.length ?? 0 > 0) {
      return {
        success: false,
        error: "Cannot delete photographer with active orders",
      };
    }

    // Instead of hard deleting, we'll soft delete by setting isActive to false
    await prisma.photographer.update({
      where: { id: photographerId },
      data: {
        isActive: false,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting photographer:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete photographer",
    };
  }
}
