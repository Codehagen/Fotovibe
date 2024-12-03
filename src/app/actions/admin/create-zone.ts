"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createZoneSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  countryId: z.string().min(1, "Country is required"),
  postalCodes: z.array(z.string()),
});

export async function createZone(input: z.infer<typeof createZoneSchema>) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperUser: true },
    });

    if (!user?.isSuperUser) {
      throw new Error("Unauthorized: Admin access required");
    }

    const validatedFields = createZoneSchema.parse(input);

    // Create zone with proper type structure
    const zone = await prisma.zone.create({
      data: {
        name: validatedFields.name,
        country: {
          connect: {
            id: validatedFields.countryId
          }
        },
        postalCodes: validatedFields.postalCodes
      },
      include: {
        country: true,
        _count: {
          select: {
            workspaces: true,
            photographers: true
          }
        }
      }
    });

    revalidatePath("/admin/zones");
    return { success: true, zone };
  } catch (error) {
    console.error("Error in createZone:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create zone",
    };
  }
} 