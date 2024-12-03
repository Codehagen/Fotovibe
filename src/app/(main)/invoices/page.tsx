import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { getUserInvoices } from "@/app/actions/invoices/get-user-invoices";
import { redirect } from "next/navigation";
import { InvoicesTable } from "@/components/invoices/invoices-table";

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { success, data: invoices, error } = await getUserInvoices();

  if (!success) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">
          {error || "Failed to load invoices"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mine fakturaer</h2>
          <p className="text-muted-foreground">
            Oversikt over alle dine fakturaer
          </p>
        </div>
      </div>

      <InvoicesTable data={invoices} />
    </div>
  );
}
