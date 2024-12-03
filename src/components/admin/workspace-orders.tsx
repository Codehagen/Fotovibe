"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/tables/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Camera, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { OrderStatus } from "@prisma/client";
import { StatusBadge } from "@/components/status-badge";
import { getWorkspaceOrders } from "@/app/actions/admin/get-workspace-orders";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";

interface Order {
  id: string;
  orderDate: Date;
  scheduledDate: Date;
  location: string;
  status: OrderStatus;
  photographer: {
    name: string | null;
  } | null;
  editor: {
    name: string | null;
  } | null;
}

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Dato
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      format(new Date(row.getValue("orderDate")), "PPP", { locale: nb }),
  },
  {
    accessorKey: "location",
    header: "Lokasjon",
  },
  {
    accessorKey: "photographer.name",
    header: "Fotograf",
    cell: ({ row }) => row.original.photographer?.name || "Ikke tildelt",
  },
  {
    accessorKey: "editor.name",
    header: "Editor",
    cell: ({ row }) => row.original.editor?.name || "Ikke tildelt",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/orders/${row.original.id}`}>
          <Eye className="mr-2 h-4 w-4" />
          Se ordre
        </Link>
      </Button>
    ),
  },
];

interface WorkspaceOrdersProps {
  workspaceId: string;
}

export function WorkspaceOrders({ workspaceId }: WorkspaceOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const result = await getWorkspaceOrders(workspaceId);
      if (result.success) {
        setOrders(result.data.orders);
      }
      setIsLoading(false);
    }
    loadOrders();
  }, [workspaceId]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <DataTable
      columns={columns}
      data={orders}
      searchKey="location"
      searchPlaceholder="Søk etter lokasjon..."
    />
  );
}
