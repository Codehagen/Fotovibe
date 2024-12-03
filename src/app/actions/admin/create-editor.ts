"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createEditorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  language: z.string().default("norwegian"),
});

interface CreateEditorResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string | z.ZodError["errors"];
}

export async function createEditor(
  input: z.infer<typeof createEditorSchema>
): Promise<CreateEditorResponse> {
  try {
    const user = await getCurrentUser();

    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    const validatedFields = createEditorSchema.parse(input);

    // Check if editor with email already exists
    const existingEditor = await prisma.editor.findUnique({
      where: { email: validatedFields.email },
    });

    if (existingEditor) {
      return {
        success: false,
        error: "An editor with this email already exists",
      };
    }

    const editor = await prisma.editor.create({
      data: {
        name: validatedFields.name,
        email: validatedFields.email,
        phone: validatedFields.phone,
        bio: validatedFields.bio,
        language: validatedFields.language,
      },
    });

    revalidatePath("/admin");
    return {
      success: true,
      data: {
        id: editor.id,
        name: editor.name || "",
        email: editor.email || "",
      },
    };
  } catch (error) {
    console.error("Error creating editor:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create editor",
    };
  }
}
