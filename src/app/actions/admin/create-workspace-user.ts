"use server";

import { prisma } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * TODO: Implement Clerk Invitation Flow
 * 1. Fix Clerk invitation creation with proper redirect URL configuration
 * 2. Set up proper invitation email templates in Clerk Dashboard
 * 3. Handle invitation acceptance and user creation flow
 * 4. Add proper error handling for invitation edge cases
 * 5. Consider implementing a retry mechanism for failed invitations
 */

const createWorkspaceUserSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["ADMIN", "USER", "PHOTOGRAPHER", "EDITOR"]),
  phone: z.string().optional(),
});

export async function createWorkspaceUser(
  input: z.infer<typeof createWorkspaceUserSchema>
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

    const validatedFields = createWorkspaceUserSchema.parse(input);

    // Create user in our database
    const user = await prisma.user.create({
      data: {
        id: `temp_${validatedFields.email}`, // Temporary ID until Clerk integration is complete
        email: validatedFields.email,
        name: validatedFields.name,
        role: validatedFields.role,
        phone: validatedFields.phone,
        language: "norwegian",
        workspaces: {
          connect: {
            id: validatedFields.workspaceId,
          },
        },
      },
    });

    // TODO: Implement Clerk invitation
    // const clerk = await clerkClient();
    // const invitation = await clerk.invitations.createInvitation({
    //   emailAddress: validatedFields.email,
    //   redirectUrl: `${process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}/welcome`,
    //   publicMetadata: {
    //     role: validatedFields.role,
    //     workspaceId: validatedFields.workspaceId,
    //     tempUserId: user.id,
    //   },
    //   notify: true,
    // });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_CREATED",
        entity: "USER",
        entityId: user.id,
      },
    });

    revalidatePath(`/admin/workspaces/${validatedFields.workspaceId}`);
    return { success: true, user };
  } catch (error) {
    console.error("Error in createWorkspaceUser:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "An unexpected error occurred while creating the user",
    };
  }
}
