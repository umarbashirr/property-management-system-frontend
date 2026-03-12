import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/features/auth/types/auth.types";

const roleConfig: Record<UserRole, { label: string; variant: "default" | "secondary" | "outline" }> = {
  super_admin: { label: "Super Admin", variant: "default" },
  tenant_admin: { label: "Tenant Admin", variant: "default" },
  property_manager: { label: "Property Manager", variant: "secondary" },
  front_desk: { label: "Front Desk", variant: "outline" },
  housekeeping: { label: "Housekeeping", variant: "outline" },
  accountant: { label: "Accountant", variant: "outline" },
};

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const config = roleConfig[role] ?? { label: role, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
