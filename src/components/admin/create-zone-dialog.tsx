"use client";

import { useState } from "react";
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
import { PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createZone } from "@/app/actions/admin/create-zone";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  countryId: z.string().min(1, "Country is required"),
  postalCodes: z.string().min(1, "Postal codes are required"),
});

export function CreateZoneDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Convert postal codes string to array
      const postalCodes = values.postalCodes
        .split(",")
        .map((code) => code.trim())
        .filter(Boolean);

      const result = await createZone({
        ...values,
        postalCodes,
      });

      if (result.success) {
        toast.success("Sone opprettet");
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error as string);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ny sone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opprett ny sone</DialogTitle>
          <DialogDescription>
            Definer en geografisk sone med postnumre
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn på sone</FormLabel>
                  <FormControl>
                    <Input placeholder="F.eks. Oslo Nord" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <SelectItem value="NO">Norge</SelectItem>
                      <SelectItem value="SE">Sverige</SelectItem>
                      <SelectItem value="DK">Danmark</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCodes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postnumre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Kommaseparert liste (f.eks. 0150, 0151, 0152)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Oppretter..." : "Opprett sone"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
