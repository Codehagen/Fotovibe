import { PrismaClient } from "@prisma/client";
import { SUBSCRIPTION_PLANS } from "../src/lib/subscription-plans";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create default countries
  const countries = [
    { code: "NO", name: "Norge" },
    { code: "SE", name: "Sverige" },
    { code: "DK", name: "Danmark" },
  ];

  console.log("Creating countries...");

  for (const country of countries) {
    const created = await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: {
        code: country.code,
        name: country.name,
      },
    });
    console.log(`Created/Updated country: ${created.name}`);
  }

  // Update existing workspaces without a country
  console.log("Updating workspaces without country...");

  const norway = await prisma.country.findUnique({
    where: { code: "NO" },
  });

  if (norway) {
    try {
      // Get all workspaces
      const allWorkspaces = await prisma.workspace.findMany({
        select: {
          id: true,
          country: true,
        },
      });

      // Filter workspaces without a valid country
      const workspacesNeedingUpdate = allWorkspaces.filter(
        (workspace) => !workspace.country
      );

      if (workspacesNeedingUpdate.length > 0) {
        // Update each workspace individually
        const updatePromises = workspacesNeedingUpdate.map((workspace) =>
          prisma.workspace.update({
            where: { id: workspace.id },
            data: { countryId: norway.id },
          })
        );

        await Promise.all(updatePromises);
        console.log(
          `Updated ${workspacesNeedingUpdate.length} workspaces with default country (Norge)`
        );
      } else {
        console.log("No workspaces found needing country update");
      }
    } catch (error) {
      console.error("Error updating workspaces:", error);
    }
  }

  // Create zones for Norway
  if (norway) {
    console.log("Creating zones for Norway...");

    // Bodø zone with actual postal codes
    const bodoZone = await prisma.zone.upsert({
      where: {
        id: "bodo-zone",
      },
      update: {},
      create: {
        id: "bodo-zone",
        name: "Bodø",
        countryId: norway.id,
        postalCodes: [
          "8001", // Bodø Sentrum
          "8002", // Bodø
          "8003", // Bodø
          "8004", // Bodø
          "8005", // Bodø
          "8006", // Bodø
          "8007", // Bodø
          "8008", // Bodø
          "8009", // Bodø
          "8010", // Bodø
          "8011", // Bodø
          "8012", // Bodø
          "8013", // Bodø
          "8014", // Bodø
          "8015", // Mørkved
          "8016", // Mørkved
          "8017", // Bodø
          "8018", // Bodø
          "8019", // Bodø
          "8020", // Bodø
          "8021", // Bodø
          "8022", // Bodø
          "8023", // Bodø
          "8026", // Bodø
          "8027", // Bodø
          "8028", // Mørkved
          "8029", // Bodø
          "8030", // Bodø
          "8031", // Bodø
          "8037", // Bodø
          "8038", // Bodø
          "8041", // Bodø
          "8042", // Bodø
          "8043", // Bodø
          "8045", // Bodø
          "8046", // Bodø
          "8047", // Bodø
          "8048", // Bodø
          "8049", // Bodø
        ],
      },
    });

    console.log(`Created/Updated zone: ${bodoZone.name}`);
  }

  // Create subscription plans
  console.log("Creating subscription plans...");

  for (const plan of SUBSCRIPTION_PLANS) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: plan.name },
    });

    if (!existingPlan) {
      await prisma.plan.create({
        data: {
          id: plan.id,
          name: plan.name,
          monthlyPrice: plan.monthlyPrice,
          yearlyMonthlyPrice: plan.yearlyMonthlyPrice,
          currency: plan.currency,
          photosPerMonth: plan.photosPerMonth,
          videosPerMonth: plan.videosPerMonth,
          maxLocations: plan.maxLocations,
          features: JSON.stringify(plan.features), // Convert features array to JSON string
          isActive: true,
        },
      });
      console.log(`Created plan: ${plan.name}`);
    } else {
      console.log(`Plan already exists: ${plan.name}`);
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error in seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
