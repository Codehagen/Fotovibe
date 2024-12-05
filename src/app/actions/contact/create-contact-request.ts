"use server";

import { prisma } from "@/lib/db";
import { RequestType } from "@prisma/client";

interface ContactRequestData {
  name: string;
  email: string;
  phone: string;
  company?: {
    name: string;
    orgnr: string;
    address: string;
    zip: string;
    city: string;
  } | null;
  requestType?: RequestType;
  experience?: string;
  equipment?: string;
  portfolio?: string;
  specialties?: string[];
  availability?: string;
}

export async function createContactRequest(data: ContactRequestData) {
  try {
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        // Only include company data if it exists
        ...(data.company
          ? {
              companyName: data.company.name,
              companyOrgnr: data.company.orgnr,
              companyAddress: data.company.address,
              companyZip: data.company.zip,
              companyCity: data.company.city,
            }
          : {
              companyName: "",
              companyOrgnr: "",
              companyAddress: "",
              companyZip: "",
              companyCity: "",
            }),
        requestType: data.requestType || "CLIENT",
        // Include photographer specific fields
        experience: data.experience,
        equipment: data.equipment,
        portfolio: data.portfolio,
        specialties: data.specialties || [],
        availability: data.availability,
      },
    });

    return { success: true, data: contactRequest };
  } catch (error) {
    console.error("Error creating contact request:", error);
    return { success: false, error: "Failed to create contact request" };
  }
}
