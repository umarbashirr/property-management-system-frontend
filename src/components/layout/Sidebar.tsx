import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
  IconBed,
  IconBuilding,
  IconBuildingEstate,
  IconCategory,
  IconChevronLeft,
  IconChevronRight,
  IconCreditCard,
  IconDashboard,
  IconUserSearch,
  IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconDashboard size={20} />,
    roles: ["super_admin", "tenant_admin", "property_manager", "front_desk", "housekeeping", "accountant"],
  },
  {
    label: "Properties",
    href: "/properties",
    icon: <IconBuildingEstate size={20} />,
    roles: ["super_admin", "tenant_admin"],
  },
  {
    label: "Guests",
    href: "/profiles",
    icon: <IconUserSearch size={20} />,
    roles: ["super_admin", "tenant_admin", "property_manager", "front_desk"],
  },
  {
    label: "Team",
    href: "/users",
    icon: <IconUsers size={20} />,
    roles: ["super_admin", "tenant_admin"],
  },
  {
    label: "Plans",
    href: "/super-admin/plans",
    icon: <IconCreditCard size={20} />,
    roles: ["super_admin"],
  },
  {
    label: "Tenants",
    href: "/super-admin/tenants",
    icon: <IconBuilding size={20} />,
    roles: ["super_admin"],
  },
];

function getPropertyNavItems(propertyId: string): NavItem[] {
  return [
    {
      label: "Room Types",
      href: `/properties/${propertyId}/room-types`,
      icon: <IconCategory size={20} />,
      roles: ["super_admin", "tenant_admin", "property_manager"],
    },
    {
      label: "Rooms",
      href: `/properties/${propertyId}/rooms`,
      icon: <IconBed size={20} />,
      roles: ["super_admin", "tenant_admin", "property_manager", "front_desk", "housekeeping"],
    },
  ];
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const role = useAuthStore((s) => s.user?.role);
  const location = useLocation();

  const visibleItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  );

  // Detect property context from URL: /properties/:propertyId (or /properties/:propertyId/...)
  // Exclude /properties/new from matching
  const propertyMatch = location.pathname.match(/^\/properties\/(?!new(?:$|\/))([^/]+)/);
  const propertyId = propertyMatch?.[1];

  const propertyNavItems = propertyId
    ? getPropertyNavItems(propertyId).filter((item) => role && item.roles.includes(role))
    : [];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <span className="text-base font-bold tracking-tight">StayOS</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
                collapsed && "justify-center px-0"
              )
            }
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {/* Property-scoped nav (visible when inside a property) */}
        {propertyNavItems.length > 0 && (
          <>
            <Separator className="my-3" />
            {!collapsed && (
              <span className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Property
              </span>
            )}
            <div className="mt-1">
              {propertyNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                      collapsed && "justify-center px-0"
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <IconChevronRight size={12} /> : <IconChevronLeft size={12} />}
      </button>
    </aside>
  );
}
