"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Building2, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export interface BusinessRequest {
  id: string;
  name: string;
  email: string;
  contactPerson: string;
  type: string;
  registeredAt: Date;
  notes?: string;
  orgnr: string;
}

export const columns: ColumnDef<BusinessRequest>[] = [
  {
    accessorKey: "name",
    header: "Bedrift",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-sm text-muted-foreground">
              Org.nr: {row.original.orgnr}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Kontakt",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{row.getValue("email")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{row.original.contactPerson}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.getValue("type")}</Badge>;
    },
  },
  {
    accessorKey: "registeredAt",
    header: "Registrert",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <div className="font-medium">
            {format(new Date(row.original.registeredAt), "PPP", { locale: nb })}
          </div>
        </div>
      );
    },
  },
];

export const rowAction = (
  data: BusinessRequest,
  router: ReturnType<typeof useRouter>
) => {
  if (!data?.id) {
    console.error("Missing row data:", data);
    return;
  }
  router.push(`/admin/approvals/business/${data.id}`);
};
