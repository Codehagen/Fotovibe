"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getZones() {
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

    const zones = await prisma.zone.findMany({
      include: {
        country: true,
        _count: {
          select: {
            workspaces: true,
            photographers: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: { zones } };
  } catch (error) {
    console.error("Error in getZones:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch zones",
    };
  }
}
