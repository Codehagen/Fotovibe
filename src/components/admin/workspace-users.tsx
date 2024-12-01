"use client";

import { useEffect, useState } from "react";
import { getWorkspaceUsers } from "@/app/actions/admin/get-workspace-users";
import { DataTable } from "@/components/tables/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash,
  Loader2,
} from "lucide-react";
import { CreateUserDialog } from "./create-user-dialog";
import { RoleBadge } from "@/components/role-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditUserDialog } from "./edit-user-dialog";
import { deleteWorkspaceUser } from "@/app/actions/admin/delete-workspace-user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Navn
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "E-post",
  },
  {
    accessorKey: "role",
    header: "Rolle",
    cell: ({ row }) => {
      return <RoleBadge role={row.getValue("role")} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Opprettet",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return date ? new Date(date).toLocaleDateString("nb-NO") : "Aldri";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const [editOpen, setEditOpen] = useState(false);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Åpne meny</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Rediger
              </DropdownMenuItem>
              <DeleteUserAlert user={user} />
            </DropdownMenuContent>
          </DropdownMenu>
          <EditUserDialog
            user={user}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
        </>
      );
    },
  },
];

interface WorkspaceUsersProps {
  workspaceId: string;
}

function DeleteUserAlert({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    try {
      setIsLoading(true);
      const response = await deleteWorkspaceUser(user.id);

      if (response.success) {
        toast.success("Bruker slettet");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error("Kunne ikke slette bruker");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <DropdownMenuItem
        className="text-red-600"
        onSelect={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        <Trash className="mr-2 h-4 w-4" />
        Slett
      </DropdownMenuItem>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil permanent slette brukeren {user.name || user.email} og
              fjerne all tilgang til systemet. Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sletter...
                </>
              ) : (
                "Slett bruker"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>
      <div className="rounded-md border">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-[200px]" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border-b last:border-0"
          >
            <div className="flex space-x-4 items-center">
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-6 w-[100px]" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkspaceUsers({ workspaceId }: WorkspaceUsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const response = await getWorkspaceUsers(workspaceId);
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
      setIsLoading(false);
    }
    fetchUsers();
  }, [workspaceId]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Brukere</h3>
        <CreateUserDialog workspaceId={workspaceId} />
      </div>
      <DataTable
        columns={columns}
        data={users}
        searchKey="email"
        searchPlaceholder="Søk etter e-post..."
      />
    </div>
  );
}
