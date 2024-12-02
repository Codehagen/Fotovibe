"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getAvailableEditorOrders() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get orders that are ready for editing
    const orders = await prisma.order.findMany({
      where: {
        status: "EDITING",
        editorId: null, // Not assigned to any editor
        checklist: {
          dropboxUrl: {
            not: null, // Has uploaded media
          },
        },
      },
      select: {
        id: true,
        orderDate: true,
        location: true,
        workspace: {
          select: {
            name: true,
          },
        },
        photographer: {
          select: {
            name: true,
          },
        },
        checklist: {
          select: {
            dropboxUrl: true,
          },
        },
      },
      orderBy: {
        editingStartedAt: "asc", // Show oldest first
      },
    });

    return { success: true, data: { orders } };
  } catch (error) {
    console.error("Error in getAvailableEditorOrders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}
