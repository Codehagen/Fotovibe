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
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { createWorkspaceOrder } from "@/app/actions/admin/create-workspace-order";
import { formatPrice } from "@/lib/subscription-plans";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteConfig } from "@/lib/config";
import { testFikenInvoice } from "@/app/actions/admin/test-fiken-invoice";

const formSchema = z.object({
  packageType: z.enum(["BASIC", "PRO", "ENTERPRISE"]),
  requirements: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PHOTO_PACKAGES = siteConfig.pricing.reduce((acc, plan) => {
  return {
    ...acc,
    [plan.name]: {
      name: plan.name,
      description: plan.description,
      price: parseInt(plan.price),
      yearlyPrice: parseInt(plan.yearlyPrice),
      features: plan.features,
    },
  };
}, {} as Record<string, {
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  features: string[];
}>);

interface CreateWorkspaceOrderProps {
  workspaceId: string;
}

export function CreateWorkspaceOrder({
  workspaceId,
}: CreateWorkspaceOrderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      packageType: "BASIC",
      requirements: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const selectedPackage = PHOTO_PACKAGES[values.packageType];
      const orderInput = {
        packageType: values.packageType,
        packagePrice: selectedPackage.price,
        yearlyPackagePrice: selectedPackage.yearlyPrice,
        requirements: values.requirements,
      };

      const orderResult = await createWorkspaceOrder(workspaceId, orderInput);

      if (orderResult.success) {
        // Commenting out invoice creation for testing
        /* 
        const invoiceResult = await testFikenInvoice();

        if (invoiceResult.success) {
          toast.success("Ordre og faktura opprettet");
        } else {
          toast.error(
            `Ordre opprettet, men feilet å opprette faktura: ${invoiceResult.error}`
          );
        }
        */

        // Simple success message for order creation only
        toast.success("Ordre opprettet");
        
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(orderResult.error || "Kunne ikke opprette ordre");
      }
    } catch (error) {
      toast.error("Noe gikk galt");
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ny ordre
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opprett ny ordre</DialogTitle>
          <DialogDescription>Velg fotopakke for denne ordren</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="packageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Velg fotopakke</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Velg en pakke" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Fotopakker</SelectLabel>
                        {siteConfig.pricing.map((plan) => (
                          <SelectItem key={plan.name} value={plan.name}>
                            <div className="flex justify-between items-center w-full gap-8">
                              <div>
                                {plan.name} - {plan.features[0]}
                              </div>
                              <div className="text-muted-foreground">
                                {formatPrice(parseInt(plan.price))}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spesielle ønsker (valgfritt)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="F.eks. spesielle vinkler, fokusområder eller andre ønsker..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Oppretter..." : "Opprett ordre"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
