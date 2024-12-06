"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSubscriptionPrice } from "@/app/actions/admin/update-subscription-price";
import { formatPrice } from "@/lib/subscription-plans";

interface UpdateSubscriptionPriceDialogProps {
  subscription: {
    id: string;
    plan: {
      name: string;
      monthlyPrice: number;
      yearlyMonthlyPrice: number;
    };
    customMonthlyPrice?: number | null;
    isYearly: boolean;
  };
}

export function UpdateSubscriptionPriceDialog({
  subscription,
}: UpdateSubscriptionPriceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState(
    subscription.customMonthlyPrice?.toString() ||
      (subscription.isYearly
        ? subscription.plan.yearlyMonthlyPrice
        : subscription.plan.monthlyPrice
      ).toString()
  );
  const router = useRouter();

  const handleUpdatePrice = async () => {
    try {
      setIsLoading(true);
      const newPrice = parseFloat(price);

      if (isNaN(newPrice) || newPrice < 0) {
        toast.error("Ugyldig pris");
        return;
      }

      const result = await updateSubscriptionPrice(subscription.id, newPrice);

      if (result.success) {
        toast.success("Pris oppdatert");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke oppdatere pris");
      }
    } catch (error) {
      toast.error("Kunne ikke oppdatere pris");
      console.error("Error updating price:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Endre pris
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Endre abonnementspris</DialogTitle>
          <DialogDescription>
            Angi ny månedlig pris for dette abonnementet.
            {subscription.customMonthlyPrice && (
              <p className="mt-2 text-muted-foreground">
                Nåværende spesialpris:{" "}
                {formatPrice(subscription.customMonthlyPrice)}
              </p>
            )}
            <p className="mt-2 text-muted-foreground">
              Standard {subscription.plan.name}-pris:{" "}
              {formatPrice(
                subscription.isYearly
                  ? subscription.plan.yearlyMonthlyPrice
                  : subscription.plan.monthlyPrice
              )}
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Månedlig pris</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Angi ny pris..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button onClick={handleUpdatePrice} disabled={isLoading}>
            {isLoading ? "Oppdaterer..." : "Oppdater pris"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
