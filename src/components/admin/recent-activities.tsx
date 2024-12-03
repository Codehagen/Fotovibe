"use client";

import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { OrderStatus } from "@prisma/client";
import {
  Camera,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  date: Date;
}

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

const statusIconMap: Record<string, LucideIcon> = {
  [OrderStatus.PENDING_PHOTOGRAPHER]: Clock,
  [OrderStatus.NOT_STARTED]: AlertCircle,
  [OrderStatus.IN_PROGRESS]: Camera,
  [OrderStatus.EDITING]: Edit,
  [OrderStatus.IN_REVIEW]: Eye,
  [OrderStatus.COMPLETED]: CheckCircle2,
  [OrderStatus.CANCELLED]: XCircle,
};

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = statusIconMap[activity.type] || AlertCircle;

        return (
          <div
            key={activity.id}
            className="flex items-start gap-4 rounded-lg border p-4"
          >
            <Icon className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.message}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(activity.date), "PPp", {
                  locale: nb,
                })}
              </p>
            </div>
          </div>
        );
      })}

      {activities.length === 0 && (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            Ingen aktiviteter å vise
          </p>
        </div>
      )}
    </div>
  );
}
