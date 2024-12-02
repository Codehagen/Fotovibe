"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { OrderStatus } from "@prisma/client";

export async function getPhotographerReviews() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get photographer profile
    const photographer = await prisma.photographer.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!photographer) {
      throw new Error("Photographer profile not found");
    }

    // Get orders in review state
    const reviews = await prisma.order.findMany({
      where: {
        photographerId: photographer.id,
        status: OrderStatus.IN_REVIEW,
      },
      select: {
        id: true,
        orderDate: true,
        location: true,
        workspace: {
          select: {
            name: true,
          },
        },
        EditorChecklist: {
          select: {
            completedAt: true,
          },
        },
      },
      orderBy: {
        orderDate: "desc",
      },
    });

    return { success: true, data: { reviews } };
  } catch (error) {
    console.error("Error in getPhotographerReviews:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch reviews",
    };
  }
}
