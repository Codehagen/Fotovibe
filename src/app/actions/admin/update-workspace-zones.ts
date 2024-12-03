"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateWorkspaceZonesSchema = z.object({
  workspaceId: z.string(),
  countryId: z.string(),
  zoneIds: z.array(z.string()),
});

export async function updateWorkspaceZones(
  input: z.infer<typeof updateWorkspaceZonesSchema>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const validatedFields = updateWorkspaceZonesSchema.parse(input);

    const workspace = await prisma.workspace.update({
      where: { id: validatedFields.workspaceId },
      data: {
        country: {
          connect: { id: validatedFields.countryId },
        },
        zones: {
          set: validatedFields.zoneIds.map((id) => ({ id })),
        },
      },
      include: {
        zones: true,
        country: true,
      },
    });

    revalidatePath(`/admin/workspaces/${validatedFields.workspaceId}`);
    return { success: true, workspace };
  } catch (error) {
    console.error("Error in updateWorkspaceZones:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update zones",
    };
  }
}
