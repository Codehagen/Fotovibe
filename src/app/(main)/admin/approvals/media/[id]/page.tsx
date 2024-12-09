"use client";

import { getCurrentUser } from "@/app/actions/user/get-current-user";
import { redirect, useRouter } from "next/navigation";
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
  FileType,
  Info,
  Tag,
  Clock,
  Hash,
  Globe,
  Folder,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/admin/approval/confirmation-dialog";
import { useState, useEffect } from "react";
import {
  approveMedia,
  rejectMedia,
} from "@/app/actions/admin/handle-approvals";
import { toast } from "sonner";

async function getMediaDetails(id: string) {
  "use server";
  try {
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        workspace: true,
        order: {
          include: {
            photographer: true,
          },
        },
      },
    });
    return { success: true, data: media };
  } catch (error) {
    console.error("[GET_MEDIA_DETAILS]", error);
    return { success: false, error: "Could not fetch media details" };
  }
}

function formatFileSize(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export default function MediaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const result = await getMediaDetails(params.id);
      if (result.success && result.data) {
        setMedia(result.data);
      } else {
        setError(result.error || "Could not load media details");
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
        toast.success("Mediet ble godkjent");
        router.push("/admin/approvals");
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke godkjenne mediet");
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
        toast.success("Mediet ble avvist");
        router.push("/admin/approvals");
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke avvise mediet");
      }
    } catch (error) {
      toast.error("En feil oppstod under avvisning");
    } finally {
      setIsLoading(false);
      setIsRejectDialogOpen(false);
    }
  };

  if (!media) {
    return <div>Laster...</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center gap-4">
        <Link href="/admin/approvals">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Medie Godkjenning
          </h2>
          <p className="text-muted-foreground">
            Gjennomgå og godkjenn medieinnhold
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Forhåndsvisning</CardTitle>
              <CardDescription>
                {media.type === "image" ? "Bilde" : "Video"} fra{" "}
                {media.workspace.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                {media.type === "image" ? (
                  <Image
                    src={media.url || ""}
                    alt={media.title || ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={media.url || ""}
                    controls
                    className="h-full w-full"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>Teknisk informasjon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <FileType className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Filformat</p>
                  <p className="text-sm text-muted-foreground">
                    {media.format?.toUpperCase()}
                  </p>
                </div>
              </div>
              {media.size && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Filstørrelse</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(media.size)}
                    </p>
                  </div>
                </div>
              )}
              {media.tags && media.tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Tagger</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {media.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">ID</p>
                  <p className="text-sm text-muted-foreground">{media.id}</p>
                </div>
              </div>
              {media.metadata && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="font-medium mb-2">Ekstra metadata</p>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(media.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bedriftsinformasjon</CardTitle>
              <CardDescription>Detaljer om bedriften</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{media.workspace.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Org.nr: {media.workspace.orgnr}
                  </p>
                </div>
              </div>
              {media.order?.photographer && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Fotograf</p>
                    <p className="text-sm text-muted-foreground">
                      {media.order.photographer.name}
                    </p>
                  </div>
                </div>
              )}
              {media.order && (
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Ordre</p>
                    <p className="text-sm text-muted-foreground">
                      {media.order.id}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <Separator className="my-4" />
            <CardHeader>
              <CardTitle>Mediedetaljer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Lastet opp</p>
                  <p className="text-sm text-muted-foreground">
                    {format(media.createdAt, "PPP", { locale: nb })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Sist oppdatert</p>
                  <p className="text-sm text-muted-foreground">
                    {format(media.updatedAt, "PPP", { locale: nb })}
                  </p>
                </div>
              </div>
              {media.description && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="font-medium mb-2">Beskrivelse</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {media.description}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                className="flex-1"
                variant="outline"
                size="lg"
                onClick={() => setIsRejectDialogOpen(true)}
                disabled={isLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Avvis
              </Button>
              <Button
                className="flex-1"
                size="lg"
                onClick={() => setIsApproveDialogOpen(true)}
                disabled={isLoading}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Godkjenn
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        onConfirm={handleApprove}
        title="Godkjenn medie"
        description="Er du sikker på at du vil godkjenne dette mediet? Dette vil gjøre det tilgjengelig for bedriften."
        isApproval={true}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleReject}
        title="Avvis medie"
        description="Er du sikker på at du vil avvise dette mediet? Dette vil informere bedriften om at mediet ikke ble godkjent."
        isApproval={false}
        isLoading={isLoading}
      />
    </div>
  );
}
