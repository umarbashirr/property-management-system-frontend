import { Link, useParams } from "react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { RoomForm } from "@/features/rooms/components/RoomForm";
import { RoomStatusBadge } from "@/features/rooms/components/RoomStatusBadge";
import { useRoom } from "@/features/rooms/hooks/useRoom";
import { useUpdateRoomStatus } from "@/features/rooms/hooks/useUpdateRoomStatus";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoomStatus } from "@/features/rooms/types/rooms.types";

export function RoomDetailPage() {
  const { propertyId, id } = useParams<{ propertyId: string; id: string }>();
  const { data: room, isLoading, isError } = useRoom(propertyId!, id!);
  const { mutate: changeStatus } = useUpdateRoomStatus(propertyId!);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">Room not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This room may have been deleted or the ID is invalid.
        </p>
        <Link
          to={`/properties/${propertyId}/rooms`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <IconArrowLeft size={16} />
          Back to rooms
        </Link>
      </div>
    );
  }

  function handleStatusChange(value: string | null) {
    if (value) changeStatus({ id: id!, dto: { status: value as RoomStatus } });
  }

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-6">
        <Link
          to={`/properties/${propertyId}/rooms`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft size={16} />
          Back to rooms
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Room {room.roomNumber}
            </h1>
            <RoomStatusBadge status={room.status} />
            <Badge variant={room.isActive ? "default" : "secondary"}>
              {room.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Quick status change */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Select value={room.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available" label="Available">Available</SelectItem>
                <SelectItem value="occupied" label="Occupied">Occupied</SelectItem>
                <SelectItem value="dirty" label="Dirty">Dirty</SelectItem>
                <SelectItem value="maintenance" label="Maintenance">Maintenance</SelectItem>
                <SelectItem value="out_of_order" label="Out of Order">Out of Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <RoomForm mode="edit" propertyId={propertyId!} defaultValues={room} />
    </div>
  );
}
