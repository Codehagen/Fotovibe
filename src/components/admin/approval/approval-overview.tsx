"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Image, Building2, Clock } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { EmptyPlaceholder } from "@/components/empty-placeholder";

interface ApprovalOverviewProps {
  pendingMedia: any[];
  pendingBusinesses: any[];
  pendingMediaSuccess: boolean;
  pendingBusinessesSuccess: boolean;
}

export function ApprovalOverview({
  pendingMedia,
  pendingBusinesses,
  pendingMediaSuccess,
  pendingBusinessesSuccess,
}: ApprovalOverviewProps) {
  // Get the most recent items
  const recentMedia = pendingMedia.slice(0, 3);
  const recentBusinesses = pendingBusinesses.slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Nyeste Medier</CardTitle>
          <CardDescription>
            De siste mediene som venter på godkjenning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMedia.length > 0 ? (
              recentMedia.map((media) => (
                <div
                  key={media.id}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded">
                    {media.thumbnailUrl ? (
                      <img
                        src={media.thumbnailUrl}
                        alt={media.title}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Image className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {media.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {media.workspaceName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(media.uploadedAt), "PPP", { locale: nb })}
                  </div>
                </div>
              ))
            ) : (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon icon={Image} />
                <EmptyPlaceholder.Title>
                  Ingen ventende medier
                </EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  Det er ingen medier som venter på godkjenning akkurat nå.
                </EmptyPlaceholder.Description>
              </EmptyPlaceholder>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nyeste Bedrifter</CardTitle>
          <CardDescription>
            De siste bedriftene som venter på godkjenning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBusinesses.length > 0 ? (
              recentBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {business.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {business.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(business.registeredAt), "PPP", {
                      locale: nb,
                    })}
                  </div>
                </div>
              ))
            ) : (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon icon={Building2} />
                <EmptyPlaceholder.Title>
                  Ingen ventende bedrifter
                </EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  Det er ingen bedrifter som venter på godkjenning akkurat nå.
                </EmptyPlaceholder.Description>
              </EmptyPlaceholder>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
