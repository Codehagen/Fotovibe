"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteWorkspaceUser(userId: string) {
  try {
    const { userId: adminId } = await auth();
    if (!adminId) {
      throw new Error("Unauthorized: No user found");
    }

    // Verify user is admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { isSuperUser: true },
    });

    if (!admin?.isSuperUser) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get workspace ID before deletion for revalidation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { workspaces: { select: { id: true } } },
    });

    // Delete in transaction to handle related records
    await prisma.$transaction(async (tx) => {
      // Delete audit logs first
      await tx.auditLog.deleteMany({
        where: { userId },
      });

      // Delete user's workspace connections
      await tx.user.update({
        where: { id: userId },
        data: {
          workspaces: {
            set: [], // Remove all workspace connections
          },
        },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId },
      });

      // Create deletion audit log with admin ID
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "USER_DELETED",
          entity: "USER",
          entityId: userId,
        },
      });
    });

    if (user?.workspaces[0]?.id) {
      revalidatePath(`/admin/workspaces/${user.workspaces[0].id}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteWorkspaceUser:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}
