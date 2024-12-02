"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteOrder } from "@/app/actions/orders/delete-order";
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

interface DeleteOrderButtonProps {
  orderId: string;
  onDeleted?: () => void;
}

export function DeleteOrderButton({
  orderId,
  onDeleted,
}: DeleteOrderButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      const result = await deleteOrder(orderId);

      if (result.success) {
        toast.success("Ordre slettet");
        onDeleted?.();
        // Redirect to the appropriate page
        window.location.href = "/fotograf";
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        disabled={isDeleting}
        onClick={() => setShowConfirm(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Slett ordre
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil slette ordren permanent. Denne handlingen kan ikke
              angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Sletter..." : "Slett ordre"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
