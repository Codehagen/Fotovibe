"use client";

import { Button } from "@/components/ui/button";
import { createSubscription } from "@/app/actions/admin/create-subscription";
import { updateSubscription } from "@/app/actions/admin/update-subscription";
import { useState } from "react";
import { toast } from "sonner";

interface SubscriptionPlanButtonProps {
  workspaceId: string;
  planName: string;
  currentPlan: string | null;
  subscriptionId?: string;
}

export function SubscriptionPlanButton({
  workspaceId,
  planName,
  currentPlan,
  subscriptionId,
}: SubscriptionPlanButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscriptionChange = async () => {
    try {
      setIsLoading(true);

      if (currentPlan) {
        // Update existing subscription
        const result = await updateSubscription({
          subscriptionId: subscriptionId!,
          planName,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Abonnement oppdatert");
      } else {
        // Create new subscription
        const result = await createSubscription({
          workspaceId,
          planId: planName,
          isYearly: false,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Abonnement opprettet");
      }

      // Reload the page to show updated subscription
      window.location.reload();
    } catch (error) {
      toast.error(
        currentPlan
          ? "Kunne ikke oppdatere abonnement"
          : "Kunne ikke opprette abonnement"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentPlan = currentPlan === planName;

  return (
    <Button
      className="w-full"
      variant={isCurrentPlan ? "outline" : "default"}
      disabled={isCurrentPlan || isLoading}
      onClick={handleSubscriptionChange}
    >
      {isCurrentPlan
        ? "Nåværende plan"
        : currentPlan
        ? `Bytt til ${planName}`
        : `Velg ${planName}`}
    </Button>
  );
}
