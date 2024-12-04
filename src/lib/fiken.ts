export const FIKEN_API_KEY = process.env.FIKEN_API_KEY!;
export const FIKEN_COMPANY = "fotovibe-as";
export const FIKEN_API_URL = "https://api.fiken.no/api/v2";

export interface FikenInvoiceData {
  orderId: string;
  workspaceId: string;
  amount: number;
  dueDate?: Date;
  description?: string;
}

export interface FikenInvoiceLine {
  description: string;
  netAmount: number;
  vatAmount: number;
  vatType: string;
  grossAmount: number;
}

import { findOrCreateFikenContact } from "./fiken/fiken-contacts";

export async function createFikenInvoice(data: FikenInvoiceData) {
  try {
    console.log("\n=== Starting Fiken Invoice Creation ===");
    console.log("Input data:", data);

    // Get workspace details for invoice
    const workspace = await prisma.workspace.findUnique({
      where: { id: data.workspaceId },
      select: {
        name: true,
        orgnr: true,
        address: true,
        city: true,
        zip: true,
      },
    });

    console.log("Workspace details:", workspace);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Find or create contact in Fiken
    const { contactId } = await findOrCreateFikenContact({
      name: workspace.name,
      organizationNumber: workspace.orgnr,
      address: {
        streetAddress: workspace.address,
        city: workspace.city,
        postCode: workspace.zip,
        country: "NO",
      },
    });

    // Calculate VAT (25%)
    const netAmount = data.amount;
    const vatAmount = Math.round(netAmount * 0.25);
    const grossAmount = netAmount + vatAmount;

    console.log("Amount calculations:", {
      netAmount,
      vatAmount,
      grossAmount,
    });

    const requestBody = {
      issueDate: new Date().toISOString().split("T")[0],
      dueDate:
        data.dueDate?.toISOString().split("T")[0] ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      lines: [
        {
          net: netAmount * 100,
          vat: vatAmount * 100,
          gross: grossAmount * 100,
          vatType: "HIGH",
          vatInPercent: 25,
          unitPrice: netAmount * 100,
          quantity: 1,
          discount: 0,
          description: data.description || `Fotovibe oppdrag #${data.orderId}`,
          comment: `Ordre referanse: ${data.orderId}`,
          incomeAccount: "3020",
        },
      ],
      ourReference: `Order-${data.orderId}`,
      customerName: workspace.name,
      customerOrganizationNumber: workspace.orgnr,
      address: {
        streetAddress: workspace.address,
        city: workspace.city,
        postCode: workspace.zip,
        country: "NO",
      },
      bankAccountCode: "1920:10001",
      currency: "NOK",
      cash: false,
      customerId: contactId,
    };

    console.log("\nFiken API Request:", {
      url: `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/invoices`,
      method: "POST",
      headers: {
        Authorization: "Bearer [REDACTED]",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody, null, 2),
    });

    const response = await fetch(
      `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/invoices`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIKEN_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseText = await response.text();
    console.log("\nFiken API Response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText,
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage =
          errorData.message ||
          errorData.error_description ||
          response.statusText;
        console.error("\nFiken API Error:", errorData);
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        if (responseText) {
          errorMessage += ` - ${responseText}`;
        }
        console.error("\nFailed to parse error response:", e);
      }
      throw new Error(`Fiken API error: ${errorMessage}`);
    }

    let result;
    try {
      result = responseText ? JSON.parse(responseText) : {};
      console.log("\nParsed Fiken response:", result);
    } catch (e) {
      console.error("\nFailed to parse response JSON:", e);
      throw new Error("Invalid response from Fiken API");
    }

    console.log("\n=== Fiken Invoice Creation Complete ===");
    return {
      success: true,
      fikenId: result.invoiceId || result.id || `manual-${Date.now()}`,
    };
  } catch (error) {
    console.error("\nError creating Fiken invoice:", error);
    throw error;
  }
}
