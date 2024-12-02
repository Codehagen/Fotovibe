"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getMyEditorOrders() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get editor profile
    const editor = await prisma.editor.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!editor) {
      throw new Error("Editor profile not found");
    }

    // Get editor's orders
    const orders = await prisma.order.findMany({
      where: {
        editorId: editor.id,
      },
      select: {
        id: true,
        orderDate: true,
        location: true,
        status: true,
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
        editingStartedAt: "desc",
      },
    });

    return { success: true, data: { orders } };
  } catch (error) {
    console.error("Error in getMyEditorOrders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}
