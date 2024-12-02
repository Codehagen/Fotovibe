import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { redirect } from "next/navigation";
import { getPhotographerReviews } from "@/app/actions/photographer/get-reviews";
import { DataTable } from "@/components/tables/admin/data-table";
import { EmptyPlaceholder } from "@/components/empty-placeholder";
import { FileText } from "lucide-react";
import { columns } from "@/components/review/columns";

export default async function ReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { success, data, error } = await getPhotographerReviews();

  if (!success || !data) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gjennomganger</h2>
        <p className="text-muted-foreground">
          Her er en oversikt over ordre som venter på gjennomgang
        </p>
      </div>

      {data.reviews.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon icon={FileText} />
          <EmptyPlaceholder.Title>Ingen gjennomganger</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Du har ingen ordre som venter på gjennomgang.
          </EmptyPlaceholder.Description>
        </EmptyPlaceholder>
      ) : (
        <DataTable columns={columns} data={data.reviews} />
      )}
    </div>
  );
}
