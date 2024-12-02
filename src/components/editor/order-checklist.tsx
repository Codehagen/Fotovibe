"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateEditorChecklist } from "@/app/actions/editor/update-checklist";
import { cn } from "@/lib/utils";

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
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fremdrift</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Start editing */}
          <div className="space-y-2">
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
                <span className="text-sm">Start redigering</span>
              </div>
              {!checklist?.editingStartedAt && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleUpdateChecklist("start")}
                >
                  Start
                </Button>
              )}
            </div>
          </div>

          {/* Upload files */}
          <div className="space-y-2">
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
                <span className="text-sm">Last opp filer</span>
              </div>
              {!checklist?.uploadedAt && checklist?.editingStartedAt && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleUpdateChecklist("upload")}
                >
                  Last opp
                </Button>
              )}
            </div>
          </div>

          {/* Complete */}
          <div className="space-y-2">
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
                <span className="text-sm">Ferdig</span>
              </div>
              {!checklist?.completedAt && checklist?.uploadedAt && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleUpdateChecklist("complete")}
                >
                  Fullfør
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
