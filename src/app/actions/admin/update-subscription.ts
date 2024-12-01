"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateSubscriptionSchema = z.object({
  workspaceId: z.string(),
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]),
  price: z.number().min(0),
  nextBillingDate: z.string(),
  autoRenew: z.boolean(),
});

export async function updateSubscription(
  input: z.infer<typeof updateSubscriptionSchema>
) {
  try {
    console.log("Starting updateSubscription with input:", input);

    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized: No user found");
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperUser: true },
    });

    if (!user?.isSuperUser) {
      throw new Error("Unauthorized: Admin access required");
    }

    const validatedFields = updateSubscriptionSchema.parse(input);
    console.log("Validated fields:", validatedFields);

    // Create or update plan
    const plan = await prisma.plan.upsert({
      where: { id: `default_${validatedFields.workspaceId}` },
      update: {
        price: validatedFields.price,
      },
      create: {
        id: `default_${validatedFields.workspaceId}`,
        name: "Standard Plan",
        price: validatedFields.price,
        currency: "NOK",
        interval: "MONTHLY",
        photosPerMonth: 999999, // Unlimited for now
        videosPerMonth: 999999, // Unlimited for now
        maxLocations: 999999, // Unlimited for now
        features: {},
        isActive: true,
      },
    });
    console.log("Updated/Created plan:", plan);

    // Find existing subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        workspaceId: validatedFields.workspaceId,
        planId: plan.id,
      },
    });
    console.log("Found existing subscription:", existingSubscription);

    // Update or create subscription
    const subscription = existingSubscription
      ? await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: validatedFields.status,
            nextBillingDate: new Date(validatedFields.nextBillingDate),
            pausedAt: validatedFields.status === "PAUSED" ? new Date() : null,
            cancelledAt:
              validatedFields.status === "CANCELLED" ? new Date() : null,
          },
        })
      : await prisma.subscription.create({
          data: {
            workspaceId: validatedFields.workspaceId,
            planId: plan.id,
            status: validatedFields.status,
            startDate: new Date(),
            nextBillingDate: new Date(validatedFields.nextBillingDate),
          },
        });
    console.log("Updated/Created subscription:", subscription);

    // If status is ACTIVE, create an invoice
    if (validatedFields.status === "ACTIVE") {
      const invoice = await prisma.invoice.create({
        data: {
          workspaceId: validatedFields.workspaceId,
          amount: validatedFields.price,
          status: "PENDING",
          dueDate: new Date(validatedFields.nextBillingDate),
        },
      });
      console.log("Created invoice:", invoice);
    }

    console.log(
      "Revalidating path:",
      `/admin/workspaces/${validatedFields.workspaceId}`
    );
    revalidatePath(`/admin/workspaces/${validatedFields.workspaceId}`);
    return { success: true, subscription };
  } catch (error) {
    console.error("Error in updateSubscription:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "An unexpected error occurred while updating the subscription",
    };
  }
}
