"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteEditor } from "@/app/actions/admin/delete-editor";
import { useState } from "react";

interface Editor {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  language: string | null;
  _count: {
    orders: number;
  };
}

interface EditorsTableProps {
  data: Editor[];
}

export function EditorsTable({ data }: EditorsTableProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (editorId: string) => {
    try {
      setIsDeleting(true);
      const response = await deleteEditor(editorId);

      if (!response.success) {
        throw new Error(response.error);
      }

      toast.success("Editor slettet", {
        description: "Editoren har blitt deaktivert.",
      });
    } catch (error) {
      toast.error("Feil", {
        description:
          error instanceof Error ? error.message : "Kunne ikke slette editor",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Navn</TableHead>
            <TableHead>E-post</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Språk</TableHead>
            <TableHead>Ordre</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((editor) => (
            <TableRow key={editor.id}>
              <TableCell>{editor.name || "N/A"}</TableCell>
              <TableCell>{editor.email}</TableCell>
              <TableCell>{editor.phone || "N/A"}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {editor.language === "norwegian"
                    ? "Norsk"
                    : editor.language === "english"
                    ? "Engelsk"
                    : editor.language === "swedish"
                    ? "Svensk"
                    : editor.language === "danish"
                    ? "Dansk"
                    : "N/A"}
                </Badge>
              </TableCell>
              <TableCell>{editor._count.orders}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Dette vil deaktivere editoren. De vil ikke lenger
                          kunne få tilgang til systemet eller motta nye oppdrag.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(editor.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Sletter..." : "Slett"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
