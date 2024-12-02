import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { getOrder } from "@/app/actions/orders/get-order";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { OrderTimeline } from "@/components/photographer/order-timeline";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  Info,
  Clock,
  FileText,
  AlertCircle,
  Camera,
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyPlaceholder } from "@/components/empty-placeholder";

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { success, data: order, error } = await getOrder(params.id);

  if (!success || !order) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Ordre for {order.workspace.name}
          </h2>
          <p className="text-muted-foreground">
            Opprettet {format(new Date(order.orderDate), "PPP", { locale: nb })}
          </p>
        </div>
        <Badge
          variant={
            order.status === "COMPLETED"
              ? "default"
              : order.status === "IN_PROGRESS"
              ? "secondary"
              : "outline"
          }
          className="flex items-center gap-2"
        >
          {order.status === "PENDING_PHOTOGRAPHER" ? (
            <>
              <Clock className="h-4 w-4" />
              Venter på fotograf
            </>
          ) : order.status === "NOT_STARTED" ? (
            <>
              <AlertCircle className="h-4 w-4" />
              Ikke startet
            </>
          ) : order.status === "IN_PROGRESS" ? (
            <>
              <Camera className="h-4 w-4" />
              Under fotografering
            </>
          ) : order.status === "EDITING" ? (
            <>
              <Edit className="h-4 w-4" />
              Under redigering
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              {order.status}
            </>
          )}
        </Badge>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fotograf</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {order.photographer?.name || "Ikke tildelt"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Editor</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {order.editor?.name || "Ikke tildelt"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {order.photoCount || 0} bilder, {order.videoCount || 0} videoer
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detaljer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Lokasjon
                </p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{order.location}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Krav og spesifikasjoner
                </p>
                {order.requirements ? (
                  <div className="flex items-start gap-4">
                    <FileText className="mt-1 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{order.requirements}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Ingen spesielle krav angitt
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Tidspunkt for fotografering
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {order.scheduledDate
                      ? format(new Date(order.scheduledDate), "PPP", {
                          locale: nb,
                        })
                      : "Ikke planlagt"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Separate Ferdig produkt card */}
          {order.status === "COMPLETED" ? (
            <Card>
              <CardHeader>
                <CardTitle>Ferdig produkt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.checklist?.dropboxUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={order.checklist.dropboxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Åpne i Dropbox
                      </a>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Her finner du de ferdige redigerte filene
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Ingen filer tilgjengelig</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon icon={FileText} />
              <EmptyPlaceholder.Title>
                Venter på ferdig produkt
              </EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                De ferdige filene vil være tilgjengelige her når oppdraget er
                fullført.
              </EmptyPlaceholder.Description>
            </EmptyPlaceholder>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <OrderTimeline order={order} />
        </div>
      </div>
    </div>
  );
}
