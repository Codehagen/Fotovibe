import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HelpCircle, Check, X } from "lucide-react";
import { TestimonialSlider } from "@/components/sections/testimonials-slider";
import { ProductComparisonSlider } from "@/components/product-comparison-slider";

export const metadata = {
  title: "FotoVibe vs Competition | Compare Photo Sharing Platforms",
  description:
    "See how FotoVibe compares to other photo sharing platforms and discover why it's the best choice for your photography needs.",
};

interface ComparisonFeature {
  name: string;
  description: string;
  fotovibe: string | boolean;
  competitor: string | boolean;
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    name: "Kostnadsmodell",
    description: "Hvordan du betaler for tjenesten",
    fotovibe: "Fast månedspris",
    competitor: "Per oppdrag",
  },
  {
    name: "Leveringstid",
    description: "Tid fra bestilling til levering",
    fotovibe: "Fast hver måned",
    competitor: "2-4 uker",
  },
  {
    name: "Fotografer",
    description: "Tilgang til profesjonelle fotografer",
    fotovibe: "Fast fotograf",
    competitor: "Varierer",
  },
  {
    name: "Bildekvalitet",
    description: "Konsistent kvalitet på innhold",
    fotovibe: true,
    competitor: false,
  },
  {
    name: "Abonnement",
    description: "Fleksibel løsning uten binding",
    fotovibe: true,
    competitor: false,
  },
  {
    name: "Forutsigbarhet",
    description: "Fast pris og leveringstid",
    fotovibe: true,
    competitor: false,
  },
  {
    name: "Digital plattform",
    description: "Enkel administrasjon av bilder",
    fotovibe: true,
    competitor: false,
  },
  {
    name: "Merkevarebygging",
    description: "Konsistent visuell profil",
    fotovibe: true,
    competitor: false,
  },
];

const PRODUCTS = {
  fotovibe: {
    name: "FotoVibe",
    logo: "https://avatar.vercel.sh/fotovibe",
    isRecommended: true,
  },
  competitor: {
    name: "Competitor",
    logo: "https://avatar.vercel.sh/competitor",
    isRecommended: false,
  },
};

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-green-500" />
    ) : (
      <X className="mx-auto h-5 w-5 text-gray-300" />
    );
  }
  return <span>{value}</span>;
}

function ComparisonHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-center space-x-12 md:space-x-24">
        <Image
          src={PRODUCTS.fotovibe.logo}
          alt={`${PRODUCTS.fotovibe.name} Logo`}
          width={140}
          height={140}
          className="rounded-xl shadow-lg"
        />
        <div className="flex flex-col items-center">
          <h1 className="text-5xl font-bold text-gray-800 md:text-6xl">
            {PRODUCTS.fotovibe.name}
            <span className="mx-2 text-gray-600">vs</span>
            {PRODUCTS.competitor.name}
          </h1>
          <p className="mt-4 max-w-[400px] text-gray-600">
            Learn how {PRODUCTS.fotovibe.name} compares to{" "}
            {PRODUCTS.competitor.name} and why {PRODUCTS.fotovibe.name} is the
            best {PRODUCTS.competitor.name} alternative for all your photography
            needs.
          </p>
        </div>
        <Image
          src={PRODUCTS.competitor.logo}
          alt={`${PRODUCTS.competitor.name} Logo`}
          width={140}
          height={140}
          className="rounded-xl shadow-lg"
        />
      </div>
      <div className="mt-10 flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <Button size="lg" className="rounded-full">
          Start for Free
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full border-gray-300"
        >
          Migrate from {PRODUCTS.competitor.name}
        </Button>
      </div>
    </div>
  );
}

function ComparisonTable() {
  return (
    <div className="rounded-lg border bg-background/60 backdrop-blur-xl p-6 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">Sammenlign planer</h2>
                  <p className="text-sm text-muted-foreground">
                    Finn den perfekte planen for dine behov
                  </p>
                </div>
              </th>
              {[PRODUCTS.fotovibe, PRODUCTS.competitor].map((product) => (
                <th key={product.name} className="p-4 text-center">
                  <div
                    className={`relative space-y-2 ${
                      product.isRecommended
                        ? "rounded-xl border-2 border-primary/20 bg-primary/5 p-6"
                        : "p-6"
                    }`}
                  >
                    {product.isRecommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground rounded-full">
                          Anbefalt
                        </span>
                      </div>
                    )}
                    <Image
                      src={product.logo}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="mx-auto rounded-lg"
                    />
                    <div className="font-semibold">{product.name}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_FEATURES.map((feature) => (
              <tr key={feature.name} className="border-t">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <span className="font-medium">{feature.name}</span>
                    <HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" />
                  </div>
                </td>
                <td className="py-4 px-4 text-center font-medium">
                  <FeatureValue value={feature.fotovibe} />
                </td>
                <td className="py-4 px-4 text-center font-medium">
                  <FeatureValue value={feature.competitor} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <main className="flex-1 bg-gradient-to-br from-purple-50 via-white to-green-50">
      <section className="container px-4 py-32 md:py-40">
        <ComparisonHeader />
      </section>

      <section className="container px-4 py-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Med Fotovibe
            <span className="block">får du en moderne løsning</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Se hvordan FotoVibe gjør bildene flottere
            <br />
            sammenlignet med tradisjonelle løsninger
          </p>
        </div>
        <ProductComparisonSlider
          leftProduct={{
            name: PRODUCTS.fotovibe.name,
            image:
              "https://images.unsplash.com/photo-1542038784456-1ea8e935640e",
          }}
          rightProduct={{
            name: PRODUCTS.competitor.name,
            image:
              "https://images.unsplash.com/photo-1542038784456-1ea8e935640e",
          }}
        />
      </section>

      <section className="mt-12 container px-4 py-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Sammenlign funksjoner
            <span className="block">og velg den beste løsningen</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Se hvordan FotoVibe skiller seg ut med profesjonelle funksjoner
            <br />
            og konkurransedyktige priser
          </p>
        </div>
        <div className="mx-auto max-w-4xl">
          <ComparisonTable />
        </div>
      </section>

      <section className="container px-4 py-32 md:py-40">
        <TestimonialSlider />
      </section>
    </main>
  );
}
