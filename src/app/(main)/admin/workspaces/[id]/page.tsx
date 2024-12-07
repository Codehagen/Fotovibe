import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { getWorkspace } from "@/app/actions/admin/get-workspace";
import { getWorkspaceSubscription } from "@/app/actions/admin/get-workspace-subscription";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
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
import { formatPrice } from "@/lib/subscription-plans";
import { SubscriptionManagement } from "@/components/admin/subscription-management";
import { SubscriptionSummary } from "@/components/admin/subscription-summary";

interface WorkspacePageProps {
  params: {
    id: string;
  };
}

interface SubscriptionData {
  id: string;
  workspaceId: string;
  plan: {
    id: string;
    name: string;
    monthlyPrice: number;
    yearlyMonthlyPrice: number;
  };
  isYearly: boolean;
  isActive: boolean;
  startDate: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

interface WorkspaceSubscriptionData {
  success: boolean;
  error?: string;
  data: {
    subscription: SubscriptionData | null;
    usage: {
      photosUsed: number;
      videosUsed: number;
      locationsUsed: number;
    };
    invoices: any[];
  };
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
    locationsUsed: number;
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

  const subscriptionResponse = await getWorkspaceSubscription(params.id);
  console.log("Subscription Response:", subscriptionResponse);

  const { success: subscriptionSuccess, data: subscriptionData } =
    subscriptionResponse as WorkspaceSubscriptionData;

  console.log("Subscription Success:", subscriptionSuccess);
  console.log("Subscription Data:", subscriptionData);

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
          {/* Subscription Summary - Full Width */}
          {subscriptionSuccess && subscriptionData?.subscription && (
            <div className="grid gap-4">
              <SubscriptionManagement
                subscription={subscriptionData.subscription}
              />
            </div>
          )}

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
          {subscriptionSuccess && subscriptionData?.subscription ? (
            <SubscriptionManagement
              subscription={subscriptionData.subscription}
            />
          ) : (
            <SubscriptionSummary workspaceId={workspace.id} />
          )}

          {/* Subscription Plans */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card
              className={cn(
                "relative",
                subscriptionData?.subscription?.plan.name === "Basic" &&
                  "border-primary"
              )}
            >
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription>{formatPrice(10000)} / mnd</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Professional Photographers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Professional Photo Editing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    24/7 Support
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <XCircle className="mr-2 h-4 w-4" />
                    Multiple Locations
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <XCircle className="mr-2 h-4 w-4" />
                    Priority Booking
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <XCircle className="mr-2 h-4 w-4" />
                    Custom Branding
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={
                    subscriptionData?.subscription?.plan.name === "Basic"
                      ? "outline"
                      : "default"
                  }
                  disabled={
                    subscriptionData?.subscription?.plan.name === "Basic"
                  }
                >
                  {subscriptionData?.subscription?.plan.name === "Basic"
                    ? "Nåværende plan"
                    : "Velg denne planen"}
                </Button>
              </CardFooter>
            </Card>

            <Card
              className={cn(
                "relative",
                subscriptionData?.subscription?.plan.name === "Pro" &&
                  !subscriptionData?.subscription?.cancelAtPeriodEnd &&
                  "border-primary"
              )}
            >
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>{formatPrice(15000)} / mnd</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Professional Photographers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Professional Photo Editing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    24/7 Support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Multiple Locations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Priority Booking
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <XCircle className="mr-2 h-4 w-4" />
                    Custom Branding
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={
                    subscriptionData?.subscription?.plan.name === "Pro"
                      ? "outline"
                      : "default"
                  }
                  disabled={subscriptionData?.subscription?.plan.name === "Pro"}
                >
                  {subscriptionData?.subscription?.plan.name === "Pro"
                    ? "Nåværende plan"
                    : "Velg denne planen"}
                </Button>
              </CardFooter>
              {subscriptionData?.subscription?.plan.name === "Pro" && (
                <div className="absolute -top-2 -right-2 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                  {subscriptionData.subscription.cancelAtPeriodEnd
                    ? "Avsluttes"
                    : "Nåværende plan"}
                </div>
              )}
            </Card>

            <Card
              className={cn(
                "relative",
                subscriptionData?.subscription?.plan.name === "Enterprise" &&
                  "border-primary"
              )}
            >
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>{formatPrice(20000)} / mnd</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Professional Photographers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Professional Photo Editing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    24/7 Support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Multiple Locations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Priority Booking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    Custom Branding
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={
                    subscriptionData?.subscription?.plan.name === "Enterprise"
                      ? "outline"
                      : "default"
                  }
                  disabled={
                    subscriptionData?.subscription?.plan.name === "Enterprise"
                  }
                >
                  {subscriptionData?.subscription?.plan.name === "Enterprise"
                    ? "Nåværende plan"
                    : "Velg denne planen"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Usage Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Forbruk denne måneden</CardTitle>
              <CardDescription>
                Oversikt over brukte ressurser i inneværende periode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Bilder
                    </h4>
                  </div>
                  <p className="text-2xl font-bold">
                    {subscriptionData?.usage?.photosUsed ?? 0}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Videoer
                    </h4>
                  </div>
                  <p className="text-2xl font-bold">
                    {subscriptionData?.usage?.videosUsed ?? 0}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Lokasjoner
                    </h4>
                  </div>
                  <p className="text-2xl font-bold">
                    {subscriptionData?.usage?.locationsUsed ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice History Card */}
          <Card>
            <CardHeader>
              <CardTitle>Faktura historikk</CardTitle>
              <CardDescription>
                Oversikt over tidligere fakturaer og betalinger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dato</TableHead>
                    <TableHead>Beløp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fiken ID</TableHead>
                    <TableHead className="text-right">Handling</TableHead>
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
                      <TableCell>{formatPrice(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "PAID"
                              ? "default"
                              : invoice.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.fikenId || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={!invoice.fikenId}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Last ned faktura</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
