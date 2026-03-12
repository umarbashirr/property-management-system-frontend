import { Badge } from "@/components/ui/badge";
import type { ProfileType } from "@/features/profiles/types/profiles.types";

const typeConfig: Record<ProfileType, { label: string; variant: "default" | "secondary" | "outline" }> = {
  individual: { label: "Individual", variant: "outline" },
  corporate: { label: "Corporate", variant: "default" },
  travel_agent: { label: "Travel Agent", variant: "secondary" },
};

interface ProfileTypeBadgeProps {
  type: ProfileType;
}

export function ProfileTypeBadge({ type }: ProfileTypeBadgeProps) {
  const config = typeConfig[type] ?? { label: type, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
