"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/actions/photographer/update-order-status";
import { Loader2, Play, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UpdateOrderStatusProps {
  order: {
    id: string;
    status: string;
  };
}

export function UpdateOrderStatus({ order }: UpdateOrderStatusProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nextStatus, setNextStatus] = useState<"IN_PROGRESS" | "COMPLETED">();

  async function handleUpdateStatus(status: "IN_PROGRESS" | "COMPLETED") {
    setIsUpdating(true);
    try {
      const result = await updateOrderStatus(order.id, status);
      if (result.success) {
        toast.success(
          status === "IN_PROGRESS"
            ? "Oppdraget er startet"
            : "Oppdraget er fullført"
        );
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsUpdating(false);
      setShowConfirm(false);
    }
  }

  if (order.status === "COMPLETED") {
    return null;
  }

  return (
    <>
      <Button
        variant={order.status === "NOT_STARTED" ? "default" : "orange"}
        disabled={isUpdating}
        onClick={() => {
          setNextStatus(
            order.status === "NOT_STARTED" ? "IN_PROGRESS" : "COMPLETED"
          );
          setShowConfirm(true);
        }}
      >
        {isUpdating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : order.status === "NOT_STARTED" ? (
          <Play className="mr-2 h-4 w-4" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        )}
        {order.status === "NOT_STARTED" ? "Start oppdrag" : "Fullfør oppdrag"}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              {nextStatus === "IN_PROGRESS"
                ? "Dette vil markere oppdraget som påbegynt."
                : "Dette vil markere oppdraget som fullført. Sørg for at alle bilder og videoer er lastet opp."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleUpdateStatus(nextStatus!)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {nextStatus === "IN_PROGRESS"
                ? "Start oppdrag"
                : "Fullfør oppdrag"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
