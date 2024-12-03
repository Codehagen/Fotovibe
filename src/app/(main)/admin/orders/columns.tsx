"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Building2,
  Eye,
  User,
  Edit as EditIcon,
} from "lucide-react";
import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { orderStatusMap } from "@/lib/order-status";

interface AdminOrder {
  id: string;
  orderDate: Date;
  scheduledDate: Date | null;
  location: string;
  status: OrderStatus;
  workspace: {
    name: string;
  };
  photographer: {
    name: string | null;
  } | null;
  editor: {
    name: string | null;
  } | null;
}

export const columns: ColumnDef<AdminOrder>[] = [
  {
    accessorKey: "orderDate",
    header: "Opprettet",
    cell: ({ row }) => {
      const date = new Date(row.getValue("orderDate"));
      return format(date, "PPP", { locale: nb });
    },
  },
  {
    accessorKey: "scheduledDate",
    header: "Planlagt",
    cell: ({ row }) => {
      const date = row.getValue("scheduledDate") as Date | null;
      return date ? format(date, "PPP", { locale: nb }) : "Ikke planlagt";
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
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.photographer?.name || "Ikke tildelt"}</span>
      </div>
    ),
  },
  {
    accessorKey: "editor.name",
    header: "Editor",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <EditIcon className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.editor?.name || "Ikke tildelt"}</span>
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