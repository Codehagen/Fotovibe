"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Building2 } from "lucide-react";

interface ApprovalStatsProps {
  mediaCount: number;
  businessCount: number;
}

export function ApprovalStats({
  mediaCount,
  businessCount,
}: ApprovalStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Ventende Medier</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mediaCount}</div>
          <p className="text-xs text-muted-foreground">
            Bilder og videoer som venter på godkjenning
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Ventende Bedrifter
          </CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{businessCount}</div>
          <p className="text-xs text-muted-foreground">
            Bedrifter som venter på godkjenning
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
