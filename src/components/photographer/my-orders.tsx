"use client";

import { DataTable } from "@/components/tables/admin/data-table";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Building2, Eye } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getMyOrders } from "@/app/actions/photographer/get-my-orders";
import { useEffect, useState } from "react";
import { AlertCircle, Camera, CheckCircle2, XCircle, Edit } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MyOrder {
  id: string;
  orderDate: Date;
  scheduledDate: Date;
  location: string;
  status: OrderStatus;
  workspace: {
    name: string;
  };
}

const orderStatusMap: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
    icon: LucideIcon;
  }
> = {
  [OrderStatus.PENDING_PHOTOGRAPHER]: {
    label: "Venter på fotograf",
    variant: "outline",
    icon: Clock,
  },
  [OrderStatus.NOT_STARTED]: {
    label: "Ikke startet",
    variant: "outline",
    icon: AlertCircle,
  },
  [OrderStatus.IN_PROGRESS]: {
    label: "Under arbeid",
    variant: "default",
    icon: Camera,
  },
  [OrderStatus.EDITING]: {
    label: "Under redigering",
    variant: "secondary",
    icon: Edit,
  },
  [OrderStatus.COMPLETED]: {
    label: "Fullført",
    variant: "success",
    icon: CheckCircle2,
  },
  [OrderStatus.CANCELLED]: {
    label: "Kansellert",
    variant: "destructive",
    icon: XCircle,
  },
};

const columns: ColumnDef<MyOrder>[] = [
  {
    accessorKey: "orderDate",
    header: "Måned",
    cell: ({ row }) => {
      const date = new Date(row.getValue("orderDate"));
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(date, "LLLL yyyy", {
              locale: nb,
            }).replace(/^\w/, (c) => c.toUpperCase())}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "scheduledDate",
    header: "Dato",
    cell: ({ row }) => {
      const date = new Date(row.getValue("scheduledDate"));
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as OrderStatus;
      const statusConfig = orderStatusMap[status];
      const Icon = statusConfig.icon;

      return (
        <Badge
          variant={statusConfig.variant}
          className={cn(
            "flex items-center gap-1",
            status === OrderStatus.COMPLETED &&
              "bg-green-500 hover:bg-green-500/80"
          )}
        >
          <Icon className="mr-1 h-3 w-3" />
          {statusConfig.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            (window.location.href = `/fotograf/ordre/${row.original.id}`)
          }
        >
          <Eye className="mr-2 h-4 w-4" />
          Se ordre
        </Button>
      );
    },
  },
];

export function MyOrders() {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const result = await getMyOrders();
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
