import { Badge } from "@/components/ui/badge";
import type { RoomStatus } from "@/features/rooms/types/rooms.types";

const statusConfig: Record<RoomStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  available: { label: "Available", variant: "default" },
  occupied: { label: "Occupied", variant: "secondary" },
  dirty: { label: "Dirty", variant: "outline" },
  maintenance: { label: "Maintenance", variant: "destructive" },
  out_of_order: { label: "Out of Order", variant: "destructive" },
};

interface RoomStatusBadgeProps {
  status: RoomStatus;
}

export function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
