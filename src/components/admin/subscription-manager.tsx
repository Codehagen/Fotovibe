"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  SUBSCRIPTION_PLANS,
  getMonthlyPrice,
  formatPrice,
} from "@/lib/subscription-plans";
import { toast } from "sonner";
import { updateWorkspaceSubscription } from "@/app/actions/admin/update-workspace-subscription";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SubscriptionManagerProps {
  workspaceId: string;
  currentPlan?: string;
  currentBilling?: {
    isYearly: boolean;
    startDate: Date;
    currentPeriodEnd: Date;
  };
}

export function SubscriptionManager({
  workspaceId,
  currentPlan,
  currentBilling,
}: SubscriptionManagerProps) {
  const [isYearly, setIsYearly] = useState(currentBilling?.isYearly ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (isLoading) return;

    setSelectedPlanId(planId);
    setIsLoading(true);

    try {
      const result = await updateWorkspaceSubscription(
        workspaceId,
        planId,
        isYearly
      );

      if (result.success) {
        toast.success(
          `Abonnement oppdatert til ${result.subscription.plan.name} med ${
            isYearly ? "årlig" : "månedlig"
          } fakturering`
        );
      } else {
        toast.error(result.error || "Kunne ikke oppdatere abonnement");
      }
    } catch (error) {
      toast.error("En feil oppstod under oppdatering av abonnement");
      console.error("Error selecting plan:", error);
    } finally {
      setIsLoading(false);
      setSelectedPlanId(null);
    }
  };

  // Show current subscription details if available
  const showCurrentSubscription = currentPlan && currentBilling;

  return (
    <div className="space-y-6">
      {showCurrentSubscription && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Aktivt abonnement</AlertTitle>
          <AlertDescription>
            Nåværende plan:{" "}
            {SUBSCRIPTION_PLANS.find((p) => p.id === currentPlan)?.name}
            <br />
            Fakturering: {currentBilling.isYearly ? "Årlig" : "Månedlig"}
            <br />
            Neste faktura:{" "}
            {new Date(currentBilling.currentPeriodEnd).toLocaleDateString(
              "nb-NO"
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-end space-x-2">
        <Label htmlFor="yearly">Årlig fakturering (2 måneder gratis)</Label>
        <Switch
          id="yearly"
          checked={isYearly}
          onCheckedChange={setIsYearly}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              currentPlan === plan.id ? "border-primary" : ""
            }`}
          >
            {currentPlan === plan.id && (
              <div className="absolute -top-2 -right-2 rounded-full bg-primary px-3 py-1 text-xs text-white">
                Nåværende plan
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {formatPrice(getMonthlyPrice(plan.id, isYearly))} / mnd
                {isYearly && " (fakturert årlig)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={`flex items-center ${
                      feature.included
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {feature.included ? "✓" : "×"} {feature.name}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={currentPlan === plan.id ? "outline" : "default"}
                disabled={isLoading || currentPlan === plan.id}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {isLoading && selectedPlanId === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Oppdaterer...
                  </>
                ) : currentPlan === plan.id ? (
                  "Nåværende plan"
                ) : (
                  "Velg denne planen"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {isLoading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Oppdaterer abonnement</AlertTitle>
          <AlertDescription>
            Vennligst vent mens vi behandler endringen...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
