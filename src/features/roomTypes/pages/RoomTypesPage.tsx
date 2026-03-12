import { useState } from "react";
import { Link, useParams } from "react-router";
import { IconPlus, IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { RoomTypeFilters } from "@/features/roomTypes/components/RoomTypeFilters";
import { RoomTypeTable } from "@/features/roomTypes/components/RoomTypeTable";
import { DeleteRoomTypeDialog } from "@/features/roomTypes/components/DeleteRoomTypeDialog";
import { useRoomTypes } from "@/features/roomTypes/hooks/useRoomTypes";
import type { ListRoomTypesQuery, RoomType } from "@/features/roomTypes/types/roomTypes.types";

export function RoomTypesPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [filters, setFilters] = useState<Partial<ListRoomTypesQuery>>({ page: 1, limit: 20 });
  const [deleteTarget, setDeleteTarget] = useState<RoomType | null>(null);

  const { data, isLoading } = useRoomTypes(propertyId!, filters);

  const roomTypes = data?.data ?? [];
  const meta = data?.meta;

  function handleFiltersChange(next: Partial<ListRoomTypesQuery>) {
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
            <h1 className="text-2xl font-bold tracking-tight">Room Types</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage room type categories for this property.
            </p>
          </div>
        </div>
        <Button asChild size="lg">
          <Link to={`/properties/${propertyId}/room-types/new`} className="flex items-center gap-2">
            <IconPlus size={16} />
            New room type
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <RoomTypeFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Table */}
      <RoomTypeTable
        propertyId={propertyId!}
        roomTypes={roomTypes}
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
      <DeleteRoomTypeDialog
        propertyId={propertyId!}
        roomType={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
