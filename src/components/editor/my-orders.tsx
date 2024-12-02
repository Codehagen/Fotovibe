"use client";

import { DataTable } from "@/components/tables/admin/data-table";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Building2,
  Eye,
  Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getMyEditorOrders } from "@/app/actions/editor/get-my-orders";
import { useEffect, useState } from "react";

interface EditorOrder {
  id: string;
  orderDate: Date;
  location: string;
  status: OrderStatus;
  workspace: {
    name: string;
  };
  photographer: {
    name: string | null;
  };
  checklist: {
    dropboxUrl: string | null;
  };
}

const columns: ColumnDef<EditorOrder>[] = [
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
    accessorKey: "photographer.name",
    header: "Fotograf",
    cell: ({ row }) => row.original.photographer.name,
  },
  {
    accessorKey: "checklist.dropboxUrl",
    header: "Media",
    cell: ({ row }) => (
      <a
        href={row.original.checklist.dropboxUrl!}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-blue-600 hover:underline"
      >
        <LinkIcon className="h-4 w-4" />
        Åpne i Dropbox
      </a>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            (window.location.href = `/editor/ordre/${row.original.id}`)
          }
        >
          <Eye className="mr-2 h-4 w-4" />
          Se ordre
        </Button>
      );
    },
  },
];

export function MyEditorOrders() {
  const [orders, setOrders] = useState<EditorOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const result = await getMyEditorOrders();
        if (result.success) {
          setOrders(result.data.orders);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <DataTable
      columns={columns}
      data={orders}
      searchKey="location"
      searchPlaceholder="Søk etter lokasjon..."
    />
  );
}
