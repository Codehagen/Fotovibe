"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Check, ChevronsUpDown } from "lucide-react";
import { createWorkspace } from "@/app/actions/admin/create-workspace";
import { Separator } from "@/components/ui/separator";
import { searchOrganization } from "@/app/actions/admin/search-organization";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/use-debounce";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  orgnr: z.string().min(9, "Organization number must be 9 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().min(4, "ZIP code must be 4 digits"),
  maxUsers: z.number().min(1, "Must allow at least 1 user"),
  industry: z.string().optional(),
});

export function CreateWorkspaceDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maxUsers: 5,
    },
  });

  useEffect(() => {
    async function search() {
      if (debouncedSearch.length > 2) {
        const response = await searchOrganization(debouncedSearch);
        if (response.success) {
          setSearchResults(response.data);
        }
      }
    }
    search();
  }, [debouncedSearch]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const response = await createWorkspace(values);
    setIsLoading(false);

    if (response.success) {
      toast.success("Bedrift opprettet");
      setOpen(false);
      form.reset();
      router.refresh();
    } else {
      toast.error(response.error as string);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ny bedrift
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opprett ny bedrift</DialogTitle>
          <DialogDescription>
            Søk etter organisasjonsnummer eller fyll ut informasjonen manuelt
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Søk etter bedrift</Label>
              <div className="relative">
                <Input
                  placeholder="Søk etter navn eller organisasjonsnummer..."
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
                          form.setValue("name", org.name);
                          form.setValue("orgnr", org.orgnr);
                          form.setValue("address", org.address);
                          form.setValue("zip", org.zip);
                          form.setValue("city", org.city);
                          toast.success("Bedriftsinformasjon hentet");
                          setSearchResults([]);
                          setSearchValue("");
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

            <Separator className="my-4" />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn</FormLabel>
                  <FormControl>
                    <Input placeholder="Bedriftsnavn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="Gateadresse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>By</FormLabel>
                    <FormControl>
                      <Input placeholder="Oslo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postnummer</FormLabel>
                    <FormControl>
                      <Input placeholder="0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="maxUsers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maks antall brukere</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bransje</FormLabel>
                  <FormControl>
                    <Input placeholder="F.eks. Eiendom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Oppretter..." : "Opprett bedrift"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
