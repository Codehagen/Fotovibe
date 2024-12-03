"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

interface PhotographerPerformanceProps {
  data: Array<{
    id: string;
    name: string;
    metrics: {
      totalOrders: number;
      completedOrders: number;
      averageDeliveryTime: number;
      customerRating: number;
      activeOrders: number;
    };
  }>;
}

export function PhotographerPerformance({
  data,
}: PhotographerPerformanceProps) {
  // Sort by total orders and take top 5
  const topPhotographers = [...data]
    .sort((a, b) => b.metrics.totalOrders - a.metrics.totalOrders)
    .slice(0, 5);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fotograf</TableHead>
            <TableHead className="text-right">Aktive ordre</TableHead>
            <TableHead className="text-right">Fullførte ordre</TableHead>
            <TableHead className="text-right">Leveringstid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topPhotographers.map((photographer) => (
            <TableRow key={photographer.id}>
              <TableCell className="font-medium">{photographer.name}</TableCell>
              <TableCell className="text-right">
                <Badge variant="outline">
                  {photographer.metrics.activeOrders}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {photographer.metrics.completedOrders}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {photographer.metrics.averageDeliveryTime.toFixed(1)} dager
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
