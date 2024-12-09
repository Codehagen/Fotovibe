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
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  // Get the most recent items
  const recentPhotographers = pendingMedia.slice(0, 3);
  const recentBusinesses = pendingBusinesses.slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Nyeste Fotografer</CardTitle>
          <CardDescription>
            De siste fotografene som venter på godkjenning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPhotographers.length > 0 ? (
              recentPhotographers.map((photographer) => (
                <div
                  key={photographer.id}
                  className="flex items-center gap-4 rounded-lg border p-3 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() =>
                    router.push(`/admin/approvals/media/${photographer.id}`)
                  }
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {photographer.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {photographer.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(photographer.uploadedAt), "PPP", {
                      locale: nb,
                    })}
                  </div>
                </div>
              ))
            ) : (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon icon={Image} />
                <EmptyPlaceholder.Title>
                  Ingen ventende fotografer
                </EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  Det er ingen fotografer som venter på godkjenning akkurat nå.
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
                  className="flex items-center gap-4 rounded-lg border p-3 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() =>
                    router.push(`/admin/approvals/business/${business.id}`)
                  }
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
