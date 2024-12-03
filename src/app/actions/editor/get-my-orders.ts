"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";

export async function getMyEditorOrders() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // If superAdmin, return all orders in EDITING status
    if (user.isSuperUser) {
      const orders = await prisma.order.findMany({
        where: {
          status: "EDITING",
        },
        include: {
          workspace: true,
          photographer: true,
          editor: true,
          checklist: true,
          EditorChecklist: true,
        },
        orderBy: {
          uploadedAt: "desc",
        },
      });

      return { success: true, data: orders };
    }

    // For regular editors, check for editor profile
    const editor = await prisma.editor.findUnique({
      where: { clerkId: user.id },
    });

    if (!editor) {
      throw new Error("Editor profile not found");
    }

    const orders = await prisma.order.findMany({
      where: {
        editorId: editor.id,
      },
      include: {
        workspace: true,
        photographer: true,
        editor: true,
        checklist: true,
        EditorChecklist: true,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error("Error in getMyEditorOrders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}
