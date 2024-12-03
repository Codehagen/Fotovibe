"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";

interface DeleteEditorResponse {
  success: boolean;
  error?: string;
}

export async function deleteEditor(
  editorId: string
): Promise<DeleteEditorResponse> {
  try {
    const user = await getCurrentUser();

    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // Check if editor has any active orders
    const editorWithOrders = await prisma.editor.findUnique({
      where: { id: editorId },
      select: {
        orders: {
          where: {
            status: {
              in: ["NOT_STARTED", "IN_PROGRESS", "EDITING", "IN_REVIEW"],
            },
          },
        },
      },
    });

    if (editorWithOrders?.orders.length ?? 0 > 0) {
      return {
        success: false,
        error: "Cannot delete editor with active orders",
      };
    }

    // Delete the editor
    await prisma.editor.delete({
      where: { id: editorId },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting editor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete editor",
    };
  }
}
