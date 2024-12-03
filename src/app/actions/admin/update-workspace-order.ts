"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateOrderSchema = z.object({
  location: z.string().min(1, "Location is required"),
  scheduledDate: z.date(),
  requirements: z.string().optional(),
  photoCount: z.number().min(0),
  videoCount: z.number().min(0),
});

interface UpdateOrderResponse {
  success: boolean;
  error?: string | z.ZodError["errors"];
}

export async function updateWorkspaceOrder(
  orderId: string,
  input: z.infer<typeof updateOrderSchema>
): Promise<UpdateOrderResponse> {
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

    const validatedFields = updateOrderSchema.parse(input);

    // Update the order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        location: validatedFields.location,
        scheduledDate: validatedFields.scheduledDate,
        requirements: validatedFields.requirements,
        photoCount: validatedFields.photoCount,
        videoCount: validatedFields.videoCount,
      },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in updateWorkspaceOrder:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order",
    };
  }
}
