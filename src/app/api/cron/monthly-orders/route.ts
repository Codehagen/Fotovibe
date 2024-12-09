import { prisma } from "@/lib/db";
import { createWorkspaceOrder } from "@/app/actions/admin/create-workspace-order";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { logCronJob } from "@/lib/cron-logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  // Verify the request is coming from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all active subscriptions with their last order
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

    const results: Array<{
      workspaceId: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const subscription of activeSubscriptions) {
      const lastOrder = subscription.workspace.orders[0];
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Check if it's been a month since the last order
      if (!lastOrder || lastOrder.orderDate < oneMonthAgo) {
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

    await logCronJob({
      jobName: "monthly-orders",
      status: "SUCCESS",
      message: "Monthly orders processed successfully",
      details: { results },
    });

    return NextResponse.json({
      success: true,
      message: "Monthly orders processed",
      results,
    });
  } catch (error) {
    await logCronJob({
      jobName: "monthly-orders",
      status: "ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
      details: { error },
    });

    console.error("Error processing monthly orders:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process monthly orders",
      },
      { status: 500 }
    );
  }
}
