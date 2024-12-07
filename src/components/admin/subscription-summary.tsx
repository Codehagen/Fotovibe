"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/subscription-plans";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UpdateSubscriptionPriceDialog } from "./update-subscription-price-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SubscriptionSummaryProps {
  subscription: {
    id: string;
    workspaceId: string;
    plan: {
      name: string;
      monthlyPrice: number;
      yearlyMonthlyPrice: number;
    };
    isYearly: boolean;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    customMonthlyPrice?: number | null;
  };
  onCancelSubscription: () => Promise<void>;
  onReactivateSubscription: () => Promise<void>;
  onUpdateBillingCycle: (isYearly: boolean) => Promise<void>;
  isLoading: boolean;
}

export function SubscriptionSummary({
  subscription,
  onCancelSubscription,
  onReactivateSubscription,
  onUpdateBillingCycle,
  isLoading,
}: SubscriptionSummaryProps) {
  const currentPrice =
    subscription.customMonthlyPrice ||
    (subscription.isYearly
      ? subscription.plan.yearlyMonthlyPrice
      : subscription.plan.monthlyPrice);

  const handleCancel = async () => {
    try {
      await onCancelSubscription();
    } catch (error) {
      console.error("Error in subscription banner:", error);
    }
  };

  const handleBillingCycleChange = async (checked: boolean) => {
    try {
      await onUpdateBillingCycle(checked);
    } catch (error) {
      console.error("Error updating billing cycle:", error);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {subscription.cancelAtPeriodEnd ? (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
              <span className="text-xl font-bold">
                {subscription.cancelAtPeriodEnd
                  ? "Abonnement avsluttes"
                  : "Aktivt abonnement"}
              </span>
            </div>
            <div className="mt-4 space-y-1 text-base text-muted-foreground">
              <p>Nåværende plan: {subscription.plan.name}</p>
              <p>Fakturering: {subscription.isYearly ? "Årlig" : "Månedlig"}</p>
              <p>Pris per måned: {formatPrice(currentPrice)}</p>
              <p>
                {subscription.cancelAtPeriodEnd ? "Avsluttes" : "Neste faktura"}
                :{" "}
                {format(new Date(subscription.currentPeriodEnd), "d.M.yyyy", {
                  locale: nb,
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Switch
                  id="yearly-billing"
                  checked={subscription.isYearly}
                  onCheckedChange={handleBillingCycleChange}
                  disabled={isLoading}
                />
                <Label htmlFor="yearly-billing" className="ml-2">
                  Årlig fakturering (2 måneder gratis)
                </Label>
              </div>
              <UpdateSubscriptionPriceDialog subscription={subscription} />
            </div>
            {subscription.cancelAtPeriodEnd ? (
              <Button
                variant="outline"
                size="sm"
                className="text-primary"
                onClick={onReactivateSubscription}
                disabled={isLoading}
              >
                {isLoading ? "Reaktiverer..." : "Reaktiver abonnement"}
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                  >
                    Avslutt abonnement
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Dette vil avslutte abonnementet ved slutten av inneværende
                      periode (
                      {format(
                        new Date(subscription.currentPeriodEnd),
                        "d. MMMM yyyy",
                        {
                          locale: nb,
                        }
                      )}
                      ). Bedriften vil ikke lenger ha tilgang til tjenesten
                      etter denne datoen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isLoading ? "Avslutter..." : "Avslutt abonnement"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
