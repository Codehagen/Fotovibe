import { FIKEN_API_KEY, FIKEN_API_URL, FIKEN_COMPANY } from "../fiken";

interface FikenContact {
  contactId: number;
  name: string;
  organizationNumber?: string;
  email?: string;
  customer: boolean;
  address?: {
    streetAddress?: string;
    city?: string;
    postCode?: string;
    country?: string;
  };
}

interface CreateContactInput {
  name: string;
  organizationNumber: string;
  email?: string;
  address?: {
    streetAddress: string;
    city: string;
    postCode: string;
    country: string;
  };
}

export async function findOrCreateFikenContact(
  input: CreateContactInput
): Promise<{ contactId: number }> {
  try {
    console.log("\n=== Starting Fiken Contact Check ===");
    console.log(
      "Looking for contact with org number:",
      input.organizationNumber
    );

    // First try to find existing contact
    const searchUrl = `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/contacts?organizationNumber=${input.organizationNumber}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${FIKEN_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!searchResponse.ok) {
      throw new Error(
        `Failed to search contacts: ${searchResponse.statusText}`
      );
    }

    const existingContacts = (await searchResponse.json()) as FikenContact[];

    if (existingContacts.length > 0) {
      console.log("Found existing contact:", existingContacts[0]);
      return { contactId: existingContacts[0].contactId };
    }

    // If no existing contact, create new one
    console.log("No existing contact found, creating new one");

    const createContactUrl = `${FIKEN_API_URL}/companies/${FIKEN_COMPANY}/contacts`;
    const createResponse = await fetch(createContactUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIKEN_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: input.name,
        organizationNumber: input.organizationNumber,
        email: input.email,
        customer: true,
        address: input.address
          ? {
              ...input.address,
              country: input.address.country || "NO",
            }
          : undefined,
        language: "Norwegian",
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Failed to create contact:", errorText);
      throw new Error(`Failed to create contact: ${createResponse.statusText}`);
    }

    // Get the contact ID from the Location header
    const locationHeader = createResponse.headers.get("Location");
    if (!locationHeader) {
      throw new Error("No Location header in create contact response");
    }

    const contactId = parseInt(locationHeader.split("/").pop() || "", 10);
    if (isNaN(contactId)) {
      throw new Error("Invalid contact ID in Location header");
    }

    console.log("Created new contact with ID:", contactId);
    return { contactId };
  } catch (error) {
    console.error("Error in findOrCreateFikenContact:", error);
    throw error;
  }
}
