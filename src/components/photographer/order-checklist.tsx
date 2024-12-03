"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateOrderChecklist } from "@/app/actions/photographer/update-order-checklist";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { CheckCircle, FileText, Link as LinkIcon, Clock } from "lucide-react";
import { ScheduleDialog } from "./schedule-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface OrderChecklistProps {
  orderId: string;
  checklist: {
    contactedAt: Date | null;
    scheduledAt: Date | null;
    dropboxUrl: string | null;
    uploadedAt: Date | null;
  };
  requirements?: string | null;
}

export function OrderChecklist({
  orderId,
  checklist,
  requirements,
}: OrderChecklistProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [dropboxUrl, setDropboxUrl] = useState(checklist.dropboxUrl || "");
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);

  async function handleUpdateChecklist(
    type: "contact" | "schedule" | "dropbox"
  ) {
    setIsUpdating(true);
    try {
      const response = await updateOrderChecklist(orderId, {
        type,
        dropboxUrl: type === "dropbox" ? dropboxUrl : undefined,
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      toast.success(
        type === "contact"
          ? "Kunde kontaktet"
          : type === "schedule"
          ? "Tidspunkt avtalt"
          : "Media lastet opp"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Kunne ikke oppdatere sjekkliste"
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleCompleteOrder() {
    setIsUpdating(true);
    try {
      const response = await updateOrderChecklist(orderId, {
        type: "complete",
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      toast.success("Oppdraget er sendt til redigering");
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Kunne ikke fullføre oppdraget"
      );
    } finally {
      setIsUpdating(false);
      setShowConfirmComplete(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sjekkliste</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Customer Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle
              className={cn(
                "h-4 w-4",
                checklist.contactedAt
                  ? "text-green-500"
                  : "text-muted-foreground"
              )}
            />
            <span className="font-medium">Kontakt med kunde</span>
          </div>
          <Button
            variant={checklist.contactedAt ? "default" : "outline"}
            size="sm"
            onClick={() => handleUpdateChecklist("contact")}
            disabled={isUpdating}
          >
            {checklist.contactedAt
              ? `Kontaktet ${format(new Date(checklist.contactedAt), "PPP", {
                  locale: nb,
                })}`
              : "Marker som kontaktet"}
          </Button>
        </div>

        {/* Schedule Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock
              className={cn(
                "h-4 w-4",
                checklist.scheduledAt
                  ? "text-green-500"
                  : "text-muted-foreground"
              )}
            />
            <span className="font-medium">Tidspunkt avtalt</span>
          </div>
          <Button
            variant={checklist.scheduledAt ? "default" : "outline"}
            size="sm"
            onClick={() => setShowScheduleDialog(true)}
            disabled={isUpdating}
          >
            {checklist.scheduledAt
              ? `Avtalt ${format(new Date(checklist.scheduledAt), "PPP", {
                  locale: nb,
                })}`
              : "Velg tidspunkt"}
          </Button>
        </div>

        {/* Dropbox Upload Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon
                className={cn(
                  "h-4 w-4",
                  checklist.dropboxUrl
                    ? "text-green-500"
                    : "text-muted-foreground"
                )}
              />
              <span className="font-medium">Last opp media</span>
            </div>
            <Button
              variant={checklist.uploadedAt ? "default" : "outline"}
              size="sm"
              onClick={() => handleUpdateChecklist("dropbox")}
              disabled={isUpdating || !dropboxUrl}
            >
              {checklist.uploadedAt ? "Lastet opp" : "Marker som lastet opp"}
            </Button>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Lim inn Dropbox lenke..."
              value={dropboxUrl}
              onChange={(e) => setDropboxUrl(e.target.value)}
            />
            {checklist.uploadedAt && (
              <AlertDialog
                open={showConfirmComplete}
                onOpenChange={setShowConfirmComplete}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fullfører...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Fullfør oppdrag
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Dette vil markere oppdraget som fullført og sende det til
                      redigering. Sørg for at alle bilder og videoer er lastet
                      opp til Dropbox.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isUpdating}>
                      Avbryt
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCompleteOrder}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Fullfører..." : "Fullfør oppdrag"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Requirements Section */}
        {requirements && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Krav til oppdraget</span>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="whitespace-pre-wrap text-sm">{requirements}</p>
            </div>
          </div>
        )}
      </CardContent>

      <ScheduleDialog
        orderId={orderId}
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        currentDate={checklist.scheduledAt}
      />
    </Card>
  );
}
