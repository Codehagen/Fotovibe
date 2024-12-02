"use client";

import { DataTable } from "@/components/tables/admin/data-table";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  Building2,
  Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { acceptEditorOrder } from "@/app/actions/editor/accept-order";
import { useEffect, useState } from "react";
import { getAvailableEditorOrders } from "@/app/actions/editor/get-available-orders";

interface AvailableOrder {
  id: string;
  orderDate: Date;
  location: string;
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

function AcceptOrderButton({ orderId }: { orderId: string }) {
  const [isAccepting, setIsAccepting] = useState(false);

  async function handleAcceptOrder() {
    if (isAccepting) return;

    try {
      setIsAccepting(true);
      const result = await acceptEditorOrder(orderId);

      if (result.success) {
        toast.success("Oppdraget er nå ditt!");
        window.location.href = "/editor";
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsAccepting(false);
    }
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleAcceptOrder}
      disabled={isAccepting}
    >
      {isAccepting ? (
        <>
          <Clock className="mr-2 h-4 w-4 animate-spin" />
          Tar oppdraget...
        </>
      ) : (
        "Ta oppdraget"
      )}
    </Button>
  );
}

const columns: ColumnDef<AvailableOrder>[] = [
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
    cell: ({ row }) => <AcceptOrderButton orderId={row.original.id} />,
  },
];

export function AvailableEditorOrders() {
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const result = await getAvailableEditorOrders();
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
