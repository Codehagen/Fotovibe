"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { createInvoice } from "../invoices/create-invoice";

export async function testFikenInvoice() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get user's workspace and a recent order without an invoice
    const userWithWorkspace = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        workspaces: {
          take: 1,
          include: {
            orders: {
              where: {
                Invoice: null, // Only get orders without invoices
              },
              take: 1,
              orderBy: {
                orderDate: "desc",
              },
            },
          },
        },
      },
    });

    const workspace = userWithWorkspace?.workspaces[0];
    const order = workspace?.orders[0];

    if (!workspace || !order) {
      throw new Error("No workspace or uninvoiced order found for user");
    }

    const result = await createInvoice({
      orderId: order.id,
      workspaceId: workspace.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    if (!result.success && result.data) {
      // If there's an existing invoice, log it
      console.log("Existing invoice found:", result.data);
    }

    return result;
  } catch (error) {
    console.error("Error testing Fiken invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to test invoice",
    };
  }
}
