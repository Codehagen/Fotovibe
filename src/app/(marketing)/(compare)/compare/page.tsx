import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const metadata = {
  title: "FotoVibe vs Competition | Compare Photo Sharing Platforms",
  description:
    "See how FotoVibe compares to other photo sharing platforms and discover why it's the best choice for your photography needs.",
};

export default function ComparePage() {
  return (
    <main className="flex-1 bg-gradient-to-br from-purple-50 via-white to-green-50">
      <section className="container px-4 py-32 md:py-40">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center space-x-12 md:space-x-24">
            <Image
              src="https://avatar.vercel.sh/fotovibe"
              alt="FotoVibe Logo"
              width={140}
              height={140}
              className="rounded-xl shadow-lg"
            />
            <div className="flex flex-col items-center">
              <h1 className="text-5xl font-bold text-gray-800 md:text-6xl">
                FotoVibe
                <span className="mx-2 text-gray-600">vs</span>
                Competitor
              </h1>
              <p className="mt-4 max-w-[400px] text-gray-600">
                Learn how FotoVibe compares to Competitor and why FotoVibe is
                the best Competitor alternative for all your photography needs.
              </p>
            </div>
            <Image
              src="https://avatar.vercel.sh/competitor"
              alt="Competitor Logo"
              width={140}
              height={140}
              className="rounded-xl shadow-lg"
            />
          </div>

          <div className="mt-10 flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <Button
              size="lg"
              className="rounded-full bg-black text-white hover:bg-gray-800"
            >
              Start for Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-gray-300"
            >
              Migrate from Competitor
            </Button>
          </div>
        </div>
      </section>
      <section>
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Fotovibe vs Competitor <span className="block">forskjeller</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Fotovibe er #1 i Norge for profesjonell fotografering.
            <br />
            og hvordan vi har hjulpet dem med å styrke deres visuelle profil.
          </p>
        </div>
      </section>

      {/* Rest of the sections can be removed or modified as needed */}
    </main>
  );
}
