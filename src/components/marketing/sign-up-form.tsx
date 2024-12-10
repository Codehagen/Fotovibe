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

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Company search state
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
    const end = Date.now() + 3 * 1000; // 3 seconds
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
      if (!selectedCompany) {
        toast.error("Vennligst velg en bedrift fra søkeresultatene");
        return;
      }

      const response = await createContactRequest({
        ...formData,
        company: selectedCompany,
      });

      if (response.success) {
        setIsSubmitted(true);
        toast.success("Takk for din henvendelse! Vi tar kontakt snart.");
        triggerConfetti(); // Trigger confetti after successful submission
      } else {
        toast.error(response.error || "Noe gikk galt. Vennligst prøv igjen.");
      }
    } catch (error) {
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
            Vi har mottatt din forespørsel og vil ta kontakt med deg innen kort
            tid.
          </p>
          <p className="text-sm text-muted-foreground">
            Har du spørsmål i mellomtiden?{" "}
            <Link
              href="/kundeservice"
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
        {/* Organization Search */}
        <div className="space-y-2">
          <Label>Søk etter din bedrift</Label>
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

        <Separator />

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
              placeholder="ola@bedrift.no"
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
              href="/terms"
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
          disabled={!agreed || isLoading || !selectedCompany}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Ta kontakt
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Allerede kunde?{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Logg inn
        </Link>
      </p>
    </div>
  );
}
