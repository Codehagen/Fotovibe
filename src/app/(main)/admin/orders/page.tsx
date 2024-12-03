import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/tables/admin/data-table";
import { columns } from "./columns";
import { getAdminOrders } from "@/app/actions/admin/get-admin-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.isSuperUser) redirect("/");

  const { success, data, error } = await getAdminOrders();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ordre oversikt</h2>
          <p className="text-muted-foreground">
            Administrer og følg opp alle ordre
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/orders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Ny ordre
          </Link>
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive ordre</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeOrders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venter</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pendingOrders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fullført</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.completedOrders || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders table */}
      {success && data ? (
        <DataTable
          columns={columns}
          data={data.orders}
          searchKey="location"
          searchPlaceholder="Søk etter lokasjon..."
        />
      ) : (
        <div>Error: {error}</div>
      )}
    </div>
  );
}
