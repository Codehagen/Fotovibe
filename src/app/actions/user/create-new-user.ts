"use server";

import { prisma } from "@/lib/db";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { CreateUserInput, UserRole } from "@/lib/types";

export async function createNewUser(): Promise<CreateUserInput | null> {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("No authenticated user found");
      return null;
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      console.error("Could not get user details from Clerk");
      return null;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
      },
    });

    if (existingUser) {
      console.log("User already exists in database");
      return existingUser as CreateUserInput;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
    const name =
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;

    // Create new user and default workspace in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Create the workspace first
      const workspace = await tx.workspace.create({
        data: {
          name: `${name ?? "My"}'s Workspace`,
          orgnr: `USER${userId.slice(-6)}`,
          address: "",
          city: "",
          zip: "",
          maxUsers: 5,
        },
      });

      // Check if this is the first user for this workspace
      const workspaceUserCount = await tx.user.count({
        where: {
          workspaces: {
            some: {
              id: workspace.id,
            },
          },
        },
      });

      // Determine role - first user of workspace becomes admin
      const role: UserRole =
        workspaceUserCount === 0 ? UserRole.ADMIN : UserRole.USER;

      // Create the user
      const createdUser = await tx.user.create({
        data: {
          id: userId,
          email,
          name,
          avatar: clerkUser.imageUrl,
          language: "norwegian",
          role,
          isSuperUser: role === UserRole.ADMIN,
          workspaces: {
            connect: { id: workspace.id },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
        },
      });

      // Update stats
      await tx.stats.upsert({
        where: { id: "global" },
        create: {
          id: "global",
          totalAccounts: 1,
          totalWorkspaces: 1,
        },
        update: {
          totalAccounts: { increment: 1 },
          totalWorkspaces: { increment: 1 },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: createdUser.id,
          action: "USER_CREATED",
          entity: "USER",
          entityId: createdUser.id,
        },
      });

      // Update Clerk user metadata
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role,
          workspaceId: workspace.id,
        },
        privateMetadata: {
          databaseId: createdUser.id,
        },
        // We can use unsafeMetadata for user preferences that can be changed from the frontend
        unsafeMetadata: {
          language: "norwegian",
          theme: "light",
        },
      });

      return createdUser as CreateUserInput;
    });

    console.log("Created new user:", newUser.id);
    return newUser;
  } catch (error) {
    console.error("Error creating new user:", error);
    throw error;
  }
}

export async function isUserAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === UserRole.ADMIN;
}

export async function getUserRole(): Promise<UserRole | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return (user?.role as UserRole) || UserRole.USER;
}
