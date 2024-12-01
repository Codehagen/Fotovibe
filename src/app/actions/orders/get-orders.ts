"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { type Order } from "@/components/tables/orders/columns";

interface OrdersResponse {
  orders: Order[];
  totalOrders: number;
}

export async function getOrders(): Promise<{
  success: boolean;
  data?: OrdersResponse;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized: No user found");
    }

    // Get user's workspace
    const userWorkspace = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        workspaces: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!userWorkspace?.workspaces[0]?.id) {
      throw new Error("No workspace found for user");
    }

    const workspaceId = userWorkspace.workspaces[0].id;

    // Get orders for the workspace
    const orders = await prisma.order.findMany({
      where: {
        workspaceId: workspaceId,
      },
      select: {
        id: true,
        photographerId: true,
        photographer: {
          select: {
            name: true,
          },
        },
        editorId: true,
        editor: {
          select: {
            name: true,
          },
        },
        workspaceId: true,
        orderDate: true,
        scheduledDate: true,
        location: true,
        status: true,
        requirements: true,
        photoCount: true,
        videoCount: true,
        deliveryDate: true,
        cancelReason: true,
        startedAt: true,
        editingStartedAt: true,
        reviewStartedAt: true,
        completedAt: true,
        workspace: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
      },
    });

    // Count total orders
    const totalOrders = await prisma.order.count({
      where: {
        workspaceId: workspaceId,
      },
    });

    // Transform the data to include customerName (using workspace name for now)
    const transformedOrders = orders.map((order) => {
      const { workspace, ...orderData } = order;
      return {
        ...orderData,
        customerName: workspace.name,
      };
    });

    return {
      success: true,
      data: {
        orders: transformedOrders,
        totalOrders,
      },
    };
  } catch (error) {
    console.error("Error in getOrders:", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred while fetching orders",
    };
  }
}
