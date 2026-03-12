import { useState } from "react";
import { Link } from "react-router";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PropertyFilters } from "@/features/properties/components/PropertyFilters";
import { PropertyTable } from "@/features/properties/components/PropertyTable";
import { DeletePropertyDialog } from "@/features/properties/components/DeletePropertyDialog";
import { useProperties } from "@/features/properties/hooks/useProperties";
import type { ListPropertiesQuery, Property } from "@/features/properties/types/properties.types";

export function PropertiesPage() {
  const [filters, setFilters] = useState<Partial<ListPropertiesQuery>>({ page: 1, limit: 20 });
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);

  const { data, isLoading } = useProperties(filters);

  const properties = data?.data ?? [];
  const meta = data?.meta;

  function handleFiltersChange(next: Partial<ListPropertiesQuery>) {
    setFilters(next);
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your hotel properties.
          </p>
        </div>
        <Button asChild>
          <Link to="/properties/new" className="gap-2">
            <IconPlus size={16} />
            New property
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <PropertyFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Table */}
      <PropertyTable
        properties={properties}
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
      <DeletePropertyDialog
        property={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
