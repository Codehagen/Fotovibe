"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";

export async function createEditorProfile(userId: string) {
  try {
    const admin = await getCurrentUser();
    if (!admin?.isSuperUser) {
      throw new Error("Unauthorized");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        language: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Create editor profile
    const editor = await prisma.editor.create({
      data: {
        clerkId: userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        language: user.language || "norwegian",
      },
    });

    return { success: true, data: editor };
  } catch (error) {
    console.error("Error creating editor profile:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create editor profile",
    };
  }
}
