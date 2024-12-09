import { prisma } from "@/lib/db";
import { createWorkspaceOrder } from "@/app/actions/admin/create-workspace-order";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { logCronJob } from "@/lib/cron-logger";
import { processMonthlyInvoices } from "@/app/actions/cron/monthly-invoice";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  // Verify the request is coming from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First create new orders for subscriptions
    const orderResults = await createMonthlyOrders();

    // Then process invoices for any orders that need them
    const invoiceResults = await processMonthlyInvoices();

    await logCronJob({
      jobName: "monthly-orders-and-invoices",
      status: "SUCCESS",
      message: "Monthly orders and invoices processed successfully",
      details: {
        orders: orderResults,
        invoices: invoiceResults,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Monthly orders and invoices processed",
      results: {
        orders: orderResults,
        invoices: invoiceResults,
      },
    });
  } catch (error) {
    await logCronJob({
      jobName: "monthly-orders-and-invoices",
      status: "ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
      details: { error },
    });

    console.error("Error processing monthly orders and invoices:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process monthly orders and invoices",
      },
      { status: 500 }
    );
  }
}

// Separate function for creating orders
export async function createMonthlyOrders() {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      isActive: true,
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    include: {
      plan: true,
      workspace: {
        include: {
          orders: {
            orderBy: {
              orderDate: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });

  const results = [];

  for (const subscription of activeSubscriptions) {
    const lastOrder = subscription.workspace.orders[0];

    if (lastOrder) {
      // Calculate exact one month difference
      const lastOrderDate = new Date(lastOrder.orderDate);
      const nextOrderDue = new Date(lastOrderDate);
      nextOrderDue.setMonth(nextOrderDue.getMonth() + 1);

      // Only create new order if we've passed the exact one month mark
      if (new Date() >= nextOrderDue) {
        // Determine package type and pricing based on plan
        const packageType = subscription.plan.name as
          | "BASIC"
          | "PRO"
          | "ENTERPRISE";
        const packagePrice =
          subscription.customMonthlyPrice ||
          (subscription.isYearly
            ? subscription.plan.yearlyMonthlyPrice
            : subscription.plan.monthlyPrice);
        const yearlyPackagePrice = subscription.plan.yearlyMonthlyPrice;

        try {
          // Create new order
          const orderResult = await createWorkspaceOrder(
            subscription.workspaceId,
            {
              packageType,
              packagePrice,
              yearlyPackagePrice,
              requirements: "Automatisk månedlig ordre",
            }
          );

          results.push({
            workspaceId: subscription.workspaceId,
            success: orderResult.success,
            error: orderResult.error as string | undefined,
          });
        } catch (error) {
          results.push({
            workspaceId: subscription.workspaceId,
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Unknown error creating order",
          });
        }
      }
    } else {
      // No previous order exists, create first order
      // Determine package type and pricing based on plan
      const packageType = subscription.plan.name as
        | "BASIC"
        | "PRO"
        | "ENTERPRISE";
      const packagePrice =
        subscription.customMonthlyPrice ||
        (subscription.isYearly
          ? subscription.plan.yearlyMonthlyPrice
          : subscription.plan.monthlyPrice);
      const yearlyPackagePrice = subscription.plan.yearlyMonthlyPrice;

      try {
        // Create new order
        const orderResult = await createWorkspaceOrder(
          subscription.workspaceId,
          {
            packageType,
            packagePrice,
            yearlyPackagePrice,
            requirements: "Automatisk månedlig ordre",
          }
        );

        results.push({
          workspaceId: subscription.workspaceId,
          success: orderResult.success,
          error: orderResult.error as string | undefined,
        });
      } catch (error) {
        results.push({
          workspaceId: subscription.workspaceId,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error creating order",
        });
      }
    }
  }

  return results;
}
