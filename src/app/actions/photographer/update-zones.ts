"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateZonesSchema = z.object({
  photographerId: z.string(),
  countryId: z.string(),
  zoneIds: z.array(z.string()),
});

export async function updatePhotographerZones(
  input: z.infer<typeof updateZonesSchema>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify photographer owns this profile
    const photographer = await prisma.photographer.findFirst({
      where: {
        id: input.photographerId,
        clerkId: userId,
      },
    });

    if (!photographer) {
      throw new Error("Unauthorized: Not your profile");
    }

    const validatedFields = updateZonesSchema.parse(input);

    const updated = await prisma.photographer.update({
      where: { id: validatedFields.photographerId },
      data: {
        Country: {
          connect: { id: validatedFields.countryId },
        },
        Zone: {
          connect: { id: validatedFields.zoneIds[0] },
        },
      },
      include: {
        Country: true,
        Zone: true,
      },
    });

    revalidatePath("/fotograf/profil");
    return { success: true, photographer: updated };
  } catch (error) {
    console.error("Error in updatePhotographerZones:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update zones",
    };
  }
}
