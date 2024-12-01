"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

interface WorkspaceUsersResponse {
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
  }>;
  totalUsers: number;
}

export async function getWorkspaceUsers(workspaceId: string): Promise<{
  success: boolean;
  data?: WorkspaceUsersResponse;
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

    const users = await prisma.user.findMany({
      where: {
        workspaces: {
          some: {
            id: workspaceId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const totalUsers = await prisma.user.count({
      where: {
        workspaces: {
          some: {
            id: workspaceId,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        users,
        totalUsers,
      },
    };
  } catch (error) {
    console.error("Error in getWorkspaceUsers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}
