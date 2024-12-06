"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import Image from "next/image";

export function MigrationSteps() {
  return (
    <div className="container px-4 py-24 md:py-32 bg-background">
      <div className="text-center space-y-8 mb-16">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Bytt til FotoVibe på 3 minutter
          </h2>
          <p className="text-muted-foreground text-lg">
            Å bytte til FotoVibe er enkelt. Få profesjonelle bilder og bedre
            <br />
            funksjonalitet med noen få klikk. Start i dag!
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            className="rounded-full bg-primary text-primary-foreground"
          >
            Start nå
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-border hover:bg-accent hover:text-accent-foreground"
          >
            Se migreringsguide
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Step 1 */}
        <Card className="p-6 relative bg-card text-card-foreground">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Image
                src="https://avatar.vercel.sh/competitor"
                alt="Competitor"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl">→</span>
              <Image
                src="https://avatar.vercel.sh/fotovibe"
                alt="FotoVibe"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Steg 1</h3>
            <p className="text-sm text-muted-foreground">
              Fortell oss om ditt nåværende oppsett
            </p>
            <Input
              placeholder="Nåværende leverandør..."
              className="w-full bg-background border-input"
            />
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              10 sekunder
            </div>
          </div>
        </Card>

        {/* Step 2 */}
        <Card className="p-6 relative bg-card text-card-foreground">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Din bedrift
                </span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-primary">
                  ✓
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Nåværende løsning
                </span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-primary">
                  ✓
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Steg 2</h3>
            <p className="text-sm text-muted-foreground">
              Vi lager en skreddersydd plan for din bedrift
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              20 sekunder
            </div>
          </div>
        </Card>

        {/* Step 3 */}
        <Card className="p-6 relative bg-card text-card-foreground">
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="font-semibold text-foreground">✨ Alt klart!</div>
              <p className="text-sm text-muted-foreground">
                Din nye FotoVibe-konto er klar til bruk
              </p>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Steg 3</h3>
            <p className="text-sm text-muted-foreground">
              Len deg tilbake mens vi setter opp kontoen din
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              2-3 minutter
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
