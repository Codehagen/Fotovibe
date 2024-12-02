"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getOrder(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        workspace: true,
        photographer: {
          select: {
            id: true,
            name: true,
            email: true,
            clerkId: true,
          },
        },
        editor: {
          select: {
            id: true,
            name: true,
            email: true,
            clerkId: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            status: true,
            notes: true,
            createdAt: true,
          },
        },
        checklist: true,
        EditorChecklist: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Error in getOrder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch order",
    };
  }
}
