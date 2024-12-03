import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { getOrder } from "@/app/actions/orders/get-order";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { OrderTimeline } from "@/components/photographer/order-timeline";
import { ReviewOrderForm } from "@/components/photographer/review-order-form";
import { FileText, AlertCircle, Link as LinkIcon } from "lucide-react";
import { EmptyPlaceholder } from "@/components/empty-placeholder";

export default async function ReviewOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { success, data: order, error } = await getOrder(params.id);
  console.log(order);

  if (!success || !order) {
    return <div>Error: {error}</div>;
  }

  // Verify photographer has access to this order
  if (!order.photographer || order.photographer.clerkId !== user.id) {
    redirect("/fotograf");
  }

  // Verify order is in review state
  if (order.status !== "IN_REVIEW") {
    redirect(`/fotograf/ordre/${order.id}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Gjennomgang av {order.workspace.name}
        </h2>
        <p className="text-muted-foreground">
          Gjennomgå redigerte filer og godkjenn eller be om endringer
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Redigerte filer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.EditorChecklist?.reviewUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={order.EditorChecklist.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Åpne i Dropbox
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Åpne lenken over for å se de redigerte filene
                  </p>
                </div>
              ) : (
                <EmptyPlaceholder>
                  <EmptyPlaceholder.Icon icon={AlertCircle} />
                  <EmptyPlaceholder.Title>Ingen filer</EmptyPlaceholder.Title>
                  <EmptyPlaceholder.Description>
                    Editor har ikke lastet opp noen filer enda
                  </EmptyPlaceholder.Description>
                </EmptyPlaceholder>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Krav og spesifikasjoner</CardTitle>
            </CardHeader>
            <CardContent>
              {order.requirements ? (
                <div className="flex items-start gap-4">
                  <FileText className="mt-1 h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{order.requirements}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ingen spesielle krav angitt
                </p>
              )}
            </CardContent>
          </Card>

          <ReviewOrderForm orderId={order.id} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <OrderTimeline order={order} />
        </div>
      </div>
    </div>
  );
}
