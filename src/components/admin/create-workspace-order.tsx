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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { createWorkspaceOrder } from "@/app/actions/admin/create-workspace-order";
import { testFikenInvoice } from "@/app/actions/admin/test-fiken-invoice";

const formSchema = z.object({
  location: z.string().min(1, "Location is required"),
  scheduledDate: z.date({
    required_error: "Please select a date",
  }),
  requirements: z.string().optional(),
  photoCount: z.number().min(0).default(0),
  videoCount: z.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

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
      photoCount: 0,
      videoCount: 0,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const orderInput = {
        location: values.location,
        scheduledDate: values.scheduledDate,
        requirements: values.requirements,
        photoCount: values.photoCount,
        videoCount: values.videoCount,
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
        if (Array.isArray(orderResult.error)) {
          const errorMessage = orderResult.error
            .map((err) => err.message)
            .join(", ");
          toast.error(errorMessage);
        } else {
          toast.error(orderResult.error as string);
        }
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
          <DialogDescription>
            Fyll ut informasjonen under for å opprette en ny ordre
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasjon</FormLabel>
                  <FormControl>
                    <Input placeholder="F.eks. Storgata 1, Oslo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dato</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: nb })
                          ) : (
                            <span>Velg dato</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={nb}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="photoCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Antall bilder</FormLabel>
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
                name="videoCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Antall videoer</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Krav og spesifikasjoner (valgfritt)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Legg til spesielle krav eller ønsker..."
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
