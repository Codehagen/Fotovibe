import { Order, OrderStatus } from "./types"

export async function getOrders(): Promise<Order[]> {
  // TODO: Implement actual database query
  return [
    {
      id: "1",
      customerName: "John Doe",
      shootDate: new Date().toISOString(),
      location: "Studio A",
      status: "NOT_STARTED",
    },
    {
      id: "2",
      customerName: "Jane Smith",
      shootDate: new Date(Date.now() - 86400000).toISOString(),
      location: "Beach",
      status: "IN_EDITING",
    },
    {
      id: "3",
      customerName: "Bob Johnson",
      shootDate: new Date(Date.now() - 172800000).toISOString(),
      location: "Mountain View",
      status: "COMPLETED",
    },
    // Add more sample orders as needed
  ]
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  // TODO: Implement actual database query
  return {
    id: orderId,
    customerName: "John Doe",
    shootDate: new Date().toISOString(),
    location: "Studio A",
    status: "NOT_STARTED",
  }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
  // TODO: Implement actual database update
  return {
    id: orderId,
    customerName: "John Doe",
    shootDate: new Date().toISOString(),
    location: "Studio A",
    status: newStatus,
  }
}

export async function getStatusHistory(orderId: string): Promise<Array<{ status: string, timestamp: string }>> {
  // TODO: Implement actual database query
  return [
    { status: "NOT_STARTED", timestamp: new Date(Date.now() - 86400000).toISOString() },
    { status: "STARTED", timestamp: new Date().toISOString() },
  ]
}

