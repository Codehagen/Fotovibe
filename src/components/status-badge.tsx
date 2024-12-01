import { Badge } from "@/components/ui/badge"
import { Order } from "@/lib/types"

const statusColors: Record<Order['status'], string> = {
  NOT_STARTED: "bg-gray-500",
  STARTED: "bg-blue-500",
  IN_EDITING: "bg-yellow-500",
  IN_REVIEW: "bg-purple-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
}

export function StatusBadge({ status }: { status: Order['status'] }) {
  return (
    <Badge className={statusColors[status]}>
      {status.replace("_", " ")}
    </Badge>
  )
}

