"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/admin/data-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { WorkspaceSheet } from "./workspace-sheet";

interface Workspace {
  id: string;
  name: string;
  orgnr: string;
  city: string;
  maxUsers: number;
  _count: {
    users: number;
    orders: number;
  };
  createdAt: Date;
}

const columns: ColumnDef<Workspace>[] = [
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
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/workspaces/${row.original.id}`}
          className="hover:underline"
        >
          {row.getValue("name")}
        </Link>
      );
    },
  },
  {
    accessorKey: "orgnr",
    header: "Org.nr",
  },
  {
    accessorKey: "city",
    header: "By",
  },
  {
    accessorKey: "_count.users",
    header: "Brukere",
  },
  {
    accessorKey: "_count.orders",
    header: "Ordre",
  },
  {
    accessorKey: "createdAt",
    header: "Opprettet",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString("nb-NO");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <WorkspaceSheet
            workspace={row.original}
            open={open}
            onOpenChange={setOpen}
          />
        </>
      );
    },
  },
];

interface WorkspacesTableProps {
  data: Workspace[];
}

export function WorkspacesTable({ data }: WorkspacesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Søk etter navn..."
    />
  );
}
