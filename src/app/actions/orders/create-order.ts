"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

interface CreateOrderInput {
  workspaceId: string;
  location: string;
  scheduledDate: string;
  requirements?: string;
  photoCount?: number;
  videoCount?: number;
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
          status: OrderStatus.PENDING_PHOTOGRAPHER,
          orderDate: new Date(),
          scheduledDate: new Date(input.scheduledDate),
          location: input.location,
          requirements: input.requirements,
          photoCount: input.photoCount || 0,
          videoCount: input.videoCount || 0,
          statusHistory: {
            create: {
              status: OrderStatus.PENDING_PHOTOGRAPHER,
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
              subscriptions: {
                where: {
                  isActive: true,
                  OR: [
                    {
                      endDate: null,
                    },
                    {
                      endDate: {
                        gt: new Date(),
                      },
                    },
                  ],
                },
                include: {
                  plan: true,
                  workspace: true,
                },
                orderBy: {
                  startDate: "desc",
                },
                take: 1,
              },
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
