"use client";

import { SubscriptionStatusBanner } from "./subscription-status-banner";
import { cancelWorkspaceSubscription } from "@/app/actions/admin/cancel-workspace-subscription";
import { updateWorkspaceSubscription } from "@/app/actions/admin/update-workspace-subscription";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { reactivateWorkspaceSubscription } from "@/app/actions/admin/reactivate-workspace-subscription";

interface SubscriptionManagementProps {
  subscription: {
    id: string;
    workspaceId: string;
    plan: {
      id: string;
      name: string;
      monthlyPrice: number;
      yearlyMonthlyPrice: number;
    };
    isYearly: boolean;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };
}

export function SubscriptionManagement({
  subscription,
}: SubscriptionManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      const result = await cancelWorkspaceSubscription(subscription.id);

      if (result.success) {
        toast.success("Abonnement vil bli avsluttet ved periodens slutt");
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke avslutte abonnement");
      }
    } catch (error) {
      toast.error("Kunne ikke avslutte abonnement");
      console.error("Error canceling subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true);
      const result = await reactivateWorkspaceSubscription(subscription.id);

      if (result.success) {
        toast.success("Abonnement er reaktivert");
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke reaktivere abonnement");
      }
    } catch (error) {
      toast.error("Kunne ikke reaktivere abonnement");
      console.error("Error reactivating subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBillingCycle = async (isYearly: boolean) => {
    try {
      setIsLoading(true);
      const result = await updateWorkspaceSubscription(
        subscription.workspaceId,
        subscription.plan.id,
        isYearly
      );

      if (result.success) {
        toast.success(
          `Endret til ${isYearly ? "årlig" : "månedlig"} fakturering`
        );
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke endre faktureringssyklus");
      }
    } catch (error) {
      toast.error("Kunne ikke endre faktureringssyklus");
      console.error("Error updating billing cycle:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionStatusBanner
      subscription={subscription}
      onCancelSubscription={handleCancelSubscription}
      onReactivateSubscription={handleReactivateSubscription}
      onUpdateBillingCycle={handleUpdateBillingCycle}
      isLoading={isLoading}
    />
  );
}
