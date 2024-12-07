"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

interface CreateOrderInput {
  workspaceId: string;
  status: OrderStatus;
  requirements?: string;
  packageType: string;
  packagePrice: number;
}

interface CreateOrderResult {
  success: boolean;
  error?: string;
  order?: any;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Create the order with a transaction to ensure all related records are created
    const order = await prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          workspaceId: input.workspaceId,
          photographerId: undefined,
          status: input.status,
          orderDate: new Date(),
          requirements: input.requirements,
          packageType: input.packageType,
          packagePrice: input.packagePrice,
          statusHistory: {
            create: {
              status: input.status,
              changedBy: user.id,
              notes: "Ordre opprettet av admin",
            },
          },
          checklist: {
            create: {
              contactedAt: null,
              scheduledAt: null,
              dropboxUrl: null,
              uploadedAt: null,
              contactNotes: null,
              schedulingNotes: null,
              uploadNotes: null,
            },
          },
          EditorChecklist: {
            create: {
              editingStartedAt: null,
              uploadedAt: null,
              completedAt: null,
              reviewUrl: null,
            },
          },
        },
        include: {
          workspace: {
            include: {
              subscriptions: true,
            },
          },
        },
      });
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/workspaces/${input.workspaceId}`);

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}
