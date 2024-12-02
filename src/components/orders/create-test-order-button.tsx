"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { createTestOrder } from "@/app/actions/orders/create-test-order";

export function CreateTestOrderButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onCreateTestOrder() {
    try {
      setIsLoading(true);
      const result = await createTestOrder();

      if (result.success) {
        toast.success("Testordre opprettet");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt ved opprettelse av testordre");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="secondary"
      onClick={onCreateTestOrder}
      disabled={isLoading}
    >
      <Wand2 className="mr-2 h-4 w-4" />
      {isLoading ? "Oppretter..." : "Opprett testordre"}
    </Button>
  );
}
