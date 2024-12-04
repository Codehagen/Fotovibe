"use client";

import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoiceRow {
  id: string;
  orderId: string;
  workspace: {
    name: string;
  };
  amount: number;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  order: {
    orderDate: Date;
    location: string;
    status: string;
  };
}

const columns: ColumnDef<InvoiceRow>[] = [
  {
    accessorKey: "createdAt",
    header: "Dato",
    cell: ({ row }) => {
      return format(new Date(row.getValue("createdAt")), "PPP", {
        locale: nb,
      });
    },
  },
  {
    accessorKey: "workspace.name",
    header: "Bedrift",
  },
  {
    accessorKey: "order.location",
    header: "Lokasjon",
  },
  {
    accessorKey: "amount",
    header: "Beløp",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const formatted = new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK",
      }).format(amount);

      return formatted;
    },
  },
  {
    accessorKey: "dueDate",
    header: "Forfallsdato",
    cell: ({ row }) => {
      const date = row.getValue("dueDate") as Date | null;
      if (!date) return "-";

      const dueDate = new Date(date);
      const isOverdue = dueDate < new Date() && row.original.status === "SENT";

      return (
        <div
          className={cn("flex items-center gap-2", isOverdue && "text-red-500")}
        >
          {isOverdue && <AlertCircle className="h-4 w-4" />}
          {format(dueDate, "PPP", { locale: nb })}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusMap = {
        PENDING: { label: "Venter", variant: "secondary" as const },
        SENT: { label: "Sendt", variant: "default" as const },
        PAID: { label: "Betalt", variant: "outline" as const },
        CANCELLED: { label: "Kansellert", variant: "destructive" as const },
      };

      const statusConfig = statusMap[status as keyof typeof statusMap];

      return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button asChild variant="ghost" size="sm">
          <Link
            href={`/invoices/${row.original.id}`}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Se faktura
          </Link>
        </Button>
      );
    },
  },
];

interface InvoicesTableProps {
  data: InvoiceRow[];
}

export function InvoicesTable({ data }: InvoicesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="workspace.name"
      searchPlaceholder="Søk etter bedrift..."
    />
  );
}
