"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createPhotographerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  language: z.string().default("norwegian"),
  countryId: z.string().optional(),
  zoneId: z.string().optional(),
});

interface CreatePhotographerResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string | z.ZodError["errors"];
}

export async function createPhotographer(
  input: z.infer<typeof createPhotographerSchema>
): Promise<CreatePhotographerResponse> {
  try {
    const user = await getCurrentUser();

    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    const validatedFields = createPhotographerSchema.parse(input);

    // Check if photographer with email already exists
    const existingPhotographer = await prisma.photographer.findUnique({
      where: { email: validatedFields.email },
    });

    if (existingPhotographer) {
      return {
        success: false,
        error: "A photographer with this email already exists",
      };
    }

    // Get default country (Norway) if not specified
    if (!validatedFields.countryId) {
      const defaultCountry = await prisma.country.findUnique({
        where: { code: "NO" },
      });

      if (defaultCountry) {
        validatedFields.countryId = defaultCountry.id;
      }
    }

    const photographer = await prisma.photographer.create({
      data: {
        name: validatedFields.name,
        email: validatedFields.email,
        phone: validatedFields.phone,
        bio: validatedFields.bio,
        language: validatedFields.language,
        countryId: validatedFields.countryId,
        zoneId: validatedFields.zoneId,
        isActive: true,
      },
    });

    revalidatePath("/admin");
    return {
      success: true,
      data: {
        id: photographer.id,
        name: photographer.name || "",
        email: photographer.email || "",
      },
    };
  } catch (error) {
    console.error("Error creating photographer:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create photographer",
    };
  }
}
