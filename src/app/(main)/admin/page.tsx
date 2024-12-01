import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Building, Camera } from "lucide-react";
import Link from "next/link";
import { Overview } from "@/components/admin/overview";
import { getWorkspaces } from "@/app/actions/admin/get-workspaces";
import { WorkspacesTable } from "@/components/admin/workspaces-table";
import { CreateWorkspaceDialog } from "@/components/admin/create-workspace-dialog";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Check if user is admin, if not redirect
  if (!user.isSuperUser) {
    redirect("/");
  }

  const { success: workspacesSuccess, data: workspacesData } =
    await getWorkspaces();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Administrer arbeidsområder, fotografer og ordre
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="workspaces">Bedrifter</TabsTrigger>
          <TabsTrigger value="photographers">Fotografer</TabsTrigger>
          <TabsTrigger value="orders">Ordre</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Totale bedrifter
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktive fotografer
                </CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Totale brukere
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>
          <Overview />
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
            <Button asChild>
              <Link href="/admin/photographers/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ny fotograf
              </Link>
            </Button>
          </div>
          {/* PhotographersTable component will go here */}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/admin/orders/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ny ordre
              </Link>
            </Button>
          </div>
          {/* OrdersTable component will go here */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
