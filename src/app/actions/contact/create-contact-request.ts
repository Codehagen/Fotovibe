"use server";

import { prisma } from "@/lib/db";
import { RequestType } from "@prisma/client";

interface CreateContactRequestInput {
  name: string;
  email: string;
  phone: string;
  company: {
    name: string;
    orgnr: string;
    address: string;
    zip: string;
    city: string;
  };
  requestType?: RequestType;
}

export async function createContactRequest(input: CreateContactRequestInput) {
  try {
    // Basic validation
    if (!input.name || !input.email || !input.phone) {
      return {
        success: false,
        error: "Alle felt må fylles ut",
      };
    }

    if (!input.company.orgnr) {
      return {
        success: false,
        error: "Vennligst velg en bedrift fra søkeresultatene",
      };
    }

    // Create the contact request
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        companyName: input.company.name,
        companyOrgnr: input.company.orgnr,
        companyAddress: input.company.address,
        companyZip: input.company.zip,
        companyCity: input.company.city,
        requestType: input.requestType || "CLIENT",
        status: "PENDING",
      },
    });

    // You might want to send notifications here
    // await sendAdminNotification(contactRequest);
    // await sendConfirmationEmail(input.email);

    return {
      success: true,
      data: contactRequest,
    };
  } catch (error) {
    console.error("Error creating contact request:", error);
    return {
      success: false,
      error: "Kunne ikke opprette henvendelsen. Vennligst prøv igjen senere.",
    };
  }
}
