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
import { updateWorkspaceZones } from "@/app/actions/admin/update-workspace-zones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  countryId: z.string().min(1, "Country is required"),
  zoneIds: z.array(z.string()).min(1, "Select at least one zone"),
});

interface WorkspaceZoneSelectorProps {
  workspace: {
    id: string;
    countryId: string;
    zones: Array<{ id: string; name: string }>;
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

export function WorkspaceZoneSelector({
  workspace,
  countries,
  zones,
}: WorkspaceZoneSelectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryId: workspace.countryId,
      zoneIds: workspace.zones.map((z) => z.id),
    },
  });

  const selectedCountryId = form.watch("countryId");
  const selectedZoneIds = form.watch("zoneIds");
  const filteredZones = zones.filter(
    (zone) => zone.countryId === selectedCountryId
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await updateWorkspaceZones({
        workspaceId: workspace.id,
        ...values,
      });

      if (result.success) {
        toast.success("Soner oppdatert");
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
    <Card>
      <CardHeader>
        <CardTitle>Geografiske soner</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="countryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
              name="zoneIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soner</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                          disabled={!selectedCountryId}
                        >
                          {field.value.length > 0
                            ? `${field.value.length} soner valgt`
                            : "Velg soner"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Søk etter soner..." />
                        <CommandEmpty>Ingen soner funnet.</CommandEmpty>
                        <CommandGroup>
                          {filteredZones.map((zone) => (
                            <CommandItem
                              key={zone.id}
                              onSelect={() => {
                                const newValue = field.value.includes(zone.id)
                                  ? field.value.filter((id) => id !== zone.id)
                                  : [...field.value, zone.id];
                                form.setValue("zoneIds", newValue);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value.includes(zone.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {zone.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="mt-2">
                    {field.value.map((zoneId) => {
                      const zone = zones.find((z) => z.id === zoneId);
                      return (
                        zone && (
                          <Badge
                            key={zone.id}
                            variant="secondary"
                            className="mr-1"
                          >
                            {zone.name}
                          </Badge>
                        )
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Lagrer..." : "Lagre endringer"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
