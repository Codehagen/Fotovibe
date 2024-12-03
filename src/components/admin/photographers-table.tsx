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
import { deletePhotographer } from "@/app/actions/admin/delete-photographer";
import { useState } from "react";

interface Photographer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  zones: {
    id: string;
    name: string;
  }[];
  _count: {
    orders: number;
  };
}

interface PhotographersTableProps {
  data: Photographer[];
}

export function PhotographersTable({ data }: PhotographersTableProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (photographerId: string) => {
    try {
      setIsDeleting(true);
      const response = await deletePhotographer(photographerId);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      toast.success("Photographer deleted", {
        description: "The photographer has been successfully deactivated.",
      });
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error
          ? error.message
          : "Failed to delete photographer",
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
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Zones</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((photographer) => (
            <TableRow key={photographer.id}>
              <TableCell>{photographer.name || "N/A"}</TableCell>
              <TableCell>{photographer.email}</TableCell>
              <TableCell>{photographer.phone || "N/A"}</TableCell>
              <TableCell>
                <Badge
                  variant={photographer.isActive ? "default" : "secondary"}
                >
                  {photographer.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {photographer.zones.map((zone) => (
                    <Badge key={zone.id} variant="outline">
                      {zone.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{photographer._count.orders}</TableCell>
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
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will deactivate the photographer. They
                          will no longer be able to access the system or receive
                          new orders.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(photographer.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
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
