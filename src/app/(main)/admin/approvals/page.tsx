import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  getPendingMedia,
  getPendingBusinessRequests,
} from "@/app/actions/admin/get-pending-approvals";
import { ApprovalTables } from "@/components/admin/approval/approval-tables";
import { ApprovalStats } from "@/components/admin/approval/approval-stats";

export default async function ApprovalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.isSuperUser) redirect("/");

  const [mediaResult, businessResult] = await Promise.all([
    getPendingMedia(),
    getPendingBusinessRequests(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Godkjenninger</h2>
          <p className="text-muted-foreground">
            Administrer ventende godkjenninger for medier og bedrifter
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Superadmin</span>
          </div>
        </div>
      </div>

      {/* <ApprovalStats
        mediaCount={mediaResult.data?.length || 0}
        businessCount={businessResult.data?.length || 0}
      /> */}

      <ApprovalTables
        pendingMedia={mediaResult.data || []}
        pendingBusinesses={businessResult.data || []}
        pendingMediaSuccess={mediaResult.success}
        pendingBusinessesSuccess={businessResult.success}
      />
    </div>
  );
}
