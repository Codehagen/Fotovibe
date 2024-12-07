"use client";

import { createSubscription } from "@/app/actions/admin/create-subscription";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createDefaultPlans } from "@/app/actions/admin/create-plan";

interface SubscriptionSummaryProps {
  workspaceId: string;
}

export function SubscriptionSummary({ workspaceId }: SubscriptionSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSubscription = async (planName: string) => {
    try {
      setIsLoading(true);

      // Create default plans if they don't exist
      const plansResult = await createDefaultPlans();
      console.log("Plans creation result:", plansResult);

      const result = await createSubscription({
        workspaceId,
        planId: planName, // This should match exactly with the plan name in DB
        isYearly: false,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Abonnement opprettet");
      window.location.reload(); // Reload to show new subscription
    } catch (error) {
      toast.error("Kunne ikke opprette abonnement");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle>Ingen aktivt abonnement</CardTitle>
        </div>
        <CardDescription>
          Dette arbeidsområdet har ingen aktivt abonnement. Velg en plan under
          for å aktivere tjenesten.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Basic</CardTitle>
            <CardDescription>10.000 kr / mnd</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                Opptil 5 brukere
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                10 oppdrag per måned
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleCreateSubscription("Basic")}
              disabled={isLoading}
            >
              Velg Basic
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>15.000 kr / mnd</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                Opptil 15 brukere
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                30 oppdrag per måned
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleCreateSubscription("Pro")}
              disabled={isLoading}
            >
              Velg Pro
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>20.000 kr / mnd</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                Ubegrenset brukere
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                Ubegrenset oppdrag
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleCreateSubscription("Enterprise")}
              disabled={isLoading}
            >
              Velg Enterprise
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
}
