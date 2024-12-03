"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, addMonths } from "date-fns";
import { nb } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import {
  Calendar,
  MapPin,
  Camera,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  PhoneCall,
  Upload,
  Edit,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface Order {
  id: string;
  status: OrderStatus;
  location: string;
  orderDate: Date;
  scheduledDate: Date;
  photoCount: number;
  videoCount: number;
  photographer: {
    name: string | null;
  } | null;
  workspace: {
    name: string;
    maxUsers?: number;
    subscriptions?: {
      package: string;
      startDate: Date;
      endDate: Date | null;
    }[];
  };
  checklist?: {
    contactedAt: Date | null;
    scheduledAt: Date | null;
    dropboxUrl: string | null;
  } | null;
}

const orderStatusMap: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
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
  [OrderStatus.IN_REVIEW]: {
    label: "Under gjennomgang",
    variant: "secondary",
    icon: Eye,
  },
  [OrderStatus.COMPLETED]: {
    label: "Fullført",
    variant: "default",
    icon: CheckCircle2,
  },
  [OrderStatus.CANCELLED]: {
    label: "Kansellert",
    variant: "destructive",
    icon: XCircle,
  },
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderDate",
    header: "Periode",
    cell: ({ row }) => {
      const startDate = new Date(row.getValue("orderDate"));
      const endDate = addMonths(startDate, 1);

      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(startDate, "LLLL", { locale: nb }).replace(/^\w/, (c) =>
              c.toUpperCase()
            )}
            {" - "}
            {format(endDate, "LLLL", { locale: nb }).replace(/^\w/, (c) =>
              c.toUpperCase()
            )}
          </span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = new Date(rowA.getValue("orderDate"));
      const b = new Date(rowB.getValue("orderDate"));
      return b.getTime() - a.getTime(); // Descending order
    },
  },
  {
    accessorKey: "scheduledDate",
    header: "Dato",
    cell: ({ row }) => {
      const date = row.getValue("scheduledDate") as Date | null;
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {date
              ? format(new Date(date), "PPP", { locale: nb })
              : "Ikke planlagt"}
          </span>
        </div>
      );
    },
  },
  {
    id: "mediaCount",
    header: "Antall",
    cell: ({ row }) => {
      const photos = row.original.photoCount;
      const videos = row.original.videoCount;
      return (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <span>{photos}</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-muted-foreground" />
            <span>{videos}</span>
          </div>
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
    accessorKey: "photographer",
    header: "Fotograf",
    cell: ({ row }) => {
      const photographer = row.original.photographer;
      return photographer ? (
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <span>{photographer.name}</span>
        </div>
      ) : (
        <Badge variant="outline">Ikke tildelt</Badge>
      );
    },
  },
  {
    accessorKey: "checklist",
    header: "Fremdrift",
    cell: ({ row }) => {
      const checklist = row.original.checklist;
      return (
        <div className="flex items-center gap-2">
          <PhoneCall
            className={cn(
              "h-4 w-4",
              checklist?.contactedAt
                ? "text-green-500"
                : "text-muted-foreground"
            )}
          />
          <Calendar
            className={cn(
              "h-4 w-4",
              checklist?.scheduledAt
                ? "text-green-500"
                : "text-muted-foreground"
            )}
          />
        </div>
      );
    },
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
        <Button asChild variant="ghost" size="sm">
          <Link
            href={`/ordre/${row.original.id}`}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Se ordre
          </Link>
        </Button>
      );
    },
  },
];
