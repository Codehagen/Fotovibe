import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { redirect } from "next/navigation";

export default async function OrdrePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Hey {user?.name?.split(" ")[0]}, Velommen tilbake 👋
        </h2>
        <div className="hidden items-center space-x-2 md:flex">
          {/* Add any action buttons here if needed */}
        </div>
      </div>

      {/* TopCharts placeholder */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>

      {/* MetricCards placeholder */}
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
}
