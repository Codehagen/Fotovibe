"use client";

import { useState } from "react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateOrderChecklist } from "@/app/actions/photographer/update-order-checklist";
import { Loader2 } from "lucide-react";

interface ScheduleDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate?: Date;
}

export function ScheduleDialog({
  orderId,
  open,
  onOpenChange,
  currentDate,
}: ScheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(currentDate);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!date) {
      toast.error("Velg en dato");
      return;
    }

    const scheduledDate = new Date(date);
    scheduledDate.setHours(12, 0, 0, 0);

    setIsSubmitting(true);
    try {
      const result = await updateOrderChecklist(orderId, {
        type: "schedule",
        scheduledDate,
        notes: `Tidspunkt booket: ${format(scheduledDate, "PPP", {
          locale: nb,
        })}${notes ? `\nNoter: ${notes}` : ""}`,
      });

      if (result.success) {
        toast.success("Tidspunkt er booket");
        onOpenChange(false);
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book tidspunkt</DialogTitle>
          <DialogDescription>
            Velg dato for fotografering. Husk å avtale tidspunkt med kunden på
            forhånd.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={nb}
            disabled={(date) => date < new Date()}
            initialFocus
          />
          <Textarea
            placeholder="Legg til notater (valgfritt)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={!date || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Book tidspunkt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
