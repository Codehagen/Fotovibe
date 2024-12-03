"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Invoice, InvoiceStatus } from "@prisma/client";
import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InvoiceRow {
  id: string;
  orderId: string;
  workspaceId: string;
  workspace: {
    name: string;
  };
  amount: number;
  status: InvoiceStatus;
  fikenId: string | null;
  dueDate: Date | null;
  createdAt: Date;
  paidAt: Date | null;
}

const invoiceStatusMap: Record<
  InvoiceStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "Venter", variant: "secondary" },
  SENT: { label: "Sendt", variant: "default" },
  PAID: { label: "Betalt", variant: "outline" },
  CANCELLED: { label: "Kansellert", variant: "destructive" },
};

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
    header: "Kunde",
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
      const status = row.getValue("status") as InvoiceStatus;
      const statusConfig = invoiceStatusMap[status];

      return (
        <Badge variant={statusConfig.variant}>
          {status === "SENT" && <Clock className="mr-2 h-3 w-3" />}
          {status === "PAID" && <CheckCircle className="mr-2 h-3 w-3" />}
          {statusConfig.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const fikenId = row.original.fikenId;

      return (
        <Button asChild variant="ghost" size="sm">
          <Link
            href={`/admin/invoices/${row.original.id}`}
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
      searchPlaceholder="Søk etter kunde..."
    />
  );
}
