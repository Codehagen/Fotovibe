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

export async function createFikenInvoice(data: FikenInvoiceData) {
  try {
    console.log("Creating Fiken invoice with data:", data);

    // Calculate VAT (25%)
    // Input amount is the net amount (before VAT)
    const netAmount = data.amount;
    const vatAmount = Math.round(netAmount * 0.25); // 25% VAT
    const grossAmount = netAmount + vatAmount;

    const requestBody = {
      issueDate: new Date().toISOString().split("T")[0],
      dueDate:
        data.dueDate?.toISOString().split("T")[0] ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      lines: [
        {
          net: netAmount * 100, // Convert to cents after calculation
          vat: vatAmount * 100, // Convert to cents after calculation
          gross: grossAmount * 100, // Convert to cents after calculation
          vatType: "HIGH",
          vatInPercent: 25,
          unitPrice: netAmount * 100, // Same as net since quantity is 1
          quantity: 1,
          discount: 0,
          description: data.description || `Fotovibe oppdrag #${data.orderId}`,
          comment: `Ordre referanse: ${data.orderId}`,
          incomeAccount: "3020",
        },
      ],
      ourReference: `Order-${data.orderId}`,
      bankAccountCode: "1920:10001",
      currency: "NOK",
      cash: false,
    };

    console.log("Sending request to Fiken:", {
      url: `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/invoices`,
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
    console.log("Raw Fiken response:", responseText);

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage =
          errorData.message ||
          errorData.error_description ||
          response.statusText;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        if (responseText) {
          errorMessage += ` - ${responseText}`;
        }
      }
      throw new Error(`Fiken API error: ${errorMessage}`);
    }

    let result;
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error("Failed to parse response JSON:", e);
      throw new Error("Invalid response from Fiken API");
    }

    console.log("Parsed Fiken response:", result);

    return {
      success: true,
      fikenId: result.invoiceId || result.id || `manual-${Date.now()}`,
    };
  } catch (error) {
    console.error("Error creating Fiken invoice:", error);
    throw error;
  }
}
