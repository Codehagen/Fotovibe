"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { reviewOrder } from "@/app/actions/photographer/review-order";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewOrderFormProps {
  orderId: string;
}

export function ReviewOrderForm({ orderId }: ReviewOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [comment, setComment] = useState("");
  const [action, setAction] = useState<"approve" | "request_changes">();
  const [changeType, setChangeType] = useState<string>("");

  async function handleSubmit() {
    if (!action) return;

    if (action === "request_changes") {
      if (!comment) {
        toast.error("Du må legge til en kommentar");
        return;
      }
      if (!changeType) {
        toast.error("Du må velge type endring");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const result = await reviewOrder(orderId, {
        type: action,
        comment:
          action === "request_changes"
            ? `Endring ønsket - ${changeType}: ${comment}`
            : comment || "Godkjent uten kommentar",
      });

      if (result.success) {
        toast.success(
          action === "approve"
            ? "Oppdraget er godkjent og fullført"
            : "Endringer er forespurt fra editor"
        );
        window.location.href = "/fotograf";
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Din tilbakemelding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {action === "request_changes" && (
            <Select value={changeType} onValueChange={setChangeType}>
              <SelectTrigger>
                <SelectValue placeholder="Velg type endring" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="klipping">Klipping/Redigering</SelectItem>
                <SelectItem value="farge">Fargekorrigering</SelectItem>
                <SelectItem value="lyd">Lyd/Musikk</SelectItem>
                <SelectItem value="tekst">Tekst/Grafikk</SelectItem>
                <SelectItem value="annet">Annet</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Textarea
            placeholder={
              action === "approve"
                ? "Legg til en kommentar om det ferdige resultatet..."
                : "Beskriv endringene som trengs..."
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setAction("request_changes");
                setShowConfirm(true);
              }}
              disabled={isSubmitting}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Be om endringer
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setAction("approve");
                setShowConfirm(true);
              }}
              disabled={isSubmitting}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Godkjenn og fullfør
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve"
                ? "Dette vil markere oppdraget som fullført og avslutte prosessen."
                : "Dette vil sende oppdraget tilbake til editor for endringer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Avbryt
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={action === "approve" ? "bg-green-600" : undefined}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {action === "approve" ? "Godkjenn og fullfør" : "Send tilbake"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
