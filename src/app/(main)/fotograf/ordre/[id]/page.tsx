import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { getOrder } from "@/app/actions/orders/get-order";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { UpdateOrderStatus } from "@/components/photographer/update-order-status";
import { OrderTimeline } from "@/components/photographer/order-timeline";
import { prisma } from "@/lib/db";
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
  CalendarDays,
  Edit,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { EmptyPlaceholder } from "@/components/empty-placeholder";
import { LucideIcon } from "lucide-react";
import { OrderChecklist } from "@/components/photographer/order-checklist";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";

interface OrderPageProps {
  params: {
    id: string;
  };
}

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
      <span>{value}</span>
    </div>
  );
}

export default async function OrderPage({ params }: OrderPageProps) {
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

  // Get workspace details including contact person
  const workspace = await prisma.workspace.findUnique({
    where: { id: order.workspaceId },
    include: {
      users: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Get or create checklist with all fields
  const checklist = (await prisma.orderChecklist.findUnique({
    where: { orderId: order.id },
  })) || {
    contactedAt: null,
    scheduledAt: null,
    dropboxUrl: null,
    uploadedAt: null,
    contactNotes: null,
    schedulingNotes: null,
    uploadNotes: null,
  };

  // Show empty state if no scheduled date
  if (!order.scheduledDate) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon icon={CalendarDays} />
          <EmptyPlaceholder.Title>Ingen dato valgt</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Du må velge en dato for fotografering før du kan se flere detaljer.
          </EmptyPlaceholder.Description>
          <OrderChecklist
            requirements={order.requirements}
            orderId={order.id}
            checklist={checklist}
          />
        </EmptyPlaceholder>
      </div>
    );
  }

  // Show empty state if no workspace found
  if (!workspace) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon icon={AlertCircle} />
          <EmptyPlaceholder.Title>Kunde ikke funnet</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Vi kunne ikke finne informasjon om kunden. Kontakt support hvis
            dette fortsetter.
          </EmptyPlaceholder.Description>
        </EmptyPlaceholder>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Oppdrag for {order.workspace.name}
          </h2>
          <p className="text-muted-foreground">
            Planlagt{" "}
            {format(new Date(order.scheduledDate), "PPP", { locale: nb })}
          </p>
        </div>
        <UpdateOrderStatus order={order} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kundeinformasjon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{workspace?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {workspace?.address}, {workspace?.zip} {workspace?.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>Org.nr: {workspace?.orgnr}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Kontaktperson
                </p>
                {workspace.users[0] ? (
                  <div className="space-y-2">
                    <ContactInfo
                      label="Navn"
                      value={workspace.users[0].name}
                      icon={User}
                    />
                    <ContactInfo
                      label="Telefon"
                      value={workspace.users[0].phone}
                      icon={Phone}
                    />
                    <ContactInfo
                      label="E-post"
                      value={workspace.users[0].email}
                      icon={Mail}
                    />
                    {(!workspace.users[0].phone ||
                      !workspace.users[0].email) && (
                      <div className="mt-2 rounded-md bg-yellow-50 p-3">
                        <div className="flex items-center gap-2 text-sm text-yellow-800">
                          <AlertCircle className="h-4 w-4" />
                          <div className="space-y-1">
                            <p className="font-medium">
                              Manglende kontaktinformasjon
                            </p>
                            <p className="text-yellow-700">
                              {!workspace.users[0].phone &&
                              !workspace.users[0].email
                                ? "Både telefonnummer og e-post mangler."
                                : !workspace.users[0].phone
                                ? "Telefonnummer mangler."
                                : "E-post mangler."}{" "}
                              Be kunden oppdatere sin profil.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyPlaceholder className="h-auto">
                    <EmptyPlaceholder.Icon icon={User} />
                    <EmptyPlaceholder.Title>
                      Ingen kontaktperson
                    </EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description>
                      Det er ikke registrert noen kontaktperson for denne
                      kunden.
                    </EmptyPlaceholder.Description>
                  </EmptyPlaceholder>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Foretrukket tid
                </p>
                {workspace.preferredDays?.length ||
                workspace.preferredTimes?.length ? (
                  <div className="space-y-1">
                    {workspace.preferredDays?.length ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          Dager: {workspace.preferredDays.join(", ")}
                        </span>
                      </div>
                    ) : null}
                    {workspace.preferredTimes?.length ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          Tider: {workspace.preferredTimes.join(", ")}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <EmptyPlaceholder className="h-auto">
                    <EmptyPlaceholder.Icon icon={Clock} />
                    <EmptyPlaceholder.Title>
                      Ingen preferanser
                    </EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description>
                      Kunden har ikke angitt noen foretrukne tidspunkter.
                    </EmptyPlaceholder.Description>
                  </EmptyPlaceholder>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Oppdragsinformasjon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <Badge
                  variant={
                    order.status === "COMPLETED"
                      ? "default"
                      : order.status === "IN_PROGRESS"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {order.status === "NOT_STARTED"
                    ? "Ikke startet"
                    : order.status === "IN_PROGRESS"
                    ? "Under arbeid"
                    : "Fullført"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Lokasjon
                </p>
                <p>{order.location}</p>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Antall bilder
                  </p>
                  <p>{order.photoCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Antall videoer
                  </p>
                  <p>{order.videoCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {order.status === "IN_PROGRESS" ? (
            <OrderChecklist
              requirements={order.requirements}
              orderId={order.id}
              checklist={order.checklist}
            />
          ) : order.status === "EDITING" ? (
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon icon={Edit} />
              <EmptyPlaceholder.Title>Under redigering</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                Oppdraget er nå sendt til redigering. Du vil få beskjed når
                bildene er klare for gjennomgang.
              </EmptyPlaceholder.Description>
              {order.checklist?.dropboxUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={order.checklist.dropboxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Åpne i Dropbox
                  </a>
                </Button>
              )}
            </EmptyPlaceholder>
          ) : null}
          <OrderTimeline order={order} />
        </div>
      </div>
    </div>
  );
}
