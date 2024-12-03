"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MapPin, Building2, Users2, Pencil } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  country: {
    name: string;
    code: string;
  };
  postalCodes: string[];
  _count: {
    workspaces: number;
    photographers: number;
  };
}

export const columns: ColumnDef<Zone>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Navn
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "country.name",
    header: "Land",
  },
  {
    accessorKey: "postalCodes",
    header: "Postnumre",
    cell: ({ row }) => {
      const postalCodes = row.getValue("postalCodes") as string[];
      return (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{postalCodes.length} postnumre</span>
        </div>
      );
    },
  },
  {
    accessorKey: "_count.workspaces",
    header: "Bedrifter",
    cell: ({ row }) => {
      const count = row.getValue("_count.workspaces") as number;
      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{count}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "_count.photographers",
    header: "Fotografer",
    cell: ({ row }) => {
      const count = row.getValue("_count.photographers") as number;
      return (
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-muted-foreground" />
          <span>{count}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      );
    },
  },
];
