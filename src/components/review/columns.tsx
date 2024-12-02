"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Building2, Eye } from "lucide-react";

interface Review {
  id: string;
  orderDate: Date;
  location: string;
  workspace: {
    name: string;
  };
  EditorChecklist: {
    completedAt: Date | null;
  } | null;
}

export const columns: ColumnDef<Review>[] = [
  {
    accessorKey: "orderDate",
    header: "Dato",
    cell: ({ row }) => {
      const date = new Date(row.getValue("orderDate"));
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(date, "PPP", { locale: nb })}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Lokasjon",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>{row.getValue("location")}</span>
      </div>
    ),
  },
  {
    accessorKey: "workspace.name",
    header: "Kunde",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.workspace.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "EditorChecklist.completedAt",
    header: "Sendt til gjennomgang",
    cell: ({ row }) => {
      const date = row.original.EditorChecklist?.completedAt;
      return date ? format(new Date(date), "PPP", { locale: nb }) : "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          (window.location.href = `/fotograf/review/${row.original.id}`)
        }
      >
        <Eye className="mr-2 h-4 w-4" />
        Se gjennomgang
      </Button>
    ),
  },
];
