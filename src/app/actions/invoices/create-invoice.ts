"use server";

import { prisma } from "@/lib/db";
import { createFikenInvoice } from "@/lib/fiken";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";

interface CreateInvoiceInput {
  orderId: string;
  workspaceId: string;
  amount: number;
  dueDate?: Date;
}

export async function createInvoice(input: CreateInvoiceInput) {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      throw new Error("Unauthorized");
    }

    // Create invoice in Fiken (placeholder for now)
    const fikenResult = await createFikenInvoice(input);

    // Create invoice in our database
    const invoice = await prisma.invoice.create({
      data: {
        orderId: input.orderId,
        workspaceId: input.workspaceId,
        amount: input.amount,
        dueDate: input.dueDate,
        fikenId: fikenResult.fikenId,
        status: "SENT", // Mark as sent since it's "created" in Fiken
      },
    });

    revalidatePath("/admin");
    revalidatePath(`/ordre/${input.orderId}`);

    return { success: true, data: invoice };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}
