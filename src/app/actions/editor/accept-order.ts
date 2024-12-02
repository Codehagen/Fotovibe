"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export async function acceptEditorOrder(orderId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if order is ready for editing
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        editorId: true,
        status: true,
        checklist: {
          select: {
            dropboxUrl: true,
          },
        },
      },
    });

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    if (existingOrder.editorId || existingOrder.status !== "EDITING") {
      throw new Error("This order is not available for editing");
    }

    if (!existingOrder.checklist?.dropboxUrl) {
      throw new Error("No media uploaded yet");
    }

    // Get or create editor profile
    let editor = await prisma.editor.findUnique({
      where: { clerkId: userId },
    });

    if (!editor) {
      // Create editor profile if it doesn't exist
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      editor = await prisma.editor.create({
        data: {
          clerkId: userId,
          name: user?.name || null,
          email: user?.email || null,
          language: "norwegian",
        },
      });
    }

    // Update order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          editorId: editor.id,
          editingStartedAt: new Date(),
        },
      });

      // Create status history
      await tx.statusHistory.create({
        data: {
          orderId: updatedOrder.id,
          status: OrderStatus.EDITING,
          changedBy: userId,
          notes: "Editor har tatt oppdraget",
        },
      });

      return updatedOrder;
    });

    revalidatePath("/editor");
    revalidatePath("/ordre");
    return { success: true, order };
  } catch (error) {
    console.error("Error in acceptEditorOrder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept order",
    };
  }
}
