import { useState } from "react";
import { Link, useParams } from "react-router";
import { IconPlus, IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { RoomFilters } from "@/features/rooms/components/RoomFilters";
import { RoomTable } from "@/features/rooms/components/RoomTable";
import { DeleteRoomDialog } from "@/features/rooms/components/DeleteRoomDialog";
import { useRooms } from "@/features/rooms/hooks/useRooms";
import type { ListRoomsQuery, Room } from "@/features/rooms/types/rooms.types";

export function RoomsPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [filters, setFilters] = useState<Partial<ListRoomsQuery>>({ page: 1, limit: 20 });
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  const { data, isLoading } = useRooms(propertyId!, filters);

  const rooms = data?.data ?? [];
  const meta = data?.meta;

  function handleFiltersChange(next: Partial<ListRoomsQuery>) {
    setFilters(next);
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to={`/properties/${propertyId}`}>
              <IconArrowLeft size={16} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage individual rooms for this property.
            </p>
          </div>
        </div>
        <Button asChild size="lg">
          <Link to={`/properties/${propertyId}/rooms/new`} className="flex items-center gap-2">
            <IconPlus size={16} />
            New room
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <RoomFilters propertyId={propertyId!} filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Table */}
      <RoomTable
        propertyId={propertyId!}
        rooms={rooms}
        isLoading={isLoading}
        onDeleteClick={setDeleteTarget}
      />

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} &mdash; {meta.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => handlePageChange(meta.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => handlePageChange(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteRoomDialog
        propertyId={propertyId!}
        room={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
