"use client";

/**
 * TODO: Role-based Navigation Implementation
 *
 * Currently showing all navigation items for development purposes.
 * To implement role-based navigation:
 *
 * 1. Replace getAllNavItems() with this role-based implementation:
 *
 * const getNavItems = (role: UserRole): NavItem[] => {
 *   // Common items for all users
 *   const commonItems: NavItem[] = [
 *     { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
 *     { title: "Meldinger", url: "/messages", icon: MessageSquare },
 *     { title: "Innstillinger", url: "/settings", icon: Settings },
 *   ];
 *
 *   // Role-specific items
 *   const roleSpecificItems: Record<UserRole, NavItem[]> = {
 *     [UserRole.USER]: [
 *       { title: "Ordre", url: "/ordre", icon: Calendar },
 *       { title: "Media", url: "/media", icon: ImageIcon },
 *       { title: "Faktura", url: "/billing", icon: CreditCard },
 *     ],
 *     [UserRole.PHOTOGRAPHER]: [
 *       { title: "Oppdrag", url: "/assignments", icon: Calendar },
 *       { title: "Media", url: "/photographer/media", icon: ImageIcon },
 *       { title: "Review", url: "/review", icon: Clock },
 *     ],
 *     [UserRole.EDITOR]: [
 *       { title: "Redigering", url: "/editing", icon: Edit2 },
 *       { title: "Media", url: "/editor/media", icon: ImageIcon },
 *       { title: "Review Queue", url: "/review-queue", icon: Clock },
 *     ],
 *     [UserRole.ADMIN]: [
 *       { title: "Team", url: "/team", icon: Users },
 *       // Admin sees everything
 *       ...roleSpecificItems[UserRole.USER],
 *       ...roleSpecificItems[UserRole.PHOTOGRAPHER],
 *       ...roleSpecificItems[UserRole.EDITOR],
 *     ],
 *   };
 *
 *   return [...commonItems, ...roleSpecificItems[role]];
 * };
 *
 * 2. Update the AppSidebar component to use getNavItems:
 * const navItems = getNavItems(userRole);
 *
 * 3. Remove roleLabel from NavItem interface and related UI code
 */

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Building,
  Calendar,
  CreditCard,
  ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Settings,
  Users,
  Edit2,
  Clock,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserRole } from "@/lib/types";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  role?: UserRole[];
  isActive?: boolean;
  roleLabel?: string;
}

// Development helper to show all navigation items
const getAllNavItems = (): NavItem[] => {
  // Common items
  const commonItems: NavItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Meldinger",
      url: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Innstillinger",
      url: "/settings",
      icon: Settings,
    },
  ];

  // All role-specific items
  const allItems: NavItem[] = [
    // Admin items
    {
      title: "Admin",
      url: "/admin",
      icon: Users,
      roleLabel: "ADMIN",
    },
    {
      title: "Ordre",
      url: "/admin/orders",
      icon: Calendar,
      roleLabel: "ADMIN",
    },
    {
      title: "Faktura",
      url: "/admin/invoices",
      icon: CreditCard,
      roleLabel: "ADMIN",
    },
    // User items
    {
      title: "Bestillinger",
      url: "/ordre",
      icon: Calendar,
      roleLabel: "USER",
    },
    {
      title: "Faktura",
      url: "/billing",
      icon: CreditCard,
      roleLabel: "USER",
    },
    // Photographer items
    {
      title: "Oppdrag",
      url: "/fotograf/",
      icon: Calendar,
      roleLabel: "PHOTOGRAPHER",
    },
    {
      title: "Review",
      url: "/fotograf/review",
      icon: Clock,
      roleLabel: "PHOTOGRAPHER",
    },
    // Editor items
    {
      title: "Editor",
      url: "/editor",
      icon: Edit2,
      roleLabel: "EDITOR",
    },
  ];

  return [...commonItems, ...allItems];
};

const data = {
  user: {
    name: "Codehagen",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Workspace",
      url: "/workspace",
      icon: Building,
    },
  ] as NavItem[],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole?: UserRole;
}

export function AppSidebar({
  userRole = UserRole.USER,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();

  // During development, show all items
  const navItems = getAllNavItems();

  // Add isActive property based on current pathname
  const navMainWithActive = navItems.map((item) => ({
    ...item,
    isActive: pathname.startsWith(item.url),
  }));

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ImageIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Fotovibe</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActive} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
