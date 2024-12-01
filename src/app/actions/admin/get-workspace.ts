"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getWorkspace(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized: No user found");
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperUser: true },
    });

    if (!user?.isSuperUser) {
      throw new Error("Unauthorized: Admin access required");
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            orders: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return { success: true, data: workspace };
  } catch (error) {
    console.error("Error in getWorkspace:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch workspace",
    };
  }
}
