"use server";

import { prisma } from "@/lib/db";

export async function getPhotographerDetails(id: string) {
  try {
    const photographer = await prisma.contactRequest.findUnique({
      where: {
        id,
        requestType: "PHOTOGRAPHER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
        companyOrgnr: true,
        companyAddress: true,
        companyZip: true,
        companyCity: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        portfolio: true,
        experience: true,
        equipment: true,
        specialties: true,
        availability: true,
      },
    });

    return { success: true, data: photographer };
  } catch (error) {
    console.error("[GET_PHOTOGRAPHER_DETAILS]", error);
    return { success: false, error: "Could not fetch photographer details" };
  }
}
