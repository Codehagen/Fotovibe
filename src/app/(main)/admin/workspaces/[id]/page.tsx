import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { getWorkspace } from "@/app/actions/admin/get-workspace";
import { getWorkspaceSubscription } from "@/app/actions/admin/get-workspace-subscription";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  Building,
  Camera,
  Clock,
  Calendar,
  CreditCard,
  Package,
  Image,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { WorkspaceUsers } from "@/components/admin/workspace-users";
import { WorkspaceOrders } from "@/components/admin/workspace-orders";
import { WorkspaceHeader } from "@/components/admin/workspace-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ManageSubscriptionDialog } from "@/components/admin/manage-subscription-dialog";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface WorkspacePageProps {
  params: {
    id: string;
  };
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.isSuperUser) redirect("/");

  const { success, data: workspace, error } = await getWorkspace(params.id);

  if (!success || !workspace) {
    return <div>Error: {error}</div>;
  }

  const { success: subscriptionSuccess, data: subscriptionData } =
    await getWorkspaceSubscription(params.id);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <WorkspaceHeader workspace={workspace} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="users">Brukere</TabsTrigger>
          <TabsTrigger value="orders">Ordre</TabsTrigger>
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktive brukere
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workspace._count.users} / {workspace.maxUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Antall brukere av maks tillatt
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktive ordre
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workspace._count.orders}
                </div>
                <p className="text-xs text-muted-foreground">
                  Totalt antall ordre
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ventende oppdrag
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Oppdrag som venter på fotograf
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Neste fotoshoot
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Ingen planlagt</div>
                <p className="text-xs text-muted-foreground">
                  Neste planlagte fotoshoot
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Media Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Totalt bilder
                </CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Antall bilder levert
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Totalt videoer
                </CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Antall videoer levert
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fullførte oppdrag
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Antall fullførte oppdrag
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Kansellerte oppdrag
                </CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Antall kansellerte oppdrag
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>Bedriftsinformasjon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Organisasjonsnummer
                  </div>
                  <div>{workspace.orgnr}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Bransje
                  </div>
                  <div>{workspace.industry || "Ikke spesifisert"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Adresse
                  </div>
                  <div>{workspace.address}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Postnummer og sted
                  </div>
                  <div>
                    {workspace.zip} {workspace.city}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Foretrukne dager
                  </div>
                  <div>
                    {workspace.preferredDays?.join(", ") || "Ikke spesifisert"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Foretrukne tider
                  </div>
                  <div>
                    {workspace.preferredTimes?.join(", ") || "Ikke spesifisert"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <WorkspaceUsers workspaceId={workspace.id} />
        </TabsContent>

        <TabsContent value="orders">
          <WorkspaceOrders workspaceId={workspace.id} />
        </TabsContent>

        <TabsContent value="subscription">
          <div className="grid gap-4">
            {/* Current Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivt abonnement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status</p>
                      <p
                        className={cn(
                          "text-2xl font-bold",
                          subscriptionData?.subscription?.status === "ACTIVE"
                            ? "text-green-600"
                            : subscriptionData?.subscription?.status ===
                              "PAUSED"
                            ? "text-yellow-600"
                            : "text-red-600"
                        )}
                      >
                        {subscriptionData?.subscription?.status === "ACTIVE"
                          ? "Aktiv"
                          : subscriptionData?.subscription?.status === "PAUSED"
                          ? "Pauset"
                          : subscriptionData?.subscription?.status ===
                            "CANCELLED"
                          ? "Kansellert"
                          : "Ingen aktiv"}
                      </p>
                    </div>
                    <ManageSubscriptionDialog workspace={workspace} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Plan
                      </p>
                      <p className="text-lg font-medium">
                        {subscriptionData?.subscription?.plan?.name ||
                          "Ingen plan"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Pris
                      </p>
                      <p className="text-lg font-medium">
                        {subscriptionData?.subscription?.plan
                          ? `${subscriptionData.subscription.plan.price} ${subscriptionData.subscription.plan.currency}/mnd`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Neste faktura
                      </p>
                      <p className="text-lg font-medium">
                        {subscriptionData?.subscription?.nextBillingDate
                          ? format(
                              new Date(
                                subscriptionData.subscription.nextBillingDate
                              ),
                              "PPP",
                              { locale: nb }
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Startdato
                      </p>
                      <p className="text-lg font-medium">
                        {subscriptionData?.subscription?.startDate
                          ? format(
                              new Date(subscriptionData.subscription.startDate),
                              "PPP",
                              { locale: nb }
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Sist endret
                      </p>
                      <p className="text-lg font-medium">
                        {subscriptionData?.subscription?.pausedAt ||
                        subscriptionData?.subscription?.cancelledAt
                          ? format(
                              new Date(
                                subscriptionData.subscription.pausedAt ||
                                  subscriptionData.subscription.cancelledAt!
                              ),
                              "PPP",
                              { locale: nb }
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Status endret
                      </p>
                      <p className="text-lg font-medium">
                        {subscriptionData?.subscription?.status === "PAUSED"
                          ? "Pauset"
                          : subscriptionData?.subscription?.status ===
                            "CANCELLED"
                          ? "Kansellert"
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage This Month */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Månedens forbruk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Bilder brukt
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {subscriptionData?.usage.photosUsed || 0}/
                        {subscriptionData?.subscription?.plan.photosPerMonth ||
                          0}
                      </p>
                      <p className="text-sm text-muted-foreground">bilder</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${
                            ((subscriptionData?.usage.photosUsed || 0) /
                              (subscriptionData?.subscription?.plan
                                .photosPerMonth || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Videoer brukt
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">1/2</p>
                      <p className="text-sm text-muted-foreground">videoer</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[50%] rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Lokasjoner brukt
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">1/2</p>
                      <p className="text-sm text-muted-foreground">
                        lokasjoner
                      </p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[50%] rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Subscription History */}
            <Card>
              <CardHeader>
                <CardTitle>Faktura historikk</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dato</TableHead>
                      <TableHead>Beløp</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fiken ID</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionData?.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          {new Date(invoice.dueDate).toLocaleDateString(
                            "nb-NO"
                          )}
                        </TableCell>
                        <TableCell>{invoice.amount} kr</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "PAID"
                                ? "default"
                                : invoice.status === "PENDING"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{invoice.fikenId || "-"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Last ned
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="media">
          {/* Media gallery will go here */}
          <Card>
            <CardHeader>
              <CardTitle>Media bibliotek</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Media bibliotek kommer snart</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
