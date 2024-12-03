"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";

interface GetEditorsResponse {
  success: boolean;
  data?: {
    editors: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      language: string | null;
      _count: {
        orders: number;
      };
    }[];
    totalEditors: number;
  };
  error?: string;
}

export async function getEditors(): Promise<GetEditorsResponse> {
  try {
    const user = await getCurrentUser();

    if (!user?.isSuperUser) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    const editors = await prisma.editor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        language: true,
        orders: {
          select: {
            id: true,
          },
        },
      },
    });

    const totalEditors = await prisma.editor.count();

    // Transform the data to match the expected response format
    const formattedEditors = editors.map((editor) => ({
      id: editor.id,
      name: editor.name,
      email: editor.email || "",
      phone: editor.phone,
      language: editor.language,
      _count: {
        orders: editor.orders.length,
      },
    }));

    return {
      success: true,
      data: {
        editors: formattedEditors,
        totalEditors,
      },
    };
  } catch (error) {
    console.error("Error fetching editors:", error);
    return {
      success: false,
      error: "Failed to fetch editors",
    };
  }
}
