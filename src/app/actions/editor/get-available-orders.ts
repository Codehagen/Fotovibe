"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";

export async function getAvailableEditorOrders() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Both superAdmin and editors can see available orders
    const orders = await prisma.order.findMany({
      where: {
        status: "EDITING",
        editorId: null, // Only orders not assigned to an editor
      },
      include: {
        workspace: true,
        photographer: true,
        checklist: true,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error("Error in getAvailableEditorOrders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}
