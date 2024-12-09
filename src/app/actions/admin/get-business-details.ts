"use server";

import { prisma } from "@/lib/db";

export async function getBusinessDetails(id: string) {
  try {
    const request = await prisma.contactRequest.findUnique({
      where: { id },
    });
    return { success: true, data: request };
  } catch (error) {
    console.error("[GET_BUSINESS_DETAILS]", error);
    return { success: false, error: "Could not fetch business details" };
  }
}
