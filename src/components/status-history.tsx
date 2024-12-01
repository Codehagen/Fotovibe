"use client"

import { useEffect, useState } from "react"
import { getStatusHistory } from "@/lib/orders"
import { StatusBadge } from "@/components/status-badge"

export function StatusHistory({ orderId }: { orderId: string }) {
  const [history, setHistory] = useState<Array<{ status: string, timestamp: string }>>([])

  useEffect(() => {
    const fetchHistory = async () => {
      const statusHistory = await getStatusHistory(orderId)
      setHistory(statusHistory)
    }
    fetchHistory()
  }, [orderId])

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <div key={index} className="flex items-center justify-between">
          <StatusBadge status={entry.status as any} />
          <span>{new Date(entry.timestamp).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

