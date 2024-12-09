"use server";

import { prisma } from "@/lib/db";

export async function getPendingMedia() {
  try {
    const media = await prisma.contactRequest.findMany({
      where: {
        status: "PENDING",
        requestType: "PHOTOGRAPHER",
      },
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        createdAt: true,
        notes: true,
        companyOrgnr: true,
        requestType: true,
        portfolio: true,
        experience: true,
        equipment: true,
        specialties: true,
        availability: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: media.map((item) => ({
        id: item.id,
        title: item.companyName || "Untitled",
        thumbnailUrl: item.portfolio || "",
        uploadedAt: item.createdAt,
        workspaceId: item.companyOrgnr,
        workspaceName: item.companyName,
        type: item.requestType,
        email: item.email,
        phone: item.phone,
        notes: item.notes,
        experience: item.experience,
        equipment: item.equipment,
        specialties: item.specialties,
        availability: item.availability,
      })),
    };
  } catch (error) {
    console.error("[GET_PENDING_MEDIA]", error);
    return {
      success: false,
      error: "Failed to fetch pending media",
    };
  }
}

export async function getPendingBusinessRequests() {
  try {
    const requests = await prisma.contactRequest.findMany({
      where: {
        status: "PENDING",
        requestType: "CLIENT",
      },
      select: {
        id: true,
        companyName: true,
        companyOrgnr: true,
        email: true,
        phone: true,
        createdAt: true,
        notes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: requests.map((request) => ({
        id: request.id,
        name: request.companyName,
        email: request.email,
        contactPerson: request.phone,
        type: "Business",
        registeredAt: request.createdAt,
        notes: request.notes,
        orgnr: request.companyOrgnr,
      })),
    };
  } catch (error) {
    console.error("[GET_PENDING_BUSINESSES]", error);
    return {
      success: false,
      error: "Failed to fetch pending business requests",
    };
  }
}
