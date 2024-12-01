"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { type Order } from "@/components/admin/workspace-orders";

interface WorkspaceOrdersResponse {
  orders: Order[];
  totalOrders: number;
}

export async function getWorkspaceOrders(workspaceId: string): Promise<{
  success: boolean;
  data?: WorkspaceOrdersResponse;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized: No user found");
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperUser: true },
    });

    if (!user?.isSuperUser) {
      throw new Error("Unauthorized: Admin access required");
    }

    const orders = await prisma.order.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        photographer: {
          select: {
            name: true,
          },
        },
        editor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
      },
    });

    const totalOrders = await prisma.order.count({
      where: {
        workspaceId: workspaceId,
      },
    });

    return {
      success: true,
      data: {
        orders,
        totalOrders,
      },
    };
  } catch (error) {
    console.error("Error in getWorkspaceOrders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}
