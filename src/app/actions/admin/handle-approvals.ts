"use server";

import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { prisma } from "@/lib/db";

export async function approveMedia(mediaId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await prisma.media.update({
      where: { id: mediaId },
      data: {
        status: "approved",
        approvedBy: user.id,
        approvedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[APPROVE_MEDIA]", error);
    return {
      success: false,
      error: "Failed to approve media",
    };
  }
}

export async function rejectMedia(mediaId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await prisma.media.update({
      where: { id: mediaId },
      data: {
        status: "rejected",
        approvedBy: user.id,
        approvedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[REJECT_MEDIA]", error);
    return {
      success: false,
      error: "Failed to reject media",
    };
  }
}

export async function approveBusinessRequest(requestId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await prisma.contactRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[APPROVE_BUSINESS_REQUEST]", error);
    return {
      success: false,
      error: "Failed to approve business request",
    };
  }
}

export async function rejectBusinessRequest(requestId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await prisma.contactRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[REJECT_BUSINESS_REQUEST]", error);
    return {
      success: false,
      error: "Failed to reject business request",
    };
  }
}
