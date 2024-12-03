"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";

interface GetPhotographersResponse {
  success: boolean;
  data?: {
    photographers: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      isActive: boolean;
      zones: {
        id: string;
        name: string;
      }[];
      _count: {
        orders: number;
      };
    }[];
    totalPhotographers: number;
  };
  error?: string;
}

export async function getPhotographers(): Promise<GetPhotographersResponse> {
  try {
    const user = await getCurrentUser();

    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    const photographers = await prisma.photographer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        Zone: {
          select: {
            id: true,
            name: true,
          },
        },
        orders: {
          select: {
            id: true,
          },
        },
      },
    });

    const totalPhotographers = await prisma.photographer.count();

    // Transform the data to match the expected response format
    const formattedPhotographers = photographers.map((photographer) => ({
      id: photographer.id,
      name: photographer.name,
      email: photographer.email || "",
      phone: photographer.phone,
      isActive: true, // We can add this field to the Photographer model if needed
      zones: photographer.Zone ? [photographer.Zone] : [],
      _count: {
        orders: photographer.orders.length,
      },
    }));

    return {
      success: true,
      data: {
        photographers: formattedPhotographers,
        totalPhotographers,
      },
    };
  } catch (error) {
    console.error("Error fetching photographers:", error);
    return {
      success: false,
      error: "Failed to fetch photographers",
    };
  }
}
