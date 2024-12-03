"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

const createOrderSchema = z.object({
  location: z.string().min(1, "Location is required"),
  scheduledDate: z.date(),
  requirements: z.string().optional(),
  photoCount: z.number().min(0),
  videoCount: z.number().min(0),
});

interface CreateOrderResponse {
  success: boolean;
  order?: any;
  error?: string | z.ZodError["errors"];
}

export async function createWorkspaceOrder(
  workspaceId: string,
  input: z.infer<typeof createOrderSchema>
): Promise<CreateOrderResponse> {
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

    const validatedFields = createOrderSchema.parse(input);

    // Create the order
    const order = await prisma.order.create({
      data: {
        workspaceId,
        status: OrderStatus.PENDING_PHOTOGRAPHER,
        orderDate: new Date(),
        scheduledDate: validatedFields.scheduledDate,
        location: validatedFields.location,
        requirements: validatedFields.requirements,
        photoCount: validatedFields.photoCount,
        videoCount: validatedFields.videoCount,
      },
    });

    // Create initial status history
    await prisma.statusHistory.create({
      data: {
        orderId: order.id,
        status: OrderStatus.PENDING_PHOTOGRAPHER,
        changedBy: userId,
        notes: "Ordre opprettet av admin",
      },
    });

    revalidatePath(`/admin/workspaces/${workspaceId}`);
    return { success: true, order };
  } catch (error) {
    console.error("Error in createWorkspaceOrder:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}
