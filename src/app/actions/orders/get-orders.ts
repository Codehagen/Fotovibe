"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getOrders() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized: No user found");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        workspaces: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user?.workspaces[0]?.id) {
      throw new Error("No workspace found for user");
    }

    const workspaceId = user.workspaces[0].id;

    const orders = await prisma.order.findMany({
      where: {
        workspaceId,
      },
      include: {
        photographer: {
          select: {
            name: true,
          },
        },
        workspace: {
          select: {
            name: true,
          },
        },
        checklist: {
          select: {
            contactedAt: true,
            scheduledAt: true,
            dropboxUrl: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
      },
    });

    // Debug log
    orders.forEach((order) => {
      if (order.scheduledDate && order.checklist?.scheduledAt) {
        console.log("Order:", order.id);
        console.log("Original scheduled date:", new Date(order.scheduledDate));
        console.log(
          "Checklist scheduled date:",
          new Date(order.checklist.scheduledAt)
        );
      }
    });

    // Update order status based on checklist progress
    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        let newStatus = order.status;

        // If photographer is assigned and has contacted customer
        if (
          order.photographer &&
          order.checklist?.contactedAt &&
          order.status === "PENDING_PHOTOGRAPHER"
        ) {
          newStatus = "NOT_STARTED";
        }

        // If time is scheduled and order not started
        if (order.checklist?.scheduledAt && order.status === "NOT_STARTED") {
          newStatus = "IN_PROGRESS";
        }

        // Update order if status changed
        if (newStatus !== order.status) {
          await prisma.$transaction([
            prisma.order.update({
              where: { id: order.id },
              data: { status: newStatus },
            }),
            prisma.statusHistory.create({
              data: {
                orderId: order.id,
                status: newStatus,
                changedBy: userId,
                notes: `Status automatisk oppdatert basert på fremdrift`,
              },
            }),
          ]);

          return { ...order, status: newStatus };
        }

        return order;
      })
    );

    return { success: true, data: { orders: updatedOrders } };
  } catch (error) {
    console.error("Error in getOrders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}
