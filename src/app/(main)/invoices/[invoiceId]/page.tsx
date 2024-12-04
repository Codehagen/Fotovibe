import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { getInvoice } from "@/app/actions/invoices/get-invoice";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { Invoice } from "@prisma/client";

interface FikenInvoiceData {
  invoiceNumber: number;
  kid: string;
  issueDate: string;
  dueDate: string;
  net: number;
  vat: number;
  gross: number;
  pdfUrl: string;
}

interface InvoiceWithFiken extends Invoice {
  workspace: {
    name: string;
  };
  order: {
    id: string;
  };
  fiken?: FikenInvoiceData;
}

export default async function InvoicePage({
  params,
}: {
  params: { invoiceId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { success, data: invoice, error } = await getInvoice(params.invoiceId);

  if (!success || !invoice) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">
          {error || "Failed to load invoice"}
        </p>
      </div>
    );
  }

  const invoiceData = invoice as InvoiceWithFiken;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Faktura</h2>
          <p className="text-muted-foreground">
            {invoiceData.workspace.name} -{" "}
            {format(new Date(invoiceData.createdAt), "PPP", {
              locale: nb,
            })}
          </p>
        </div>
        {invoiceData.fiken && (
          <Button asChild>
            <a
              href={invoiceData.fiken.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Last ned PDF
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fakturadetaljer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invoiceData.fiken && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fakturanummer:</span>
                  <span>{invoiceData.fiken.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">KID:</span>
                  <span>{invoiceData.fiken.kid}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span>{invoiceData.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Forfallsdato:</span>
              <span>
                {invoiceData.dueDate
                  ? format(new Date(invoiceData.dueDate), "PPP", { locale: nb })
                  : "-"}
              </span>
            </div>
            {invoiceData.fiken && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Netto:</span>
                  <span>{(invoiceData.fiken.net / 100).toFixed(2)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MVA:</span>
                  <span>{(invoiceData.fiken.vat / 100).toFixed(2)} kr</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{(invoiceData.fiken.gross / 100).toFixed(2)} kr</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ordredetaljer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ordre ID:</span>
              <span>{invoiceData.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bedrift:</span>
              <span>{invoiceData.workspace.name}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
