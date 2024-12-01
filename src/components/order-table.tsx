"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Order, UserRole } from "@/lib/types"
import { getOrders } from "@/lib/orders"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react'

interface OrderTableProps {
  userRole: UserRole
}

export function OrderTable({ userRole }: OrderTableProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof Order>("shootDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [statusFilter, setStatusFilter] = useState<Set<Order["status"]>>(new Set())

  useEffect(() => {
    const fetchOrders = async () => {
      const fetchedOrders = await getOrders()
      setOrders(fetchedOrders)
      setFilteredOrders(fetchedOrders)
    }
    fetchOrders()
  }, [])

  useEffect(() => {
    let result = orders

    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter.size > 0) {
      result = result.filter((order) => statusFilter.has(order.status))
    }

    result.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    setFilteredOrders(result)
  }, [orders, searchTerm, sortColumn, sortDirection, statusFilter])

  const toggleSort = (column: keyof Order) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const toggleStatusFilter = (status: Order["status"]) => {
    setStatusFilter((prev) => {
      const newFilter = new Set(prev)
      if (newFilter.has(status)) {
        newFilter.delete(status)
      } else {
        newFilter.add(status)
      }
      return newFilter
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["NOT_STARTED", "STARTED", "IN_EDITING", "IN_REVIEW", "COMPLETED", "CANCELLED"].map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter.has(status as Order["status"])}
                onCheckedChange={() => toggleStatusFilter(status as Order["status"])}
              >
                {status.replace("_", " ")}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" onClick={() => toggleSort("id")}>
                  Order ID
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("customerName")}>
                  Customer
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("shootDate")}>
                  Shoot Date
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("location")}>
                  Location
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("status")}>
                  Status
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{new Date(order.shootDate).toLocaleDateString()}</TableCell>
                <TableCell>{order.location}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/ordre/${order.id}`} passHref>
                    <Button variant="ghost">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

