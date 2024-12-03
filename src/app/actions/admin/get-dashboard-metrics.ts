"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { OrderStatus } from "@prisma/client";
import {
  differenceInDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
} from "date-fns";

interface DashboardMetrics {
  activeWorkspaces: number;
  activeOrders: {
    current: number;
    previousMonth: number;
    percentageChange: number;
  };
  averageDeliveryTime: {
    current: number;
    previousMonth: number;
    percentageChange: number;
  };
  customerSatisfaction: {
    rating: number;
    totalReviews: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    date: Date;
  }>;
  monthlyOrders: Array<{
    month: Date;
    total: number;
    completed: number;
    active: number;
  }>;
  photographerPerformance: Array<{
    id: string;
    name: string;
    metrics: {
      totalOrders: number;
      completedOrders: number;
      averageDeliveryTime: number;
      customerRating: number;
      activeOrders: number;
    };
  }>;
  editorPerformance: Array<{
    id: string;
    name: string;
    metrics: {
      totalOrders: number;
      completedOrders: number;
      averageDeliveryTime: number;
      activeOrders: number;
    };
  }>;
}

export async function getDashboardMetrics(): Promise<{
  success: boolean;
  data?: DashboardMetrics;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      throw new Error("Unauthorized");
    }

    const now = new Date();
    const currentMonth = {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };
    const previousMonth = {
      start: startOfMonth(subMonths(now, 1)),
      end: endOfMonth(subMonths(now, 1)),
    };

    // Get total workspaces (instead of only those with active orders)
    const activeWorkspaces = await prisma.workspace.count();

    // Get active orders for current and previous month
    const currentMonthOrders = await prisma.order.count({
      where: {
        status: {
          in: [
            OrderStatus.NOT_STARTED,
            OrderStatus.IN_PROGRESS,
            OrderStatus.EDITING,
            OrderStatus.IN_REVIEW,
          ],
        },
        orderDate: {
          gte: currentMonth.start,
          lte: currentMonth.end,
        },
      },
    });

    const previousMonthOrders = await prisma.order.count({
      where: {
        status: {
          in: [
            OrderStatus.NOT_STARTED,
            OrderStatus.IN_PROGRESS,
            OrderStatus.EDITING,
            OrderStatus.IN_REVIEW,
          ],
        },
        orderDate: {
          gte: previousMonth.start,
          lte: previousMonth.end,
        },
      },
    });

    // Calculate average delivery time
    const completedOrdersCurrentMonth = await prisma.order.findMany({
      where: {
        status: OrderStatus.COMPLETED,
        completedAt: {
          gte: currentMonth.start,
          lte: currentMonth.end,
        },
      },
      select: {
        orderDate: true,
        completedAt: true,
      },
    });

    const completedOrdersPreviousMonth = await prisma.order.findMany({
      where: {
        status: OrderStatus.COMPLETED,
        completedAt: {
          gte: previousMonth.start,
          lte: previousMonth.end,
        },
      },
      select: {
        orderDate: true,
        completedAt: true,
      },
    });

    const currentDeliveryTime =
      completedOrdersCurrentMonth.reduce((acc, order) => {
        return (
          acc + differenceInDays(order.completedAt!, new Date(order.orderDate))
        );
      }, 0) / (completedOrdersCurrentMonth.length || 1);

    const previousDeliveryTime =
      completedOrdersPreviousMonth.reduce((acc, order) => {
        return (
          acc + differenceInDays(order.completedAt!, new Date(order.orderDate))
        );
      }, 0) / (completedOrdersPreviousMonth.length || 1);

    // Get customer satisfaction metrics
    const reviews = await prisma.feedback.findMany({
      where: {
        createdAt: {
          gte: subMonths(now, 1),
        },
      },
      select: {
        rating: true,
      },
    });

    const averageRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) /
      (reviews.length || 1);

    // Calculate percentage changes with safeguards
    const orderPercentageChange =
      previousMonthOrders === 0
        ? currentMonthOrders > 0
          ? 100
          : 0
        : ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) *
          100;

    const deliveryTimePercentageChange =
      previousDeliveryTime === 0
        ? currentDeliveryTime > 0
          ? 100
          : 0
        : ((currentDeliveryTime - previousDeliveryTime) /
            previousDeliveryTime) *
          100;

    // Get recent activities
    const recentActivities = await prisma.statusHistory.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        notes: true,
        createdAt: true,
        order: {
          select: {
            id: true,
            workspace: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Get monthly orders for the last 12 months
    const monthsInterval = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), 11), // Last 12 months
      end: endOfMonth(now),
    });

    const monthlyOrders = await Promise.all(
      monthsInterval.map(async (month) => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);

        const [total, completed, active] = await Promise.all([
          // Total orders for month
          prisma.order.count({
            where: {
              orderDate: {
                gte: start,
                lte: end,
              },
            },
          }),
          // Completed orders
          prisma.order.count({
            where: {
              orderDate: {
                gte: start,
                lte: end,
              },
              status: OrderStatus.COMPLETED,
            },
          }),
          // Active orders
          prisma.order.count({
            where: {
              orderDate: {
                gte: start,
                lte: end,
              },
              status: {
                in: [
                  OrderStatus.NOT_STARTED,
                  OrderStatus.IN_PROGRESS,
                  OrderStatus.EDITING,
                  OrderStatus.IN_REVIEW,
                ],
              },
            },
          }),
        ]);

        return {
          month,
          total,
          completed,
          active,
        };
      })
    );

    const photographerPerformance = await prisma.photographer.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        orders: {
          select: {
            status: true,
            orderDate: true,
            completedAt: true,
          },
        },
      },
    });

    const performanceMetrics = photographerPerformance.map((photographer) => {
      const totalOrders = photographer.orders.length;
      const completedOrders = photographer.orders.filter(
        (order) => order.status === "COMPLETED"
      ).length;
      const activeOrders = photographer.orders.filter((order) =>
        ["NOT_STARTED", "IN_PROGRESS"].includes(order.status)
      ).length;

      const deliveryTimes = photographer.orders
        .filter((order) => order.completedAt)
        .map((order) =>
          differenceInDays(order.completedAt!, new Date(order.orderDate))
        );

      const averageDeliveryTime =
        deliveryTimes.length > 0
          ? deliveryTimes.reduce((acc, time) => acc + time, 0) /
            deliveryTimes.length
          : 0;

      return {
        id: photographer.id,
        name: photographer.name || "Ukjent",
        metrics: {
          totalOrders,
          completedOrders,
          averageDeliveryTime,
          customerRating: 0,
          activeOrders,
        },
      };
    });

    const editorPerformance = await prisma.editor.findMany({
      select: {
        id: true,
        name: true,
        orders: {
          select: {
            status: true,
            editingStartedAt: true,
            completedAt: true,
          },
          where: {
            status: {
              in: [
                OrderStatus.EDITING,
                OrderStatus.IN_REVIEW,
                OrderStatus.COMPLETED,
              ],
            },
          },
        },
      },
    });

    const editorMetrics = editorPerformance.map((editor) => {
      const totalOrders = editor.orders.length;
      const completedOrders = editor.orders.filter(
        (order) => order.status === OrderStatus.COMPLETED
      ).length;
      const activeOrders = editor.orders.filter((order) =>
        [OrderStatus.EDITING, OrderStatus.IN_REVIEW].includes(order.status)
      ).length;

      const deliveryTimes = editor.orders
        .filter((order) => order.completedAt && order.editingStartedAt)
        .map((order) =>
          differenceInDays(order.completedAt!, order.editingStartedAt!)
        );

      const averageDeliveryTime =
        deliveryTimes.length > 0
          ? deliveryTimes.reduce((acc, time) => acc + time, 0) /
            deliveryTimes.length
          : 0;

      return {
        id: editor.id,
        name: editor.name || "Ukjent",
        metrics: {
          totalOrders,
          completedOrders,
          averageDeliveryTime,
          activeOrders,
        },
      };
    });

    return {
      success: true,
      data: {
        activeWorkspaces,
        activeOrders: {
          current: currentMonthOrders,
          previousMonth: previousMonthOrders,
          percentageChange: orderPercentageChange,
        },
        averageDeliveryTime: {
          current: currentDeliveryTime,
          previousMonth: previousDeliveryTime,
          percentageChange: deliveryTimePercentageChange,
        },
        customerSatisfaction: {
          rating: averageRating,
          totalReviews: reviews.length,
        },
        recentActivity: recentActivities.map((activity) => ({
          id: activity.id,
          type: activity.status,
          message: `${activity.order.workspace.name}: ${activity.notes}`,
          date: activity.createdAt,
        })),
        monthlyOrders,
        photographerPerformance: performanceMetrics,
        editorPerformance: editorMetrics,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch metrics",
    };
  }
}
