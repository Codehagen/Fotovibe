import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { getOrder } from "@/app/actions/orders/get-order";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { UpdateEditorOrderStatus } from "@/components/editor/update-order-status";
import { OrderTimeline } from "@/components/photographer/order-timeline";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  Info,
  Clock,
  FileText,
  AlertCircle,
  Link as LinkIcon,
  LucideIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { EmptyPlaceholder } from "@/components/empty-placeholder";
import { EditorChecklist } from "@/components/editor/order-checklist";
import { DeleteOrderButton } from "@/components/delete-order-button";

interface ContactInfoProps {
  label: string;
  value: string | null;
  icon: LucideIcon;
}

function ContactInfo({ label, value, icon: Icon }: ContactInfoProps) {
  if (!value) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">Ingen {label.toLowerCase()}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm">{value}</span>
    </div>
  );
}

export default async function EditorOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { success, data: order, error } = await getOrder(params.id);

  if (!success || !order) {
    return <div>Error: {error}</div>;
  }

  // Verify editor has access to this order
  const isEditor = order.editor?.clerkId === user.id;
  if (!isEditor) {
    redirect("/editor");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Oppdrag for {order.workspace.name}
          </h2>
          <p className="text-muted-foreground">
            Lastet opp{" "}
            {format(new Date(order.uploadedAt!), "PPP", { locale: nb })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DeleteOrderButton orderId={order.id} />
          <UpdateEditorOrderStatus order={order} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Left column - Main content */}
        <div className="space-y-4 md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Detaljer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Lokasjon
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{order.location}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Kunde
                  </p>
                  <div className="space-y-2">
                    <ContactInfo
                      label="Bedrift"
                      value={order.workspace.name}
                      icon={Building}
                    />
                    <ContactInfo
                      label="Adresse"
                      value={`${order.workspace.address}, ${order.workspace.zip} ${order.workspace.city}`}
                      icon={MapPin}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Media
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={order.checklist?.dropboxUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Åpne i Dropbox
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {order.photoCount || 0} bilder, {order.videoCount || 0}{" "}
                        videoer
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <OrderTimeline order={order} />
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-4 md:col-span-3">
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

          <EditorChecklist
            orderId={order.id}
            checklist={order.EditorChecklist}
          />
        </div>
      </div>
    </div>
  );
}
