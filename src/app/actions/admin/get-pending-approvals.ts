"use server";

import { prisma } from "@/lib/db";

export async function getPendingMedia() {
  try {
    const media = await prisma.media.findMany({
      where: {
        status: "raw", // Only get raw media that needs approval
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        createdAt: true,
        type: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: media.map((item) => ({
        id: item.id,
        title: item.title || "Untitled",
        thumbnailUrl: item.thumbnail || "",
        uploadedAt: item.createdAt,
        workspaceId: item.workspace.id,
        workspaceName: item.workspace.name,
        type: item.type,
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
        contactPerson: request.phone, // Using phone as contact for now
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
