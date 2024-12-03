/**
 * TODO: Admin Dashboard Features to Implement
 *
 * 1. Performance Metrics:
 *    - Average delivery time
 *    - Customer satisfaction ratings
 *    - Photographer/Editor performance stats
 *    - Order completion rates
 *
 * 2. Analytics:
 *    - Revenue trends
 *    - Popular locations/services
 *    - Peak booking times
 *    - Customer retention rates
 *
 * 3. Quality Control:
 *    - Review ratings
 *    - Customer feedback overview
 *    - Delivery time compliance
 *    - Edit request rates
 *
 * 4. Resource Management:
 *    - Photographer availability
 *    - Editor workload
 *    - Equipment utilization
 *    - Scheduling efficiency
 *
 * 5. Financial Overview:
 *    - Revenue per workspace
 *    - Average order value
 *    - Payment status
 *    - Outstanding invoices
 *
 * Components to create:
 * - @/components/admin/recent-activities
 * - @/components/admin/photographer-performance
 * - @/components/admin/editor-performance
 * - @/components/admin/analytics-overview
 * - @/components/admin/quality-metrics
 * - @/components/admin/resource-management
 * - @/components/admin/financial-overview
 */

import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Users,
  Building,
  Camera,
  FileImage,
  Calendar,
  Clock,
  CheckCircle2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Overview } from "@/components/admin/overview";
import { getWorkspaces } from "@/app/actions/admin/get-workspaces";
import { WorkspacesTable } from "@/components/admin/workspaces-table";
import { CreateWorkspaceDialog } from "@/components/admin/create-workspace-dialog";
// import { RecentActivities } from "@/components/admin/recent-activities";
// import { PhotographerPerformance } from "@/components/admin/photographer-performance";
// import { EditorPerformance } from "@/components/admin/editor-performance";
import { getPhotographers } from "@/app/actions/admin/get-photographers";
import { PhotographersTable } from "@/components/admin/photographers-table";
import { CreatePhotographerDialog } from "@/components/admin/create-photographer-dialog";
import { getEditors } from "@/app/actions/admin/get-editors";
import { EditorsTable } from "@/components/admin/editors-table";
import { CreateEditorDialog } from "@/components/admin/create-editor-dialog";
import { getDashboardMetrics } from "@/app/actions/admin/get-dashboard-metrics";
import { RecentActivities } from "@/components/admin/recent-activities";
import { PhotographerPerformance } from "@/components/admin/photographer-performance";
import { EditorPerformance } from "@/components/admin/editor-performance";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.isSuperUser) redirect("/");

  const { success: metricsSuccess, data: metrics } =
    await getDashboardMetrics();

  const { success: workspacesSuccess, data: workspacesData } =
    await getWorkspaces();

  const { success: photographersSuccess, data: photographersData } =
    await getPhotographers();

  const { success: editorsSuccess, data: editorsData } = await getEditors();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Velkommen til administrasjonspanelet
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="workspaces">Bedrifter</TabsTrigger>
          <TabsTrigger value="photographers">Fotografer</TabsTrigger>
          <TabsTrigger value="editors">Editorer</TabsTrigger>
          <TabsTrigger value="analytics">Statistikk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktive bedrifter
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.activeWorkspaces || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktive ordre
                </CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.activeOrders.current || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.activeOrders.percentageChange > 0 ? "+" : ""}
                  {metrics?.activeOrders.percentageChange.toFixed(1)}% fra
                  forrige måned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gjennomsnittlig leveringstid
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.averageDeliveryTime.current.toFixed(1)} dager
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.averageDeliveryTime.percentageChange > 0 ? "+" : ""}
                  {metrics?.averageDeliveryTime.percentageChange.toFixed(1)}%
                  fra forrige måned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Kundetilfredshet
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.customerSatisfaction.rating.toFixed(1)}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  Basert på {metrics?.customerSatisfaction.totalReviews || 0}{" "}
                  tilbakemeldinger
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-7">
            <div className="col-span-4">
              <Overview data={metrics?.monthlyOrders || []} />
            </div>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Siste aktiviteter</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivities activities={metrics?.recentActivity || []} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fotograf ytelse</CardTitle>
                <CardDescription>
                  Oversikt over fotografenes leveranser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotographerPerformance
                  data={metrics?.photographerPerformance || []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Editor ytelse</CardTitle>
                <CardDescription>
                  Oversikt over editorenes leveranser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EditorPerformance data={metrics?.editorPerformance || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workspaces" className="space-y-4">
          <div className="flex justify-end">
            <CreateWorkspaceDialog />
          </div>
          {workspacesSuccess && workspacesData ? (
            <WorkspacesTable data={workspacesData.workspaces} />
          ) : (
            <div>Error loading workspaces</div>
          )}
        </TabsContent>

        <TabsContent value="photographers" className="space-y-4">
          <div className="flex justify-end">
            <CreatePhotographerDialog />
          </div>
          {photographersSuccess && photographersData ? (
            <PhotographersTable data={photographersData.photographers} />
          ) : (
            <div>Error loading photographers</div>
          )}
        </TabsContent>

        <TabsContent value="editors" className="space-y-4">
          <div className="flex justify-end">
            <CreateEditorDialog />
          </div>
          {editorsSuccess && editorsData ? (
            <EditorsTable data={editorsData.editors} />
          ) : (
            <div>Error loading editors</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
