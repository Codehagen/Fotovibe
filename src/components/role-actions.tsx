import { Order, UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface RoleActionsProps {
  order: Order
  userRole: UserRole
  onStatusUpdate: (newStatus: Order['status']) => void
}

export function RoleActions({ order, userRole, onStatusUpdate }: RoleActionsProps) {
  const actions: Record<UserRole, JSX.Element> = {
    USER: (
      <Button onClick={() => onStatusUpdate("CANCELLED")} variant="destructive">
        Cancel Order
      </Button>
    ),
    PHOTOGRAPHER: (
      <>
        {order.status === "NOT_STARTED" && (
          <Button onClick={() => onStatusUpdate("STARTED")}>Start Shoot</Button>
        )}
        {order.status === "STARTED" && (
          <Button onClick={() => onStatusUpdate("IN_EDITING")}>Complete Shoot</Button>
        )}
      </>
    ),
    EDITOR: (
      <>
        {order.status === "IN_EDITING" && (
          <Button onClick={() => onStatusUpdate("IN_REVIEW")}>Submit for Review</Button>
        )}
      </>
    ),
    ADMIN: (
      <>
        <Button onClick={() => onStatusUpdate("COMPLETED")}>Complete Order</Button>
        <Button onClick={() => onStatusUpdate("CANCELLED")} variant="destructive">
          Cancel Order
        </Button>
      </>
    ),
  }

  return <div className="space-x-2">{actions[userRole]}</div>
}

