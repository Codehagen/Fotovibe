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
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ConfirmationDialog } from "@/components/admin/approval/confirmation-dialog";
import { useState, useEffect } from "react";
import {
  approveBusinessRequest,
  rejectBusinessRequest,
} from "@/app/actions/admin/handle-approvals";
import { getBusinessDetails } from "@/app/actions/admin/get-business-details";
import { toast } from "sonner";
import { BusinessDetailSkeleton } from "@/components/admin/approval/business-detail-skeleton";

interface BusinessDetails {
  id: string;
  companyName: string;
  companyOrgnr: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  status: string;
}

export default function BusinessDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const result = await getBusinessDetails(params.id);
      if (result.success && result.data) {
        setBusiness(result.data as BusinessDetails);
      } else {
        setError(result.error || "Could not load business details");
        toast.error("Kunne ikke laste inn bedriftsdetaljer");
        router.push("/admin/approvals");
      }
    }
    loadData();
  }, [params.id, router]);

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      const result = await approveBusinessRequest(params.id);

      if (result.success) {
        toast.success("Bedriften ble godkjent");
        router.push("/admin/approvals");
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke godkjenne bedriften");
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
      const result = await rejectBusinessRequest(params.id);

      if (result.success) {
        toast.success("Bedriften ble avvist");
        router.push("/admin/approvals");
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke avvise bedriften");
      }
    } catch (error) {
      toast.error("En feil oppstod under avvisning");
    } finally {
      setIsLoading(false);
      setIsRejectDialogOpen(false);
    }
  };

  if (!business) {
    return <BusinessDetailSkeleton />;
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
              Bedrift Godkjenning
            </h2>
            <p className="text-muted-foreground">
              Gjennomgå og godkjenn bedriftsforespørsel
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
            <CardTitle>Bedriftsinformasjon</CardTitle>
            <CardDescription>Detaljer om bedriften</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{business.companyName}</p>
                <p className="text-sm text-muted-foreground">
                  Org.nr: {business.companyOrgnr}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">E-post</p>
                <p className="text-sm text-muted-foreground">
                  {business.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Telefon</p>
                <p className="text-sm text-muted-foreground">
                  {business.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">ID</p>
                <p className="text-sm text-muted-foreground">{business.id}</p>
              </div>
            </div>
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
                  {format(new Date(business.createdAt), "PPP", { locale: nb })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Sist oppdatert</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(business.updatedAt), "PPP", { locale: nb })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tilleggsinformasjon</CardTitle>
            <CardDescription>Notater og annen informasjon</CardDescription>
          </CardHeader>
          <CardContent>
            {business.notes ? (
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <p className="font-medium">Notater</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {business.notes}
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                Ingen tilleggsinformasjon tilgjengelig
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        isOpen={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        onConfirm={handleApprove}
        title="Godkjenn bedrift"
        description="Er du sikker på at du vil godkjenne denne bedriften? Dette vil gi dem tilgang til plattformen."
        isApproval={true}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleReject}
        title="Avvis bedrift"
        description="Er du sikker på at du vil avvise denne bedriften? Dette vil informere dem om at forespørselen ble avvist."
        isApproval={false}
        isLoading={isLoading}
      />
    </div>
  );
}
