import { UserRole } from "@/lib/types";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/user/get-current-user";

interface AuthorizeOptions {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export async function authorizeUser({
  allowedRoles,
  redirectTo = "/dashboard",
}: AuthorizeOptions) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    redirect(redirectTo);
  }

  return user;
}
