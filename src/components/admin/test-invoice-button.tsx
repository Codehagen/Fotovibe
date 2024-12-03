"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { testFikenInvoice } from "@/app/actions/admin/test-fiken-invoice";

export function TestInvoiceButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleTestInvoice() {
    try {
      setIsLoading(true);
      const result = await testFikenInvoice();

      if (result.success) {
        toast.success(`Test invoice created! Fiken ID: ${result.data.fikenId}`);
      } else {
        toast.error(result.error || "Failed to create test invoice");
      }
    } catch (error) {
      console.error("Test invoice error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create test invoice"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTestInvoice}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Testing Fiken...
        </>
      ) : (
        "Test Fiken Invoice"
      )}
    </Button>
  );
}
