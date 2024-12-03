"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { updateSubscription } from "@/app/actions/admin/update-subscription";
import { Loader2 } from "lucide-react";

const subscriptionPackages = {
  basic: {
    name: "Basic",
    basePrice: 10000,
    description: "Grunnpakke for mindre bedrifter",
  },
  premium: {
    name: "Premium",
    basePrice: 15000,
    description: "Utvidet pakke med flere tjenester",
  },
  enterprise: {
    name: "Enterprise",
    basePrice: 25000,
    description: "Skreddersydd løsning for store bedrifter",
  },
} as const;

const formSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  package: z.enum(["basic", "premium", "enterprise"]),
  customAmount: z.number().optional(),
  isActive: z.boolean(),
});

interface ManageSubscriptionDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    name: string;
    package: "basic" | "premium" | "enterprise";
    amount: number;
    isActive: boolean;
  };
}

export function ManageSubscriptionDialog({
  workspaceId,
  open,
  onOpenChange,
  initialData,
}: ManageSubscriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      package: initialData?.package || "basic",
      customAmount: initialData?.amount,
      isActive: initialData?.isActive ?? true,
    },
  });

  const selectedPackage = form.watch("package");
  const baseAmount = subscriptionPackages[selectedPackage].basePrice;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await updateSubscription(workspaceId, {
        name: values.name,
        package: values.package,
        amount: values.customAmount || baseAmount,
        isActive: values.isActive,
      });

      if (result.success) {
        toast.success("Abonnement oppdatert");
        router.refresh();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Administrer abonnement</DialogTitle>
          <DialogDescription>
            Oppdater abonnementsinformasjon for denne bedriften
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn på abonnement</FormLabel>
                  <FormControl>
                    <Input placeholder="F.eks. Årlig avtale 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="package"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pakketype</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg pakke" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(subscriptionPackages).map(
                        ([key, pkg]) => (
                          <SelectItem key={key} value={key}>
                            {pkg.name} - {pkg.basePrice.toLocaleString()} kr/mnd
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {subscriptionPackages[selectedPackage].description}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tilpasset beløp (valgfritt)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={baseAmount.toString()}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    La stå tomt for å bruke standard pris
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Aktiv</FormLabel>
                    <FormDescription>
                      Deaktiver for å pause abonnementet
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Lagre
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
