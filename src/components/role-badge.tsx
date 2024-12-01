"use client";

import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const badgeStyles =
    {
      ADMIN: "bg-red-100 text-red-700 border-red-200",
      USER: "bg-blue-100 text-blue-700 border-blue-200",
      PHOTOGRAPHER: "bg-green-100 text-green-700 border-green-200",
      EDITOR: "bg-purple-100 text-purple-700 border-purple-200",
    }[role] || "bg-gray-100 text-gray-700 border-gray-200";

  const roleLabels =
    {
      ADMIN: "Administrator",
      USER: "Bruker",
      PHOTOGRAPHER: "Fotograf",
      EDITOR: "Editor",
    }[role] || role;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        badgeStyles
      )}
    >
      {roleLabels}
    </span>
  );
}
