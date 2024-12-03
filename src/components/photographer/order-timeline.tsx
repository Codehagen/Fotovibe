"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  Upload,
  Camera,
  Edit,
  Eye,
  type LucideIcon,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  date: Date;
  icon: LucideIcon;
  iconColor?: string;
  dotColor?: string;
  title: string;
  description?: string;
}

interface OrderTimelineProps {
  order: {
    orderDate: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    status: string;
    statusHistory: Array<{
      status: string;
      notes: string;
      createdAt: Date;
    }>;
    checklist?: {
      contactedAt: Date | null;
      scheduledAt: Date | null;
      dropboxUrl: string | null;
      uploadedAt: Date | null;
      updatedAt: Date;
    };
    EditorChecklist?: {
      editingStartedAt: Date | null;
      uploadedAt: Date | null;
      completedAt: Date | null;
      reviewUrl: string | null;
    };
    editor?: {
      name: string;
    };
  };
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const events: TimelineEvent[] = [
    // Order created
    {
      date: order.orderDate,
      icon: Clock,
      iconColor: "text-blue-500",
      dotColor: "bg-blue-500",
      title: "Ordre opprettet",
    },
    // Customer contacted
    ...(order.checklist?.contactedAt
      ? [
          {
            date: order.checklist.contactedAt,
            icon: Clock,
            iconColor: "text-blue-500",
            dotColor: "bg-blue-500",
            title: "Kunde kontaktet",
          },
        ]
      : []),
    // Time scheduled
    ...(order.checklist?.scheduledAt
      ? [
          {
            date: order.checklist.updatedAt,
            icon: Calendar,
            iconColor: "text-blue-500",
            dotColor: "bg-blue-500",
            title: "Tidspunkt booket",
            description: `Fotografering planlagt ${format(
              order.checklist.scheduledAt,
              "PPP",
              {
                locale: nb,
              }
            )}`,
          },
        ]
      : []),
    // Started
    ...(order.startedAt
      ? [
          {
            date: order.startedAt,
            icon: Camera,
            iconColor: "text-blue-500",
            dotColor: "bg-blue-500",
            title: "Tildelt fotograf",
          },
        ]
      : []),
    // Media upload
    ...(order.checklist?.uploadedAt
      ? [
          {
            date: order.checklist.uploadedAt,
            icon: Upload,
            iconColor: "text-green-500",
            dotColor: "bg-green-500",
            title: "Media lastet opp",
            description: order.checklist.dropboxUrl
              ? "Dropbox lenke lagt til"
              : undefined,
          },
        ]
      : []),
    // Editing started
    ...(order.EditorChecklist?.editingStartedAt
      ? [
          {
            date: order.EditorChecklist.editingStartedAt,
            icon: Edit,
            iconColor: "text-orange-500",
            dotColor: "bg-orange-500",
            title: "Redigering startet",
            description: order.editor?.name
              ? `Editor: ${order.editor.name}`
              : undefined,
          },
        ]
      : []),
    // Editor upload
    ...(order.EditorChecklist?.uploadedAt
      ? [
          {
            date: order.EditorChecklist.uploadedAt,
            icon: Upload,
            iconColor: "text-orange-500",
            dotColor: "bg-orange-500",
            title: "Redigerte filer lastet opp",
          },
        ]
      : []),
    // Ready for review
    ...(order.EditorChecklist?.completedAt
      ? [
          {
            date: order.EditorChecklist.completedAt,
            icon: Eye,
            iconColor: "text-purple-500",
            dotColor: "bg-purple-500",
            title: "Sendt til gjennomgang",
          },
        ]
      : []),
    // Completed
    ...(order.completedAt
      ? [
          {
            date: order.completedAt,
            icon: CheckCircle2,
            iconColor: "text-green-500",
            dotColor: "bg-green-500",
            title: "Ordre fullført",
          },
        ]
      : []),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tidslinje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative ml-3">
          {events.map((event, index) => (
            <div
              key={index}
              className={cn(
                "relative mb-8 flex items-center last:mb-0",
                index === events.length - 1 && "opacity-100",
                index !== events.length - 1 && "opacity-70"
              )}
            >
              {/* Line */}
              {index < events.length - 1 && (
                <div className="absolute left-0 top-2 h-[calc(100%+2rem)] w-0.5 bg-border" />
              )}

              {/* Dot */}
              <div
                className={cn(
                  "relative z-20 -ml-1 h-2 w-2 rounded-full",
                  event.dotColor || "bg-primary"
                )}
              />

              {/* Content */}
              <div className="flex-1 pl-4">
                <div className="flex items-center gap-2">
                  <event.icon
                    className={cn("h-4 w-4", event.iconColor || "text-primary")}
                  />
                  <p className="text-sm font-medium">{event.title}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(event.date, "PPP", { locale: nb })}
                </p>
                {event.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
