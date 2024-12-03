"use client";

import { EmptyPlaceholder } from "@/components/empty-placeholder";
import { Button } from "@/components/ui/button";
import { createEditorProfile } from "@/app/actions/admin/create-editor-profile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";

export function EditorSetup({ userId }: { userId: string }) {
  const router = useRouter();

  const handleSetup = async () => {
    const response = await createEditorProfile(userId);
    if (response.success) {
      toast.success("Editor profile created");
      router.refresh();
    } else {
      toast.error(response.error);
    }
  };

  return (
    <EmptyPlaceholder>
      <EmptyPlaceholder.Icon icon={UserCircle} />
      <EmptyPlaceholder.Title>Editor Profile Required</EmptyPlaceholder.Title>
      <EmptyPlaceholder.Description>
        You need to set up your editor profile before you can start working on
        orders.
      </EmptyPlaceholder.Description>
      <Button onClick={handleSetup}>Set Up Editor Profile</Button>
    </EmptyPlaceholder>
  );
}
