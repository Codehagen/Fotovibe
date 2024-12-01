"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateWorkspaceUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["ADMIN", "USER", "PHOTOGRAPHER", "EDITOR"]),
  phone: z.string().optional(),
});

export async function updateWorkspaceUser(
  input: z.infer<typeof updateWorkspaceUserSchema>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized: No user found");
    }

    // Verify user is admin
    const admin = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperUser: true },
    });

    if (!admin?.isSuperUser) {
      throw new Error("Unauthorized: Admin access required");
    }

    const validatedFields = updateWorkspaceUserSchema.parse(input);

    // Get workspace ID before updating
    const userWorkspace = await prisma.user.findUnique({
      where: { id: validatedFields.id },
      select: { workspaces: { select: { id: true } } },
    });

    const workspaceId = userWorkspace?.workspaces[0]?.id;
    if (!workspaceId) {
      throw new Error("User's workspace not found");
    }

    // Update the user
    const user = await prisma.user.update({
      where: { id: validatedFields.id },
      data: {
        name: validatedFields.name,
        role: validatedFields.role,
        phone: validatedFields.phone,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_UPDATED",
        entity: "USER",
        entityId: user.id,
      },
    });

    revalidatePath(`/admin/workspaces/${workspaceId}`);
    return { success: true, user };
  } catch (error) {
    console.error("Error in updateWorkspaceUser:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "An unexpected error occurred while updating the user",
    };
  }
}
