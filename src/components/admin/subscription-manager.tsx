"use client";

import { useState } from "react";
import { ManageSubscriptionDialog } from "./manage-subscription-dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface SubscriptionManagerProps {
  workspaceId: string;
  subscription?: {
    name: string;
    package: "basic" | "premium" | "enterprise";
    amount: number;
    isActive: boolean;
  };
}

export function SubscriptionManager({
  workspaceId,
  subscription,
}: SubscriptionManagerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <CreditCard className="mr-2 h-4 w-4" />
        {subscription ? "Administrer abonnement" : "Opprett abonnement"}
      </Button>
      <ManageSubscriptionDialog
        workspaceId={workspaceId}
        open={open}
        onOpenChange={setOpen}
        initialData={subscription}
      />
    </>
  );
}
