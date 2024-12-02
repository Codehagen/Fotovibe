"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

interface UpdateChecklistInput {
  type: "start" | "upload" | "complete";
}

export async function updateEditorChecklist(
  orderId: string,
  input: UpdateChecklistInput
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify editor has access to this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        editor: {
          select: {
            id: true,
            clerkId: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (!order.editor || order.editor.clerkId !== userId) {
      throw new Error("Unauthorized: Not your order");
    }

    // Update in transaction
    const [checklist] = await prisma.$transaction([
      // Update checklist
      prisma.editorChecklist.upsert({
        where: { orderId },
        create: {
          orderId,
          editingStartedAt: input.type === "start" ? new Date() : null,
          uploadedAt: input.type === "upload" ? new Date() : null,
          completedAt: input.type === "complete" ? new Date() : null,
        },
        update: {
          editingStartedAt: input.type === "start" ? new Date() : undefined,
          uploadedAt: input.type === "upload" ? new Date() : undefined,
          completedAt: input.type === "complete" ? new Date() : undefined,
        },
      }),

      // Create status history
      prisma.statusHistory.create({
        data: {
          orderId,
          status:
            input.type === "complete" ? OrderStatus.IN_REVIEW : order.status,
          changedBy: userId,
          notes:
            input.type === "start"
              ? "Editor har startet redigering"
              : input.type === "upload"
              ? "Editor har lastet opp filer"
              : "Editor har sendt til gjennomgang",
        },
      }),

      // Update order status if complete
      ...(input.type === "complete"
        ? [
            prisma.order.update({
              where: { id: orderId },
              data: {
                status: OrderStatus.IN_REVIEW,
              },
            }),
          ]
        : []),
    ]);

    revalidatePath(`/editor/ordre/${orderId}`);
    revalidatePath("/editor");
    return { success: true, checklist };
  } catch (error) {
    console.error("Error in updateEditorChecklist:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update checklist",
    };
  }
}
