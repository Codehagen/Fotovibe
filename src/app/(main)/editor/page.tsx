import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvailableEditorOrders } from "@/components/editor/available-orders";
import { MyEditorOrders } from "@/components/editor/my-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Edit, CheckCircle2 } from "lucide-react";

export default async function EditorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Hei {user.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-muted-foreground">
            Her er en oversikt over tilgjengelige og dine oppdrag
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tilgjengelige oppdrag
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Under redigering
            </CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
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
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Tilgjengelige oppdrag</TabsTrigger>
          <TabsTrigger value="my-orders">Mine oppdrag</TabsTrigger>
        </TabsList>
        <TabsContent value="available">
          <AvailableEditorOrders />
        </TabsContent>
        <TabsContent value="my-orders">
          <MyEditorOrders />
        </TabsContent>
      </Tabs>
    </div>
  );
}
