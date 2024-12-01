"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateWorkspaceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters"),
  orgnr: z.string().min(9, "Organization number must be 9 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().min(4, "ZIP code must be 4 digits"),
  maxUsers: z.number().min(1, "Must allow at least 1 user"),
  industry: z.string().optional(),
});

export async function updateWorkspace(
  input: z.infer<typeof updateWorkspaceSchema>
) {
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

    const validatedFields = updateWorkspaceSchema.parse(input);

    const workspace = await prisma.workspace.update({
      where: { id: validatedFields.id },
      data: {
        name: validatedFields.name,
        orgnr: validatedFields.orgnr,
        address: validatedFields.address,
        city: validatedFields.city,
        zip: validatedFields.zip,
        maxUsers: validatedFields.maxUsers,
        industry: validatedFields.industry,
      },
    });

    revalidatePath("/admin");
    return { success: true, workspace };
  } catch (error) {
    console.error("Error in updateWorkspace:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "An unexpected error occurred while updating the workspace",
    };
  }
}
