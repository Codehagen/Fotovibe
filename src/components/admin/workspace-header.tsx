"use client";

import { Button } from "@/components/ui/button";
import { WorkspaceSheet } from "./workspace-sheet";
import { useState } from "react";
import { Pencil } from "lucide-react";

interface WorkspaceHeaderProps {
  workspace: {
    id: string;
    name: string;
    orgnr: string;
    address: string;
    city: string;
    zip: string;
    maxUsers: number;
    industry: string | null;
  };
}

export function WorkspaceHeader({ workspace }: WorkspaceHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{workspace.name}</h2>
        <p className="text-muted-foreground">
          Administrer bedriftens brukere og ordre
        </p>
      </div>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <WorkspaceSheet
        workspace={workspace}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
