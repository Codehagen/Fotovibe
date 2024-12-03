"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updatePhotographerZonesSchema = z.object({
  photographerId: z.string(),
  countryId: z.string(),
  zoneIds: z.array(z.string()),
});

export async function updatePhotographerZones(
  input: z.infer<typeof updatePhotographerZonesSchema>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const validatedFields = updatePhotographerZonesSchema.parse(input);

    const photographer = await prisma.photographer.update({
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

    revalidatePath(`/admin/photographers/${validatedFields.photographerId}`);
    return { success: true, photographer };
  } catch (error) {
    console.error("Error in updatePhotographerZones:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update zones",
    };
  }
}
