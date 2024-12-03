import { prisma } from "@/lib/db";

const FIKEN_API_KEY = process.env.FIKEN_API_KEY!;
const FIKEN_COMPANY = "fotovibe-as";
const FIKEN_API_URL = "https://api.fiken.no/api/v2";

interface FikenContact {
  contactId: number;
  name: string;
  organizationNumber: string;
}

export async function getOrCreateFikenContact(
  workspaceId: string
): Promise<number> {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        users: {
          where: {
            role: "ADMIN",
          },
          select: {
            email: true,
            phone: true,
          },
          take: 1,
        },
      },
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Get admin's contact info if available
    const adminUser = workspace.users[0];
    const contactInfo = {
      name: workspace.name,
      orgnr: workspace.orgnr,
      address: workspace.address,
      city: workspace.city,
      zip: workspace.zip,
      email: adminUser?.email || null,
      phone: adminUser?.phone || null,
    };

    // First, try to find existing contact by org number
    const existingContact = await findContactByOrgNumber(contactInfo.orgnr);
    if (existingContact) {
      return existingContact.contactId;
    }

    // If not found, create new contact
    return await createFikenContact(contactInfo);
  } catch (error) {
    console.error("Error in getOrCreateFikenContact:", error);
    throw error;
  }
}

async function findContactByOrgNumber(
  orgNumber: string
): Promise<FikenContact | null> {
  try {
    // Build URL with query parameters
    const queryParams = new URLSearchParams({
      organizationNumber: orgNumber,
      customer: "true", // We want customer contacts
      inactive: "false", // Only active contacts
      pageSize: "1", // We only need one result
      sortBy: "lastModified desc", // Get most recently modified first
    });

    const response = await fetch(
      `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/contacts?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${FIKEN_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to fetch contact: ${error.message || response.statusText}`
      );
    }

    // Check response headers for result count
    const resultCount = parseInt(
      response.headers.get("Fiken-Api-Result-Count") || "0",
      10
    );
    if (resultCount === 0) {
      return null;
    }

    const contacts = await response.json();
    return contacts[0]
      ? {
          contactId: contacts[0].contactId,
          name: contacts[0].name,
          organizationNumber: contacts[0].organizationNumber,
        }
      : null;
  } catch (error) {
    console.error("Error finding contact:", error);
    throw error;
  }
}

async function createFikenContact(workspace: {
  name: string;
  orgnr: string;
  address: string;
  city: string;
  zip: string;
  email: string | null;
  phone: string | null;
}): Promise<number> {
  try {
    const contactData = {
      name: workspace.name,
      organizationNumber: workspace.orgnr,
      email: workspace.email || undefined,
      phoneNumber: workspace.phone || undefined,
      customer: true,
      supplier: false,
      language: "Norwegian",
      currency: "NOK",
      daysUntilInvoicingDueDate: 14,
      address: {
        streetAddress: workspace.address,
        city: workspace.city,
        postCode: workspace.zip,
        country: "Norway",
      },
    };

    const response = await fetch(
      `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIKEN_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(contactData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to create contact: ${error.message || response.statusText}`
      );
    }

    // Get contact ID from Location header
    const locationHeader = response.headers.get("Location");
    if (!locationHeader) {
      throw new Error("No Location header in response");
    }

    // Extract contact ID from Location URL
    const contactId = parseInt(locationHeader.split("/").pop() || "0", 10);
    if (!contactId) {
      throw new Error("Invalid contact ID from response");
    }

    return contactId;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}
