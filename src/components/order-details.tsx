"use client"

import { useState } from "react"
import { Order, UserRole } from "@/lib/types"
import { StatusBadge } from "@/components/status-badge"
import { StatusHistory } from "@/components/status-history"
import { MediaManager } from "@/components/media-manager"
import { RoleActions } from "@/components/role-actions"
import { updateOrderStatus } from "@/lib/orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OrderDetailsProps {
  order: Order
  userRole: UserRole
}

export function OrderDetails({ order, userRole }: OrderDetailsProps) {
  const [currentOrder, setCurrentOrder] = useState(order)

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    const updatedOrder = await updateOrderStatus(currentOrder.id, newStatus)
    setCurrentOrder(updatedOrder)
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Order #{currentOrder.id}</CardTitle>
          <CardDescription>
            Current Status: <StatusBadge status={currentOrder.status} />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="space-y-4">
                <p><strong>Customer:</strong> {currentOrder.customerName}</p>
                <p><strong>Shoot Date:</strong> {new Date(currentOrder.shootDate).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {currentOrder.location}</p>
                <RoleActions 
                  order={currentOrder} 
                  userRole={userRole} 
                  onStatusUpdate={handleStatusUpdate} 
                />
              </div>
            </TabsContent>
            <TabsContent value="media">
              <MediaManager orderId={currentOrder.id} userRole={userRole} />
            </TabsContent>
            <TabsContent value="history">
              <StatusHistory orderId={currentOrder.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

