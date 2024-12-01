import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { getWorkspace } from "@/app/actions/admin/get-workspace";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Building } from "lucide-react";
import { WorkspaceUsers } from "@/components/admin/workspace-users";
import { WorkspaceOrders } from "@/components/admin/workspace-orders";
import { WorkspaceHeader } from "@/components/admin/workspace-header";

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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <WorkspaceHeader workspace={workspace} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="users">Brukere</TabsTrigger>
          <TabsTrigger value="orders">Ordre</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Totale brukere
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workspace._count.users}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Totale ordre
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workspace._count.orders}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Maks brukere
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workspace.maxUsers}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informasjon</CardTitle>
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
      </Tabs>
    </div>
  );
}
