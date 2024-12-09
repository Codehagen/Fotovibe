"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import {
  columns as mediaColumns,
  rowAction as mediaRowAction,
  MediaItem,
} from "./photograph-columns";
import {
  columns as businessColumns,
  rowAction as businessRowAction,
  BusinessRequest,
} from "./business-columns";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ApprovalOverview } from "./approval-overview";

interface ApprovalTablesProps {
  pendingMedia: MediaItem[];
  pendingBusinesses: BusinessRequest[];
  pendingMediaSuccess: boolean;
  pendingBusinessesSuccess: boolean;
}

// Create client components for the tables
function PhotographTable({ data }: { data: MediaItem[] }) {
  const router = useRouter();
  return (
    <div className="rounded-md border">
      <DataTable
        columns={mediaColumns}
        data={data}
        searchKey="title"
        onRowClick={(row) => mediaRowAction(row, router)}
      />
    </div>
  );
}

function BusinessTable({ data }: { data: BusinessRequest[] }) {
  const router = useRouter();
  return (
    <div className="rounded-md border">
      <DataTable
        columns={businessColumns}
        data={data}
        searchKey="name"
        onRowClick={(row) => businessRowAction(row, router)}
      />
    </div>
  );
}

export function ApprovalTables({
  pendingMedia,
  pendingBusinesses,
  pendingMediaSuccess,
  pendingBusinessesSuccess,
}: ApprovalTablesProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Oversikt</TabsTrigger>
        <TabsTrigger value="media" className="relative">
          Fotografier
          {pendingMedia?.length > 0 && (
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
              {pendingMedia.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="businesses">
          Bedrifter
          {pendingBusinesses?.length > 0 && (
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
              {pendingBusinesses.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ApprovalOverview
          pendingMedia={pendingMedia}
          pendingBusinesses={pendingBusinesses}
          pendingMediaSuccess={pendingMediaSuccess}
          pendingBusinessesSuccess={pendingBusinessesSuccess}
        />
      </TabsContent>

      <TabsContent value="media" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ventende Fotografier</CardTitle>
            <CardDescription>
              Fotografier som venter på godkjenning fra bedrifter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Laster...</div>}>
              {pendingMediaSuccess ? (
                <PhotographTable data={pendingMedia} />
              ) : (
                <div className="text-sm text-muted-foreground">
                  Kunne ikke laste inn ventende fotografier
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="businesses" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ventende Bedrifter</CardTitle>
            <CardDescription>
              Bedrifter som venter på godkjenning for å bli med på plattformen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Laster...</div>}>
              {pendingBusinessesSuccess ? (
                <BusinessTable data={pendingBusinesses} />
              ) : (
                <div className="text-sm text-muted-foreground">
                  Kunne ikke laste inn ventende bedrifter
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
