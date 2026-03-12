import { Link, useParams } from "react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { RoomTypeForm } from "@/features/roomTypes/components/RoomTypeForm";
import { useRoomType } from "@/features/roomTypes/hooks/useRoomType";

export function RoomTypeDetailPage() {
  const { propertyId, id } = useParams<{ propertyId: string; id: string }>();
  const { data: roomType, isLoading, isError } = useRoomType(propertyId!, id!);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !roomType) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">Room type not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This room type may have been deleted or the ID is invalid.
        </p>
        <Link
          to={`/properties/${propertyId}/room-types`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <IconArrowLeft size={16} />
          Back to room types
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-6">
        <Link
          to={`/properties/${propertyId}/room-types`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft size={16} />
          Back to room types
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{roomType.name}</h1>
          <Badge variant={roomType.isActive ? "default" : "secondary"}>
            {roomType.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {roomType.code}
        </p>
      </div>

      <RoomTypeForm
        mode="edit"
        propertyId={propertyId!}
        defaultValues={roomType}
      />
    </div>
  );
}
