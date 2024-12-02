"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  CheckCircle,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateOrderChecklist } from "@/app/actions/photographer/update-order-checklist";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ScheduleDialog } from "./schedule-dialog";

interface OrderRequirementsProps {
  requirements: string | null;
  orderId: string;
  checklist: {
    contactedAt: Date | null;
    scheduledAt: Date | null;
    dropboxUrl: string | null;
  };
}

export function OrderRequirements({
  requirements,
  orderId,
  checklist,
}: OrderRequirementsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [dropboxUrl, setDropboxUrl] = useState(checklist.dropboxUrl || "");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  async function handleUpdateChecklist(
    type: "contact" | "schedule" | "dropbox"
  ) {
    setIsUpdating(true);
    try {
      const result = await updateOrderChecklist(orderId, {
        type,
        dropboxUrl: type === "dropbox" ? dropboxUrl : undefined,
      });

      if (result.success) {
        toast.success(
          type === "contact"
            ? "Markert som kontaktet"
            : type === "schedule"
            ? "Markert som booket"
            : "Dropbox URL lagret"
        );
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Krav og spesifikasjoner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {requirements && (
          <div className="flex items-start gap-4">
            <FileText className="mt-1 h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{requirements}</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-medium">Sjekkliste</h3>

          <div className="space-y-4">
            {/* Contact Customer */}
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
                <span className="text-sm">
                  Ta kontakt med kunden
                  {checklist.contactedAt && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (
                      {format(new Date(checklist.contactedAt), "PPP", {
                        locale: nb,
                      })}
                      )
                    </span>
                  )}
                </span>
              </div>
              {!checklist.contactedAt && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleUpdateChecklist("contact")}
                >
                  Marker som kontaktet
                </Button>
              )}
            </div>

            {/* Schedule Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar
                  className={cn(
                    "h-4 w-4",
                    checklist.scheduledAt
                      ? "text-green-500"
                      : "text-muted-foreground"
                  )}
                />
                <span className="text-sm">
                  Book tidspunkt
                  {checklist.scheduledAt && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (
                      {format(new Date(checklist.scheduledAt), "PPP", {
                        locale: nb,
                      })}
                      )
                    </span>
                  )}
                </span>
              </div>
              {!checklist.scheduledAt && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => setShowScheduleDialog(true)}
                >
                  Velg dato
                </Button>
              )}
            </div>

            <ScheduleDialog
              orderId={orderId}
              open={showScheduleDialog}
              onOpenChange={setShowScheduleDialog}
              currentDate={checklist.scheduledAt || undefined}
            />

            {/* Dropbox URL */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LinkIcon
                  className={cn(
                    "h-4 w-4",
                    checklist.dropboxUrl
                      ? "text-green-500"
                      : "text-muted-foreground"
                  )}
                />
                <span className="text-sm">
                  {checklist.dropboxUrl
                    ? "Media lastet opp - Sendt til redigering"
                    : "Last opp video til Dropbox"}
                </span>
              </div>
              {!checklist.dropboxUrl && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Lim inn Dropbox URL her"
                    value={dropboxUrl}
                    onChange={(e) => setDropboxUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdating || !dropboxUrl}
                    onClick={() => handleUpdateChecklist("dropbox")}
                  >
                    Lagre URL
                  </Button>
                </div>
              )}
              {checklist.dropboxUrl && (
                <div className="rounded-md bg-muted p-2">
                  <a
                    href={checklist.dropboxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {checklist.dropboxUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
