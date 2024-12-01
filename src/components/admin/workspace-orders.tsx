"use client";

import { useEffect, useState } from "react";
import { getWorkspaceOrders } from "@/app/actions/admin/get-workspace-orders";
import { DataTable } from "@/components/tables/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { type Order as PrismaOrder } from "@prisma/client";

export interface Order extends PrismaOrder {
  photographer: {
    name: string | null;
  };
  editor: {
    name: string | null;
  } | null;
}

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "scheduledDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dato
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return new Date(row.getValue("scheduledDate")).toLocaleDateString(
        "nb-NO"
      );
    },
  },
  {
    accessorKey: "location",
    header: "Lokasjon",
  },
  {
    accessorKey: "photographer.name",
    header: "Fotograf",
  },
  {
    accessorKey: "editor.name",
    header: "Editor",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <StatusBadge status={row.getValue("status")} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button asChild variant="ghost">
          <Link href={`/ordre/${row.original.id}`}>Se ordre</Link>
        </Button>
      );
    },
  },
];

interface WorkspaceOrdersProps {
  workspaceId: string;
}

export function WorkspaceOrders({ workspaceId }: WorkspaceOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const response = await getWorkspaceOrders(workspaceId);
      if (response.success && response.data) {
        setOrders(response.data.orders);
      }
      setIsLoading(false);
    }
    fetchOrders();
  }, [workspaceId]);

  if (isLoading) {
    return <div>Laster...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Ordre</h3>
        <Button>Ny ordre</Button>
      </div>
      <DataTable
        columns={columns}
        data={orders}
        searchKey="location"
        searchPlaceholder="Søk etter lokasjon..."
      />
    </div>
  );
}
