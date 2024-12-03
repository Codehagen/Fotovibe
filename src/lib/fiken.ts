const FIKEN_API_KEY = process.env.FIKEN_API_KEY!;
const FIKEN_COMPANY = "fotovibe-as";
const FIKEN_API_URL = "https://api.fiken.no/api/v2";

interface FikenInvoiceData {
  orderId: string;
  workspaceId: string;
  amount: number;
  dueDate?: Date;
  description?: string;
}

interface FikenInvoiceLine {
  description: string;
  netAmount: number;
  vatAmount: number;
  vatType: string;
  grossAmount: number;
}

export async function createFikenInvoice(data: FikenInvoiceData) {
  try {
    console.log("Creating Fiken invoice with data:", data);

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

    console.log("Found workspace:", workspace);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Calculate VAT (25%)
    const netAmount = Math.round(data.amount / 1.25);
    const vatAmount = data.amount - netAmount;

    const invoiceLine: FikenInvoiceLine = {
      description: data.description || `Fotovibe oppdrag #${data.orderId}`,
      netAmount,
      vatAmount,
      vatType: "HIGH", // 25% VAT in Norway
      grossAmount: data.amount,
    };

    const requestBody = {
      customerName: workspace.name,
      customerOrganizationNumber: workspace.orgnr,
      address: {
        streetAddress: workspace.address,
        city: workspace.city,
        postCode: workspace.zip,
        country: "NO",
      },
      issueDate: new Date().toISOString().split("T")[0],
      dueDate:
        data.dueDate?.toISOString().split("T")[0] ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      lines: [invoiceLine],
      ourReference: `Order-${data.orderId}`,
      currency: "NOK",
      bankAccountNumber: process.env.FIKEN_BANK_ACCOUNT,
      paymentAccount: "2400",
      incomeAccount: "3000",
    };

    console.log("Sending request to Fiken:", {
      url: `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/drafts/sales`,
      body: requestBody,
    });

    const response = await fetch(
      `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/drafts/sales`,
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

    if (!response.ok) {
      const error = await response.json();
      console.error("Fiken API error response:", error);
      throw new Error(
        `Fiken API error: ${error.message || response.statusText}`
      );
    }

    const result = await response.json();
    console.log("Fiken API response:", result);

    // Issue the draft invoice
    await fetch(
      `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/drafts/sales/${result.draftId}/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIKEN_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      fikenId: result.draftId,
    };
  } catch (error) {
    console.error("Error creating Fiken invoice:", error);
    throw error;
  }
}
