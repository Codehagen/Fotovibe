"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TestCronButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/test/cron");
      const data = await response.json();

      if (data.success) {
        toast.success("Test completed successfully", {
          description: (
            <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
              <code className="text-white">
                {JSON.stringify(data.results, null, 2)}
              </code>
            </pre>
          ),
        });
      } else {
        toast.error("Test failed", {
          description: data.error,
        });
      }
    } catch (error) {
      toast.error("Test failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleTest} disabled={isLoading} variant="outline">
      {isLoading ? "Testing..." : "Test Cron Job"}
    </Button>
  );
}
