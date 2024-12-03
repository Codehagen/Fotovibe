"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { updatePhotographerZones } from "@/app/actions/photographer/update-zones";

const formSchema = z.object({
  countryId: z.string().min(1, "Country is required"),
  zoneId: z.string().min(1, "Zone is required"),
});

interface ZoneSelectorProps {
  photographer: {
    id: string;
    countryId: string | null;
    zoneId: string | null;
  };
  countries: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  zones: Array<{
    id: string;
    name: string;
    countryId: string;
  }>;
}

export function ZoneSelector({
  photographer,
  countries,
  zones,
}: ZoneSelectorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryId: photographer.countryId || undefined,
      zoneId: photographer.zoneId || undefined,
    },
  });

  const selectedCountryId = form.watch("countryId");
  const filteredZones = zones.filter(
    (zone) => zone.countryId === selectedCountryId
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await updatePhotographerZones({
        photographerId: photographer.id,
        countryId: values.countryId,
        zoneIds: [values.zoneId],
      });

      if (result.success) {
        toast.success("Sone oppdatert");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="countryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Land</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg land" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zoneId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sone</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!selectedCountryId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg sone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Lagrer..." : "Lagre endringer"}
        </Button>
      </form>
    </Form>
  );
}
