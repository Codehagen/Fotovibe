"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../user/get-current-user";
import { FIKEN_API_KEY, FIKEN_COMPANY, FIKEN_API_URL } from "@/lib/fiken";

interface FikenInvoiceResponse {
  invoiceId: number;
  invoiceNumber: number;
  kid: string;
  issueDate: string;
  dueDate: string;
  net: number;
  vat: number;
  gross: number;
  invoicePdf: {
    downloadUrl: string;
    downloadUrlWithFikenNormalUserCredentials: string;
  };
}

export async function getInvoice(invoiceId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    console.log("Getting invoice:", invoiceId);

    // Get invoice from our database first
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        workspace: true,
        order: true,
      },
    });

    console.log("Found invoice in database:", invoice);

    if (!invoice) throw new Error("Invoice not found");

    // Check if user has access to this invoice
    const hasAccess = await prisma.user.findFirst({
      where: {
        id: user.id,
        workspaces: {
          some: {
            id: invoice.workspaceId,
          },
        },
      },
    });

    if (!hasAccess && !user.isSuperUser) {
      throw new Error("You don't have access to this invoice");
    }

    // If we have a Fiken ID and it's not a test/manual ID
    if (invoice.fikenId && !invoice.fikenId.startsWith("manual-")) {
      try {
        console.log("Fetching from Fiken:", {
          url: `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/invoices/${invoice.fikenId}`,
          fikenId: invoice.fikenId,
        });

        const response = await fetch(
          `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/invoices/${invoice.fikenId}`,
          {
            headers: {
              Authorization: `Bearer ${FIKEN_API_KEY}`,
              Accept: "application/json",
            },
          }
        );

        const responseText = await response.text();
        console.log("Raw Fiken response:", responseText);

        if (!response.ok) {
          console.error("Failed to fetch from Fiken:", {
            status: response.status,
            statusText: response.statusText,
            body: responseText,
          });
          return { success: true, data: invoice };
        }

        const fikenInvoice = JSON.parse(responseText);
        console.log("Parsed Fiken invoice:", fikenInvoice);

        const enrichedInvoice = {
          ...invoice,
          fiken: {
            invoiceNumber: fikenInvoice.invoiceNumber,
            kid: fikenInvoice.kid,
            issueDate: fikenInvoice.issueDate,
            dueDate: fikenInvoice.dueDate,
            net: fikenInvoice.net,
            vat: fikenInvoice.vat,
            gross: fikenInvoice.gross,
            pdfUrl: fikenInvoice.invoicePdf.downloadUrl,
          },
        };

        console.log("Enriched invoice with Fiken data:", enrichedInvoice);
        return { success: true, data: enrichedInvoice };
      } catch (error) {
        console.error("Error fetching from Fiken:", {
          error,
          stack: error instanceof Error ? error.stack : undefined,
        });
        return { success: true, data: invoice };
      }
    }

    // Return just our database invoice if no Fiken ID or manual ID
    console.log("Returning basic invoice (no Fiken data):", invoice);
    return { success: true, data: invoice };
  } catch (error) {
    console.error("Error in getInvoice:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch invoice",
    };
  }
}
