"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";

export async function getUserInvoices() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Get all invoices for workspaces the user has access to
    const invoices = await prisma.invoice.findMany({
      where: {
        workspace: {
          users: {
            some: {
              id: user.id,
            },
          },
        },
      },
      include: {
        workspace: {
          select: {
            name: true,
          },
        },
        order: {
          select: {
            orderDate: true,
            location: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: invoices };
  } catch (error) {
    console.error("Error fetching user invoices:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch invoices",
    };
  }
}
