"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Mail,
  Phone,
  Hash,
  Clock,
  Globe,
  Camera,
  Briefcase,
  CalendarDays,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ConfirmationDialog } from "@/components/admin/approval/confirmation-dialog";
import { useState, useEffect } from "react";
import {
  approveMedia,
  rejectMedia,
} from "@/app/actions/admin/handle-approvals";
import { getPhotographerDetails } from "@/app/actions/admin/get-photographer-details";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PhotographerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companyOrgnr: string;
  companyAddress: string;
  companyZip: string;
  companyCity: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  portfolio?: string;
  experience?: string;
  equipment?: string;
  specialties: string[];
  availability?: string;
}

export default function PhotographerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photographer, setPhotographer] = useState<PhotographerDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const result = await getPhotographerDetails(params.id);
      if (result.success && result.data) {
        setPhotographer(result.data as PhotographerDetails);
      } else {
        setError(result.error || "Could not load photographer details");
        toast.error("Kunne ikke laste inn fotografdetaljer");
        router.push("/admin/approvals");
      }
    }
    loadData();
  }, [params.id, router]);

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      const result = await approveMedia(params.id);

      if (result.success) {
        toast.success("Fotografen ble godkjent");
        router.push("/admin/approvals");
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke godkjenne fotografen");
      }
    } catch (error) {
      toast.error("En feil oppstod under godkjenning");
    } finally {
      setIsLoading(false);
      setIsApproveDialogOpen(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      const result = await rejectMedia(params.id);

      if (result.success) {
        toast.success("Fotografen ble avvist");
        router.push("/admin/approvals");
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke avvise fotografen");
      }
    } catch (error) {
      toast.error("En feil oppstod under avvisning");
    } finally {
      setIsLoading(false);
      setIsRejectDialogOpen(false);
    }
  };

  if (!photographer) {
    return <div>Laster...</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/approvals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbake
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Fotograf Godkjenning
            </h2>
            <p className="text-muted-foreground">
              Gjennomgå og godkjenn fotografforespørsel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRejectDialogOpen(true)}
            disabled={isLoading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Avvis
          </Button>
          <Button
            size="sm"
            onClick={() => setIsApproveDialogOpen(true)}
            disabled={isLoading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Godkjenn
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personlig Informasjon</CardTitle>
            <CardDescription>Detaljer om fotografen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{photographer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {photographer.companyAddress}, {photographer.companyZip}{" "}
                  {photographer.companyCity}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">E-post</p>
                <p className="text-sm text-muted-foreground">
                  {photographer.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Telefon</p>
                <p className="text-sm text-muted-foreground">
                  {photographer.phone}
                </p>
              </div>
            </div>
            {photographer.portfolio && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Portfolio</p>
                  <a
                    href={photographer.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {photographer.portfolio}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
          <Separator className="my-4" />
          <CardHeader>
            <CardTitle>Tidslinjer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Registrert</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(photographer.createdAt), "PPP", {
                    locale: nb,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Sist oppdatert</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(photographer.updatedAt), "PPP", {
                    locale: nb,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fotograf Detaljer</CardTitle>
              <CardDescription>Erfaring og utstyr</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {photographer.experience && (
                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Erfaring</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {photographer.experience}
                    </p>
                  </div>
                </div>
              )}
              {photographer.equipment && (
                <div className="flex items-start gap-2">
                  <Camera className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Utstyr</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {photographer.equipment}
                    </p>
                  </div>
                </div>
              )}
              {photographer.specialties &&
                photographer.specialties.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">Spesialiteter</p>
                    <div className="flex flex-wrap gap-2">
                      {photographer.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {photographer.availability && (
                <div className="flex items-start gap-2">
                  <CalendarDays className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Tilgjengelighet</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {photographer.availability}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {photographer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Tilleggsinformasjon</CardTitle>
                <CardDescription>Notater og annen informasjon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-4 space-y-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {photographer.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        onConfirm={handleApprove}
        title="Godkjenn fotograf"
        description="Er du sikker på at du vil godkjenne denne fotografen? Dette vil gi dem tilgang til plattformen."
        isApproval={true}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleReject}
        title="Avvis fotograf"
        description="Er du sikker på at du vil avvise denne fotografen? Dette vil informere dem om at forespørselen ble avvist."
        isApproval={false}
        isLoading={isLoading}
      />
    </div>
  );
}
