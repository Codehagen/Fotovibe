"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchOrganization } from "@/app/actions/admin/search-organization";
import { createContactRequest } from "@/app/actions/contact/create-contact-request";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Icons } from "../icons";
import confetti from "canvas-confetti";
import { Textarea } from "@/components/ui/textarea";

export function PhotographerSignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    equipment: "",
    portfolio: "",
    specialties: [] as string[],
    availability: "",
  });

  // Company search state (in case they have a company)
  const [searchValue, setSearchValue] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<{
    name: string;
    orgnr: string;
    address: string;
    zip: string;
    city: string;
  } | null>(null);
  const [searchResults, setSearchResults] = useState<
    Array<{
      name: string;
      orgnr: string;
      address: string;
      zip: string;
      city: string;
    }>
  >([]);

  const debouncedSearch = useDebounce(searchValue, 300);

  // Handle organization search
  useEffect(() => {
    async function search() {
      if (debouncedSearch.length > 2) {
        const response = await searchOrganization(debouncedSearch);
        if (response.success) {
          setSearchResults(response.data);
        } else {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }
    search();
  }, [debouncedSearch]);

  // Add confetti effect function
  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await createContactRequest({
        ...formData,
        company: selectedCompany,
        requestType: "PHOTOGRAPHER",
      });

      if (response.success) {
        setIsSubmitted(true);
        toast.success("Takk for din henvendelse! Vi tar kontakt snart.");
        triggerConfetti();
      } else {
        toast.error(response.error || "Noe gikk galt. Vennligst prøv igjen.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("En feil oppstod. Vennligst prøv igjen senere.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="p-6 rounded-lg border bg-background/60 backdrop-blur-xl">
          <div className="mb-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mx-auto flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Takk for din henvendelse!
          </h3>
          <p className="text-muted-foreground mb-4">
            Vi har mottatt din søknad og vil ta kontakt med deg innen kort tid.
          </p>
          <p className="text-sm text-muted-foreground">
            Har du spørsmål i mellomtiden?{" "}
            <Link
              href="/kontakt"
              className="text-primary underline-offset-4 hover:underline"
            >
              Kontakt oss
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Information */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Fullt navn</Label>
            <Input
              id="full-name"
              placeholder="Ola Nordmann"
              required
              disabled={isLoading}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              placeholder="ola@fotograf.no"
              type="email"
              required
              disabled={isLoading}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              placeholder="999 99 999"
              type="tel"
              required
              disabled={isLoading}
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>
        </div>

        <Separator />

        {/* Professional Information */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="experience">Erfaring som fotograf</Label>
            <Textarea
              id="experience"
              placeholder="Fortell oss om din erfaring som fotograf..."
              required
              disabled={isLoading}
              value={formData.experience}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, experience: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equipment">Utstyr</Label>
            <Textarea
              id="equipment"
              placeholder="Hvilket fotoutstyr bruker du?"
              required
              disabled={isLoading}
              value={formData.equipment}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, equipment: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio/Nettside</Label>
            <Input
              id="portfolio"
              placeholder="f.eks. https://www.dinside.no"
              value={formData.portfolio}
              onChange={(e) => {
                let url = e.target.value;
                if (url && !url.match(/^https?:\/\//)) {
                  url = `https://${url}`;
                }
                setFormData((prev) => ({ ...prev, portfolio: url }));
              }}
            />
            <p className="text-xs text-muted-foreground">
              Inkluder hele nettadressen, f.eks. https://www.dinside.no
            </p>
          </div>
        </div>

        <Separator />

        {/* Optional Company Information */}
        <div className="space-y-2">
          <Label>Har du et firma? (Valgfritt)</Label>
          <div className="relative">
            <Input
              placeholder="Søk på navn eller organisasjonsnummer..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[200px] overflow-auto rounded-md border bg-popover p-1 shadow-md">
                {searchResults.map((org) => (
                  <button
                    key={org.orgnr}
                    type="button"
                    className={cn(
                      "w-full rounded-sm px-2 py-1.5 text-left text-sm",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    )}
                    onClick={() => {
                      setSelectedCompany(org);
                      setSearchValue(org.name);
                      setSearchResults([]);
                    }}
                  >
                    <div className="font-medium">{org.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Org.nr: {org.orgnr}
                      {org.address && ` • ${org.address}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            disabled={isLoading}
          />
          <label
            htmlFor="terms"
            className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Jeg godtar{" "}
            <Link
              href="/vilkar"
              className="text-primary underline-offset-4 hover:underline"
            >
              vilkårene
            </Link>{" "}
            og{" "}
            <Link
              href="/personvern"
              className="text-primary underline-offset-4 hover:underline"
            >
              personvernerklæringen
            </Link>
          </label>
        </div>

        <Button
          className="w-full"
          type="submit"
          disabled={!agreed || isLoading}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Send søknad
        </Button>
      </form>
    </div>
  );
}
