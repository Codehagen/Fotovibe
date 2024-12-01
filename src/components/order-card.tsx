import Link from "next/link"
import { Order, UserRole } from "@/lib/types"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface OrderCardProps {
  order: Order
  userRole: UserRole
}

export function OrderCard({ order, userRole }: OrderCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Order #{order.id}</span>
          <StatusBadge status={order.status} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Shoot Date:</strong> {new Date(order.shootDate).toLocaleDateString()}</p>
        <p><strong>Location:</strong> {order.location}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/ordre/${order.id}`} passHref>
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

