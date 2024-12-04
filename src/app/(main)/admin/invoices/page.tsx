import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { InvoicesTable } from "@/components/admin/invoices-table";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user?.isSuperUser) redirect("/");

  const invoices = await prisma.invoice.findMany({
    include: {
      workspace: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get invoices by status
  const allInvoices = invoices;
  const pendingInvoices = invoices.filter((i) => i.status === "PENDING");
  const sentInvoices = invoices.filter((i) => i.status === "SENT");
  const paidInvoices = invoices.filter((i) => i.status === "PAID");
  const overdueInvoices = invoices.filter(
    (i) => i.status === "SENT" && i.dueDate && new Date(i.dueDate) < new Date()
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fakturaer</h2>
          <p className="text-muted-foreground">
            Oversikt over alle fakturaer i systemet
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Alle ({allInvoices.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Venter ({pendingInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="sent">Sendt ({sentInvoices.length})</TabsTrigger>
          <TabsTrigger value="paid">Betalt ({paidInvoices.length})</TabsTrigger>
          <TabsTrigger value="overdue">
            <span className="text-yellow-500">
              Forfalt ({overdueInvoices.length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <InvoicesTable data={allInvoices} />
        </TabsContent>
        <TabsContent value="pending">
          <InvoicesTable data={pendingInvoices} />
        </TabsContent>
        <TabsContent value="sent">
          <InvoicesTable data={sentInvoices} />
        </TabsContent>
        <TabsContent value="paid">
          <InvoicesTable data={paidInvoices} />
        </TabsContent>
        <TabsContent value="overdue">
          <InvoicesTable data={overdueInvoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
