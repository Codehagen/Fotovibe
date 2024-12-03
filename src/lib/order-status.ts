import { OrderStatus } from "@prisma/client";
import {
  Clock,
  AlertCircle,
  Camera,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";

interface OrderStatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: LucideIcon;
}

export const orderStatusMap: Record<OrderStatus, OrderStatusConfig> = {
  [OrderStatus.PENDING_PHOTOGRAPHER]: {
    label: "Venter på fotograf",
    variant: "outline",
    icon: Clock,
  },
  [OrderStatus.NOT_STARTED]: {
    label: "Ikke startet",
    variant: "outline",
    icon: AlertCircle,
  },
  [OrderStatus.IN_PROGRESS]: {
    label: "Under arbeid",
    variant: "default",
    icon: Camera,
  },
  [OrderStatus.EDITING]: {
    label: "Under redigering",
    variant: "secondary",
    icon: Edit,
  },
  [OrderStatus.IN_REVIEW]: {
    label: "Under gjennomgang",
    variant: "secondary",
    icon: Eye,
  },
  [OrderStatus.COMPLETED]: {
    label: "Fullført",
    variant: "default",
    icon: CheckCircle2,
  },
  [OrderStatus.CANCELLED]: {
    label: "Kansellert",
    variant: "destructive",
    icon: XCircle,
  },
};

export function getStatusConfig(status: OrderStatus): OrderStatusConfig {
  return orderStatusMap[status];
}

export function getStatusLabel(status: OrderStatus): string {
  return orderStatusMap[status].label;
}

export function getStatusVariant(
  status: OrderStatus
): "default" | "secondary" | "destructive" | "outline" {
  return orderStatusMap[status].variant;
}

export function getStatusIcon(status: OrderStatus): LucideIcon {
  return orderStatusMap[status].icon;
}
