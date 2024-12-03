import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { getOrder } from "@/app/actions/orders/get-order";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { OrderTimeline } from "@/components/photographer/order-timeline";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  Camera,
  Video,
  FileText,
  User,
  Edit,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { DeleteOrderDialog } from "@/components/admin/delete-order-dialog";
import { EditOrderDialog } from "@/components/admin/edit-order-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default async function AdminOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.isSuperUser) redirect("/");

  const { success, data: order, error } = await getOrder(params.id);

  if (!success || !order) {
    return <div>Error: {error}</div>;
  }

  // Calculate progress based on status
  const progressSteps = {
    PENDING_PHOTOGRAPHER: 0,
    IN_PROGRESS: 33,
    PENDING_EDITOR: 66,
    COMPLETED: 100,
    CANCELLED: 0,
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header with basic info and actions */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Ordre #{order.id}
            </h2>
            {/* <StatusBadge status={order.status} /> */}
          </div>
          <p className="text-muted-foreground">
            Opprettet {format(new Date(order.orderDate), "PPP", { locale: nb })}
          </p>
        </div>
        <div className="flex gap-2">
          <EditOrderDialog order={order} />
          <DeleteOrderDialog orderId={order.id} />
        </div>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Progress value={progressSteps[order.status]} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Opprettet</span>
              <span>Under arbeid</span>
              <span>Redigering</span>
              <span>Fullført</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Detaljer</TabsTrigger>
          <TabsTrigger value="timeline">Tidslinje</TabsTrigger>
          <TabsTrigger value="resources">Ressurser</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Ordre detaljer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Planlagt dato</span>
                    </div>
                    <p>
                      {order.scheduledDate
                        ? format(new Date(order.scheduledDate), "PPP", {
                            locale: nb,
                          })
                        : "Ikke satt"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Leveringsdato</span>
                    </div>
                    <p>
                      {order.deliveryDate
                        ? format(new Date(order.deliveryDate), "PPP", {
                            locale: nb,
                          })
                        : "Ikke satt"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Lokasjon</span>
                  </div>
                  <p>{order.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Camera className="h-4 w-4" />
                      <span className="text-sm font-medium">Bilder</span>
                    </div>
                    <p>{order.photoCount || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Video className="h-4 w-4" />
                      <span className="text-sm font-medium">Videoer</span>
                    </div>
                    <p>{order.videoCount || 0}</p>
                  </div>
                </div>

                {order.requirements && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Krav og spesifikasjoner
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                      {order.requirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Kundeinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Bedrift</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{order.workspace.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Org.nr: {order.workspace.orgnr}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Adresse</span>
                  </div>
                  <p>
                    {order.workspace.address}
                    <br />
                    {order.workspace.zip} {order.workspace.city}
                  </p>
                </div>

                {(order.workspace.preferredDays.length > 0 ||
                  order.workspace.preferredTimes.length > 0) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Preferanser</span>
                    </div>
                    <div className="space-y-1">
                      {order.workspace.preferredDays.length > 0 && (
                        <p className="text-sm">
                          Dager: {order.workspace.preferredDays.join(", ")}
                        </p>
                      )}
                      {order.workspace.preferredTimes.length > 0 && (
                        <p className="text-sm">
                          Tider: {order.workspace.preferredTimes.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Tidslinje</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Tildelte ressurser</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    <span className="text-sm font-medium">Fotograf</span>
                  </div>
                  {order.photographer ? (
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">
                          {order.photographer.name || "Navn mangler"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.photographer.email || "E-post mangler"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Endre fotograf
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        Ingen fotograf tildelt
                      </p>
                      <Button variant="outline" size="sm">
                        <User className="mr-2 h-4 w-4" />
                        Tildel fotograf
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Edit className="h-4 w-4" />
                    <span className="text-sm font-medium">Editor</span>
                  </div>
                  {order.editor ? (
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">
                          {order.editor.name || "Navn mangler"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.editor.email || "E-post mangler"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Endre editor
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        Ingen editor tildelt
                      </p>
                      <Button variant="outline" size="sm">
                        <User className="mr-2 h-4 w-4" />
                        Tildel editor
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
