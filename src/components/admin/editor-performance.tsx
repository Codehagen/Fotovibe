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

interface EditorPerformanceProps {
  data: Array<{
    id: string;
    name: string;
    metrics: {
      totalOrders: number;
      completedOrders: number;
      averageDeliveryTime: number;
      activeOrders: number;
    };
  }>;
}

export function EditorPerformance({ data }: EditorPerformanceProps) {
  // Sort by total orders and take top 5
  const topEditors = [...data]
    .sort((a, b) => b.metrics.totalOrders - a.metrics.totalOrders)
    .slice(0, 5);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Editor</TableHead>
            <TableHead className="text-right">Aktive ordre</TableHead>
            <TableHead className="text-right">Fullførte ordre</TableHead>
            <TableHead className="text-right">Leveringstid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topEditors.map((editor) => (
            <TableRow key={editor.id}>
              <TableCell className="font-medium">{editor.name}</TableCell>
              <TableCell className="text-right">
                <Badge variant="outline">{editor.metrics.activeOrders}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {editor.metrics.completedOrders}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {editor.metrics.averageDeliveryTime.toFixed(1)} dager
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
