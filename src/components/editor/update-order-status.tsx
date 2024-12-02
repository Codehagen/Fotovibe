"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateEditorOrderStatus } from "@/app/actions/editor/update-order-status";
import { Loader2, CheckCircle } from "lucide-react";
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

interface UpdateEditorOrderStatusProps {
  order: {
    id: string;
    status: string;
  };
}

export function UpdateEditorOrderStatus({
  order,
}: UpdateEditorOrderStatusProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleUpdateStatus() {
    setIsUpdating(true);
    try {
      const result = await updateEditorOrderStatus(order.id);
      if (result.success) {
        toast.success("Oppdraget er fullført");
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
        variant="default"
        disabled={isUpdating}
        onClick={() => setShowConfirm(true)}
      >
        {isUpdating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        )}
        Fullfør redigering
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil markere oppdraget som fullført. Sørg for at alle videoer
              er ferdig redigert og lastet opp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateStatus}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Fullfør redigering
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
