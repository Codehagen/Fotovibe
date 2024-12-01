import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/tables/orders/data-table";
import { columns } from "@/components/tables/orders/columns";
import { getOrders } from "@/app/actions/orders/get-orders";
import { EmptyPlaceholder } from "@/components/empty-placeholder";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { success, data, error } = await getOrders();

  if (!success || !data) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dine ordre</h2>
          <p className="text-muted-foreground">
            Her er en oversikt over alle dine ordre
          </p>
        </div>
        <Button asChild>
          <Link href="/ordre/ny">
            <PlusCircle className="mr-2 h-4 w-4" />
            Ny ordre
          </Link>
        </Button>
      </div>

      {data.orders.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon icon={PlusCircle} />
          <EmptyPlaceholder.Title>Ingen ordre enda</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Du har ingen ordre enda. Lag din første ordre for å komme i gang.
          </EmptyPlaceholder.Description>
          <Button asChild>
            <Link href="/ordre/ny">
              <PlusCircle className="mr-2 h-4 w-4" />
              Opprett første ordre
            </Link>
          </Button>
        </EmptyPlaceholder>
      ) : (
        <DataTable columns={columns} data={data.orders} />
      )}
    </div>
  );
}
