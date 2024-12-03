"use server";

import { prisma } from "@/lib/db";
import { createFikenInvoice } from "@/lib/fiken";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";

export async function testFikenInvoice() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get user's workspace
    const userWithWorkspace = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        workspaces: {
          take: 1,
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const workspace = userWithWorkspace?.workspaces[0];
    if (!workspace) {
      throw new Error("No workspace found for user");
    }

    const result = await createFikenInvoice({
      orderId: `TEST-${Date.now()}`,
      workspaceId: workspace.id,
      amount: 1250,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      description: `Test faktura for ${workspace.name}\nDette er en test av Fiken integrasjonen`,
    });

    revalidatePath("/admin");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error testing Fiken invoice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to test invoice",
    };
  }
}
