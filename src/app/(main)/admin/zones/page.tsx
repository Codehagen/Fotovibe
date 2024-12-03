import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/tables/admin/data-table";
import { columns } from "./columns";
import { getZones } from "@/app/actions/admin/get-zones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateZoneDialog } from "@/components/admin/create-zone-dialog";

export default async function AdminZonesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.isSuperUser) redirect("/");

  const { success, data, error } = await getZones();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Geografiske soner
          </h2>
          <p className="text-muted-foreground">
            Administrer soner for fotografer og bedrifter
          </p>
        </div>
        <CreateZoneDialog />
      </div>

      {success && data ? (
        <DataTable
          columns={columns}
          data={data.zones}
          searchKey="name"
          searchPlaceholder="Søk etter sonenavn..."
        />
      ) : (
        <div>Error: {error}</div>
      )}
    </div>
  );
}
