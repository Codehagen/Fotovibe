"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  Play,
  XCircle,
  Calendar,
  PhoneCall,
  Link as LinkIcon,
  Camera,
  Upload,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    } | null;
    EditorChecklist?: {
      editingStartedAt: Date | null;
      uploadedAt: Date | null;
      completedAt: Date | null;
    } | null;
  };
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  // Combine status history with checklist events
  const timelineEvents = [
    // Order created
    {
      date: order.orderDate,
      icon: Calendar,
      iconColor: "text-blue-500",
      dotColor: "bg-blue-500",
      title: "Ordre opprettet",
      description: "Venter på fotograf",
    },
    // Customer contacted
    ...(order.checklist?.contactedAt
      ? [
          {
            date: order.checklist.contactedAt,
            icon: PhoneCall,
            iconColor: "text-green-500",
            dotColor: "bg-green-500",
            title: "Kunde kontaktet",
            description: "Fotograf har tatt kontakt med kunden",
          },
        ]
      : []),
    // Time scheduled
    ...(order.checklist?.scheduledAt
      ? [
          {
            date: order.checklist.contactedAt || new Date(),
            icon: Calendar,
            iconColor: "text-green-500",
            dotColor: "bg-green-500",
            title: "Tidspunkt booket",
            description: `Booket ${format(
              new Date(order.checklist.contactedAt || new Date()),
              "PPP",
              { locale: nb }
            )} for fotografering ${format(
              new Date(order.checklist.scheduledAt),
              "PPP",
              { locale: nb }
            )}`,
          },
        ]
      : []),
    // Shooting started
    ...(order.startedAt
      ? [
          {
            date: order.startedAt,
            icon: Camera,
            iconColor: "text-blue-500",
            dotColor: "bg-blue-500",
            title: "Fotografering startet",
            description: "Fotograf har startet oppdraget",
          },
        ]
      : []),
    // Media uploaded
    ...(order.checklist?.dropboxUrl
      ? [
          {
            date: order.uploadedAt || new Date(),
            icon: Upload,
            iconColor: "text-green-500",
            dotColor: "bg-green-500",
            title: "Media lastet opp",
            description: "Fotograf har lastet opp bildene/videoene",
          },
        ]
      : []),
    // Media received
    ...(order.checklist?.dropboxUrl
      ? [
          {
            date: order.checklist.uploadedAt || new Date(),
            icon: Upload,
            iconColor: "text-blue-500",
            dotColor: "bg-blue-500",
            title: "Mottatt bilder",
            description: "Fotograf har lastet opp materialet",
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
            description: "Editor har startet redigering",
          },
        ]
      : []),
    // Editor uploaded
    ...(order.EditorChecklist?.uploadedAt
      ? [
          {
            date: order.EditorChecklist.uploadedAt,
            icon: Upload,
            iconColor: "text-green-500",
            dotColor: "bg-green-500",
            title: "Redigerte filer lastet opp",
            description: "Editor har lastet opp redigerte filer",
          },
        ]
      : []),
    // Editor completed
    ...(order.EditorChecklist?.completedAt
      ? [
          {
            date: order.EditorChecklist.completedAt,
            icon: CheckCircle2,
            iconColor: "text-green-500",
            dotColor: "bg-green-500",
            title: "Sendt til gjennomgang",
            description: "Editor har sendt oppdraget til gjennomgang",
          },
        ]
      : []),
    // Ready for review
    ...(order.EditorChecklist?.reviewUrl
      ? [
          {
            date: order.completedAt || new Date(),
            icon: CheckCircle2,
            iconColor: "text-green-500",
            dotColor: "bg-green-500",
            title: "Klar for gjennomgang",
            description:
              "Editor har markert oppdraget som klart for gjennomgang",
          },
        ]
      : []),
    // Order completed
    ...(order.completedAt
      ? [
          {
            date: order.completedAt,
            icon: CheckCircle2,
            iconColor: "text-green-500",
            dotColor: "bg-green-500",
            title: "Oppdrag fullført",
            description: "Alt materiale er ferdig redigert og levert",
          },
        ]
      : []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tidslinje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {timelineEvents.map((event, index) => (
            <div key={index} className="flex gap-4">
              <div
                className={cn("mt-1 h-2 w-2 rounded-full", event.dotColor)}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <event.icon className={cn("h-4 w-4", event.iconColor)} />
                  <p className="text-sm font-medium">{event.title}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(event.date, "PPP HH:mm", { locale: nb })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
