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
import { toast } from "sonner";
import { updateOrderChecklist } from "@/app/actions/photographer/update-order-checklist";
import { cn } from "@/lib/utils";

interface ScheduleDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate?: Date | null;
}

export function ScheduleDialog({
  orderId,
  open,
  onOpenChange,
  currentDate,
}: ScheduleDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentDate || undefined
  );

  async function handleSchedule() {
    if (!selectedDate) {
      toast.error("Velg en dato først");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await updateOrderChecklist(orderId, {
        type: "schedule",
        scheduledDate: selectedDate,
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      toast.success("Tidspunkt oppdatert", {
        description: `Oppdraget er satt til ${format(selectedDate, "PPP", {
          locale: nb,
        })}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Kunne ikke oppdatere tidspunkt"
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Velg dato for oppdraget</DialogTitle>
          <DialogDescription>
            Velg dato når oppdraget skal gjennomføres. Dette vil bli synlig for
            kunden.
          </DialogDescription>
        </DialogHeader>

        <div className={cn("p-3", !selectedDate && "pb-0")}>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={nb}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={isUpdating || !selectedDate}
          >
            {isUpdating ? "Oppdaterer..." : "Lagre dato"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
