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
import { SubscriptionManager } from "@/components/admin/subscription-manager";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CreateWorkspaceOrder } from "@/components/admin/create-workspace-order";

interface WorkspacePageProps {
  params: {
    id: string;
  };
}

interface WorkspaceSubscription {
  name: string;
  package: "basic" | "premium" | "enterprise";
  amount: number;
  isActive: boolean;
}

interface WorkspaceWithCounts {
  id: string;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  orgnr: string;
  city: string;
  zip: string;
  maxUsers: number;
  industry: string | null;
  preferredDays: string[];
  preferredTimes: string[];
  _count: {
    users: number;
    orders: number;
  };
  subscriptions: Array<{
    id: string;
    name: string;
    package: string;
    amount: number;
    isActive: boolean;
  }>;
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    dueDate: Date;
    fikenId: string | null;
  }>;
}

interface WorkspaceResponse {
  success: boolean;
  data?: WorkspaceWithCounts;
  error?: string;
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

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4">
            {/* Orders Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ventende oppdrag
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {workspace._count.orders || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Under arbeid
                  </CardTitle>
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {workspace._count.activeOrders || 0}
                  </div>
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
                  <div className="text-2xl font-bold">
                    {workspace._count.completedOrders || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ordre oversikt</CardTitle>
                  <CreateWorkspaceOrder workspaceId={workspace.id} />
                </div>
              </CardHeader>
              <CardContent>
                <WorkspaceOrders workspaceId={workspace.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <div className="grid gap-4">
            {/* Current Subscription Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Aktivt abonnement</CardTitle>
                  <SubscriptionManager
                    workspaceId={workspace.id}
                    subscription={
                      subscriptionData?.subscription
                        ? {
                            name: subscriptionData.subscription.name,
                            package: subscriptionData.subscription.package,
                            amount: subscriptionData.subscription.amount,
                            isActive: subscriptionData.subscription.isActive,
                          }
                        : undefined
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status</p>
                      <p
                        className={cn(
                          "text-2xl font-bold",
                          subscriptionData?.subscription?.isActive
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {subscriptionData?.subscription?.isActive
                          ? "Aktiv"
                          : "Inaktiv"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Pakke</p>
                      <p className="text-2xl font-bold">
                        {subscriptionData?.subscription?.package || "Ingen"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Månedlig beløp</p>
                      <p className="text-2xl font-bold">
                        {subscriptionData?.subscription?.amount?.toLocaleString() ||
                          0}{" "}
                        kr
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Forbruk denne måneden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Bilder</p>
                    <p className="text-2xl font-bold">
                      {subscriptionData?.usage.photosUsed || 0}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Videoer</p>
                    <p className="text-2xl font-bold">
                      {subscriptionData?.usage.videosUsed || 0}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Lokasjoner</p>
                    <p className="text-2xl font-bold">
                      {subscriptionData?.usage.locationsUsed || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice History */}
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
                          {format(new Date(invoice.dueDate), "PPP", {
                            locale: nb,
                          })}
                        </TableCell>
                        <TableCell>
                          {invoice.amount.toLocaleString()} kr
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "PAID"
                                ? "default"
                                : invoice.status === "PENDING"
                                ? "outline"
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
