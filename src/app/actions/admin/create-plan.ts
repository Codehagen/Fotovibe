"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";

interface CreatePlanResult {
  success: boolean;
  error?: string;
  plan?: any;
}

const DEFAULT_PLANS = [
  {
    name: "Basic",
    monthlyPrice: 10000,
    yearlyMonthlyPrice: 8333, // 100,000 NOK per year
    currency: "NOK",
    photosPerMonth: 100,
    videosPerMonth: 5,
    maxLocations: 1,
    features: {
      maxUsers: 5,
      ordersPerMonth: 10,
      support: "24/7",
      photoEditing: true,
      priorityBooking: false,
      customBranding: false,
    },
  },
  {
    name: "Pro",
    monthlyPrice: 15000,
    yearlyMonthlyPrice: 12500, // 150,000 NOK per year
    currency: "NOK",
    photosPerMonth: 300,
    videosPerMonth: 15,
    maxLocations: 3,
    features: {
      maxUsers: 15,
      ordersPerMonth: 30,
      support: "24/7",
      photoEditing: true,
      priorityBooking: true,
      customBranding: false,
    },
  },
  {
    name: "Enterprise",
    monthlyPrice: 20000,
    yearlyMonthlyPrice: 16667, // 200,000 NOK per year
    currency: "NOK",
    photosPerMonth: -1, // Unlimited
    videosPerMonth: -1, // Unlimited
    maxLocations: -1, // Unlimited
    features: {
      maxUsers: -1, // Unlimited
      ordersPerMonth: -1, // Unlimited
      support: "24/7 Priority",
      photoEditing: true,
      priorityBooking: true,
      customBranding: true,
    },
  },
];

export async function createDefaultPlans(): Promise<CreatePlanResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    console.log("Creating default plans...");

    // First check if plans exist
    const existingPlans = await prisma.plan.findMany();
    console.log("Existing plans:", existingPlans);

    // Create all plans in parallel
    const plans = await Promise.all(
      DEFAULT_PLANS.map(async (planData) => {
        // Find existing plan by name
        const existingPlan = await prisma.plan.findFirst({
          where: {
            name: planData.name,
          },
        });

        if (existingPlan) {
          console.log(`Updating plan: ${planData.name}`);
          return prisma.plan.update({
            where: { id: existingPlan.id },
            data: planData,
          });
        } else {
          console.log(`Creating new plan: ${planData.name}`);
          return prisma.plan.create({
            data: planData,
          });
        }
      })
    );

    console.log("Created/Updated plans:", plans);

    return {
      success: true,
      plan: plans,
    };
  } catch (error) {
    console.error("Error creating plans:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create plans",
    };
  }
}
