"use client";

import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function HeroSub() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="relative w-full overflow-hidden bg-background py-16">
      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Straightforward, affordable pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Find a plan that fits your needs.
            <br />
            Start for free, no credit card required.
          </p>
        </div>
      </div>

      {/* Background Pattern */}
      <DotPattern
        className={cn(
          "absolute inset-0 h-full w-full dark:opacity-20 opacity-10",
          "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
        )}
      />
    </section>
  );
}
