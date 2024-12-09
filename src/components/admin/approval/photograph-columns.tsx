"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Image, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export interface MediaItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  uploadedAt: Date;
  workspaceId: string;
  workspaceName: string;
  type: string;
}

export const columns: ColumnDef<MediaItem>[] = [
  {
    accessorKey: "title",
    header: "Medie",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded">
            {row.original.thumbnailUrl ? (
              <img
                src={row.original.thumbnailUrl}
                alt={row.getValue("title")}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Image className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{row.getValue("title")}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.type}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "workspaceName",
    header: "Bedrift",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("workspaceName")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "uploadedAt",
    header: "Lastet opp",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <div className="font-medium">
            {format(new Date(row.original.uploadedAt), "PPP", { locale: nb })}
          </div>
        </div>
      );
    },
  },
];

export const rowAction = (
  data: MediaItem,
  router: ReturnType<typeof useRouter>
) => {
  if (!data?.id) {
    console.error("Missing row data:", data);
    return;
  }
  router.push(`/admin/approvals/media/${data.id}`);
};
