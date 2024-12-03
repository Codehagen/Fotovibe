"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getWorkspace(id: string) {
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

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            orders: true,
          },
        },
        orders: {
          select: {
            status: true,
          },
        },
        subscriptions: {
          where: {
            isActive: true,
          },
          orderBy: {
            startDate: "desc",
          },
          take: 1,
        },
        invoices: {
          orderBy: {
            dueDate: "desc",
          },
          take: 12,
        },
      },
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Calculate order counts
    const activeOrders =
      workspace?.orders.filter(
        (order) =>
          order.status !== "COMPLETED" &&
          order.status !== "CANCELLED" &&
          order.status !== "PENDING_PHOTOGRAPHER"
      ).length || 0;

    const completedOrders =
      workspace?.orders.filter((order) => order.status === "COMPLETED")
        .length || 0;

    return {
      success: true,
      data: {
        ...workspace,
        _count: {
          ...workspace._count,
          activeOrders,
          completedOrders,
        },
      },
    };
  } catch (error) {
    console.error("Error in getWorkspace:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch workspace",
    };
  }
}
