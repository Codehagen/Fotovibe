"use server";

import { prisma } from "@/lib/db";
import { createInvoice } from "../invoices/create-invoice";

interface MonthlyInvoiceResult {
  workspaceId: string;
  success: boolean;
  error?: string;
}

export async function processMonthlyInvoices(): Promise<
  MonthlyInvoiceResult[]
> {
  try {
    // Get all orders that need invoicing (one month old and no invoice)
    const ordersNeedingInvoice = await prisma.order.findMany({
      where: {
        Invoice: null, // No invoice created yet
        orderDate: {
          lt: new Date(), // Order is in the past
        },
      },
      include: {
        workspace: {
          include: {
            subscriptions: {
              where: {
                isActive: true,
                OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
              },
              include: {
                plan: true,
              },
            },
          },
        },
      },
    });

    const results: MonthlyInvoiceResult[] = [];

    for (const order of ordersNeedingInvoice) {
      // Only process if workspace has active subscription
      if (order.workspace.subscriptions.length > 0) {
        try {
          const invoiceResult = await createInvoice({
            orderId: order.id,
            workspaceId: order.workspaceId,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          });

          results.push({
            workspaceId: order.workspaceId,
            success: invoiceResult.success,
            error: invoiceResult.error,
          });
        } catch (error) {
          results.push({
            workspaceId: order.workspaceId,
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create invoice",
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error processing monthly invoices:", error);
    throw error;
  }
}
