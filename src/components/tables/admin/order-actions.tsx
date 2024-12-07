"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteOrderDialog } from "@/components/admin/delete-order-dialog";

interface OrderActionsProps<TData> {
  row: Row<TData>;
}

export function OrderActions<TData>({ row }: OrderActionsProps<TData>) {
  const order = row.original as any;

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Åpne meny</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/admin/orders/${order.id}`}
              className="flex items-center"
            >
              <Eye className="mr-2 h-4 w-4" />
              Se ordre
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/admin/orders/${order.id}/edit`}
              className="flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Rediger
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteOrderDialog orderId={order.id} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
