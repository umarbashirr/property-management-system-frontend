import { Link, useParams } from "react-router";
import { IconArrowLeft, IconBed } from "@tabler/icons-react";
import { RoomTypeForm } from "@/features/roomTypes/components/RoomTypeForm";

export function CreateRoomTypePage() {
  const { propertyId } = useParams<{ propertyId: string }>();

  return (
    <div className="mx-auto max-w-3xl pb-12">
      {/* Navigation */}
      <Link
        to={`/properties/${propertyId}/room-types`}
        className="group mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Back to room types
      </Link>

      {/* Page header */}
      <div className="mb-10 flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <IconBed size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create a new room type
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Define a room category with pricing, bed configuration, and
            capacity. You can always update these details later.
          </p>
        </div>
      </div>

      {/* Form */}
      <RoomTypeForm mode="create" propertyId={propertyId!} />
    </div>
  );
}
