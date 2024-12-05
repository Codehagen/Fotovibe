import { Check, HelpCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "BASIC",
    price: "10000",
    priceAmount: 10000,
    duration: "per mnd",
    billing: "8333 kr fakturert månedlig",
    description: "Perfekt for små og mellomstore bedrifter",
    buttonText: "Kom i gang",
    popular: false,
  },
  {
    name: "PRO",
    price: "15000",
    priceAmount: 15000,
    duration: "per mnd",
    billing: "12500 kr fakturert månedlig",
    description:
      "Ideell for voksende bedrifter med aktiv digital tilstedeværelse",
    buttonText: "Kom i gang",
    popular: true,
  },
  {
    name: "ENTERPRISE",
    price: "20000",
    priceAmount: 20000,
    duration: "per mnd",
    billing: "16667 kr fakturert månedlig",
    description: "For større bedrifter med omfattende behov",
    buttonText: "Kontakt oss",
    popular: false,
  },
];

const features = [
  "Fotosesjoner",
  "Høyoppløselige bilder",
  "Video",
  "Bilderedigering",
  "Digital bildemappe",
  "Sosiale medier-pakke",
  "Drone-fotografering",
  "Support",
  "Bindingstid",
];

const featureAvailability = [
  ["1 per måned", "1 per måned", "1 per måned"],
  ["20 bilder", "40 bilder", "Ubegrenset"],
  [false, "3-5 videoer", "Skreddersydd"],
  [true, true, true],
  [true, true, true],
  [false, true, true],
  [false, false, true],
  ["Standard", "Dedikert", "24/7 Prioritert"],
  ["Ingen", "Ingen", "Ingen"],
];

export default function PricingPlans() {
  return (
    <section id="pricing">
      <div className="container px-4 md:px-6 py-12 md:py-24 lg:py-32">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Forutsigbare, <span className="block">og rimelige priser</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Finn en plan som passer dine behov.
            <br />
            Start gratis, ingen kredittkort nødvendig.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left font-medium"></th>
                {tiers.map((tier, index) => (
                  <th key={tier.name} className="p-4 text-center font-medium">
                    <div
                      className={`rounded-2xl p-6 ${
                        tier.popular ? "bg-gray-100 ring-2 ring-blue-500" : ""
                      }`}
                    >
                      {tier.popular && (
                        <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 inline-block">
                          Mest populær
                        </span>
                      )}
                      <div className="text-lg font-semibold mb-2">
                        {tier.name}
                      </div>
                      <div className="flex items-baseline justify-center mb-1">
                        <span className="text-4xl font-bold">
                          {`${tier.priceAmount.toLocaleString("no-NO")} kr`}
                        </span>
                        {tier.priceAmount !== 0 && (
                          <span className="text-xl font-normal text-gray-500 ml-1">
                            /{tier.duration.split(" ")[1]}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mb-4 h-8">
                        {tier.priceAmount === 0 ? tier.duration : tier.billing}
                      </div>
                      <p className="text-sm text-gray-600 mb-6 h-12">
                        {tier.description}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                {tiers.map((tier, index) => (
                  <td key={`button-${tier.name}`} className="p-4 text-center">
                    <Button
                      className={`w-full ${
                        tier.popular
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-white text-blue-500 border border-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      {tier.buttonText}
                    </Button>
                  </td>
                ))}
              </tr>
              {features.map((feature, index) => (
                <tr key={feature} className="border-t border-gray-100">
                  <td className="py-4 px-4 flex items-center">
                    <span className="font-medium">{feature}</span>
                    <HelpCircle
                      className="ml-2 h-4 w-4 text-gray-400"
                      aria-label={`More info about ${feature}`}
                    />
                  </td>
                  {featureAvailability[index].map((available, tierIndex) => (
                    <td key={tierIndex} className="py-4 px-4 text-center">
                      {typeof available === "boolean" ? (
                        available ? (
                          <Check
                            className="mx-auto h-5 w-5 text-primary"
                            aria-label="Inkludert"
                          />
                        ) : (
                          <X
                            className="mx-auto h-5 w-5 text-gray-300"
                            aria-label="Ikke inkludert"
                          />
                        )
                      ) : (
                        <span className="text-sm text-gray-600">
                          {available}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-12 text-center text-sm text-gray-500">
          Alle planer inkluderer 14 dagers prøveperiode. Ingen kredittkort
          nødvendig.
        </p>
      </div>
    </section>
  );
}
