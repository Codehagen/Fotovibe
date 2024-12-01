"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

interface WorkspacesResponse {
  workspaces: {
    id: string;
    name: string;
    orgnr: string;
    address: string;
    city: string;
    zip: string;
    maxUsers: number;
    industry: string | null;
    createdAt: Date;
    _count: {
      users: number;
      orders: number;
    };
  }[];
  totalWorkspaces: number;
}

export async function getWorkspaces(): Promise<{
  success: boolean;
  data?: WorkspacesResponse;
  error?: string;
}> {
  try {
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

    // Get all workspaces with counts
    const workspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        orgnr: true,
        address: true,
        city: true,
        zip: true,
        maxUsers: true,
        industry: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalWorkspaces = await prisma.workspace.count();

    return {
      success: true,
      data: {
        workspaces,
        totalWorkspaces,
      },
    };
  } catch (error) {
    console.error("Error in getWorkspaces:", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred while fetching workspaces",
    };
  }
}
