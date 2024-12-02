"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { addDays } from "date-fns";

export async function createTestOrder() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized: No user found");
    }

    // Get user's workspace
    const userWorkspace = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        workspaces: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!userWorkspace?.workspaces[0]?.id) {
      throw new Error("No workspace found");
    }

    const workspaceId = userWorkspace.workspaces[0].id;

    // Set default scheduled date to noon 7 days from now
    const scheduledDate = addDays(new Date(), 7);
    scheduledDate.setHours(12, 0, 0, 0);

    // Create order with null scheduledDate
    const order = await prisma.order.create({
      data: {
        workspaceId,
        status: "PENDING_PHOTOGRAPHER",
        orderDate: new Date(),
        scheduledDate, // Use the normalized date
        location: "Test Location",
        requirements: "Dette er en testordre",
        photoCount: 10,
        videoCount: 1,
      },
    });

    // Create initial status history
    await prisma.statusHistory.create({
      data: {
        orderId: order.id,
        status: "PENDING_PHOTOGRAPHER",
        changedBy: userId,
        notes: "Ordre opprettet - venter på at en fotograf skal ta oppdraget",
      },
    });

    revalidatePath("/ordre");
    return { success: true, order };
  } catch (error) {
    console.error("Error in createTestOrder:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create test order",
    };
  }
}
