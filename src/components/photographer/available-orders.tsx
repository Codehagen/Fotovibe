"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/admin/data-table";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Building2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import { acceptOrder } from "@/app/actions/photographer/accept-order";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getAvailableOrders } from "@/app/actions/photographer/get-available-orders";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
interface AvailableOrder {
  id: string;
  orderDate: Date;
  scheduledDate: Date;
  location: string;
  workspace: {
    name: string;
  };
}

interface AcceptOrderButtonProps {
  orderId: string;
}

function AcceptOrderButton({ orderId }: AcceptOrderButtonProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  async function handleAcceptOrder() {
    if (isAccepting) return;

    try {
      setIsAccepting(true);
      const result = await acceptOrder(orderId);

      if (result.success) {
        toast.success("Oppdraget er nå ditt!");
        window.location.href = "/fotograf";
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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
    id: "actions",
    cell: ({ row }) => <AcceptOrderButton orderId={row.original.id} />,
  },
];

export function AvailableOrders() {
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const result = await getAvailableOrders();
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
