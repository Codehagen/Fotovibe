"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateEditorChecklist } from "@/app/actions/editor/update-checklist";
import { cn } from "@/lib/utils";
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

interface EditorChecklistProps {
  orderId: string;
  checklist: {
    editingStartedAt: Date | null;
    uploadedAt: Date | null;
    completedAt: Date | null;
  } | null;
}

export function EditorChecklist({ orderId, checklist }: EditorChecklistProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);

  async function handleUpdateChecklist(type: "start" | "upload" | "complete") {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const result = await updateEditorChecklist(orderId, { type });

      if (result.success) {
        toast.success(
          type === "start"
            ? "Redigering startet"
            : type === "upload"
            ? "Filer lastet opp"
            : "Redigering fullført"
        );
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
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
        {/* Start editing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit
              className={cn(
                "h-4 w-4",
                checklist?.editingStartedAt
                  ? "text-green-500"
                  : "text-muted-foreground"
              )}
            />
            <span className="font-medium">Start redigering</span>
          </div>
          {!checklist?.editingStartedAt && (
            <Button
              variant={checklist?.editingStartedAt ? "default" : "outline"}
              size="sm"
              disabled={isUpdating}
              onClick={() => handleUpdateChecklist("start")}
            >
              Start
            </Button>
          )}
        </div>

        {/* Upload files */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload
              className={cn(
                "h-4 w-4",
                checklist?.uploadedAt
                  ? "text-green-500"
                  : "text-muted-foreground"
              )}
            />
            <span className="font-medium">Last opp filer</span>
          </div>
          {!checklist?.uploadedAt && checklist?.editingStartedAt && (
            <Button
              variant={checklist?.uploadedAt ? "default" : "outline"}
              size="sm"
              disabled={isUpdating}
              onClick={() => handleUpdateChecklist("upload")}
            >
              Last opp
            </Button>
          )}
        </div>

        {/* Complete */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={cn(
                "h-4 w-4",
                checklist?.completedAt
                  ? "text-green-500"
                  : "text-muted-foreground"
              )}
            />
            <span className="font-medium">Ferdig</span>
          </div>
          {!checklist?.completedAt && checklist?.uploadedAt && (
            <AlertDialog
              open={showConfirmComplete}
              onOpenChange={setShowConfirmComplete}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant={checklist?.completedAt ? "default" : "outline"}
                  size="sm"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fullfører...
                    </>
                  ) : (
                    "Fullfør"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dette vil markere redigeringen som fullført og sende
                    oppdraget til gjennomgang. Sørg for at alle filer er ferdig
                    redigert og lastet opp.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isUpdating}>
                    Avbryt
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleUpdateChecklist("complete")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Fullfører..." : "Fullfør redigering"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
