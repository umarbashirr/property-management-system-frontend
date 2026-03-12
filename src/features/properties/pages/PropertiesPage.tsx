import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { PropertyFilters } from "@/features/properties/components/PropertyFilters";
import { PropertyTable } from "@/features/properties/components/PropertyTable";
import { DeletePropertyDialog } from "@/features/properties/components/DeletePropertyDialog";
import { useProperties } from "@/features/properties/hooks/useProperties";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTenants } from "@/features/tenants/hooks/useTenants";
import type { ListPropertiesQuery, Property } from "@/features/properties/types/properties.types";

export function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useAuthStore((s) => s.user?.role);
  const isSuperAdmin = role === "super_admin";

  const urlTenantId = searchParams.get("tenantId") ?? undefined;

  const [filters, setFilters] = useState<Partial<ListPropertiesQuery>>({
    page: 1,
    limit: 20,
    tenantId: urlTenantId,
  });
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);

  // Fetch tenants for dropdown (only when super_admin)
  const { data: tenantsData, isLoading: isTenantsLoading } = useTenants(
    isSuperAdmin ? { page: 1, limit: 100 } : undefined
  );
  const tenantOptions: ComboboxOption[] = useMemo(
    () => (tenantsData?.data ?? []).map((t) => ({ value: t.id, label: t.name, meta: t.slug })),
    [tenantsData],
  );

  // Only fetch properties when we have a tenantId (for super_admin) or always (for other roles)
  const shouldFetch = !isSuperAdmin || !!filters.tenantId;
  const { data, isLoading } = useProperties(shouldFetch ? filters : undefined);

  const properties = shouldFetch ? (data?.data ?? []) : [];
  const meta = data?.meta;

  function handleTenantChange(tenantId: string) {
    setFilters((prev) => ({ ...prev, page: 1, tenantId }));
    setSearchParams({ tenantId });
  }

  function handleFiltersChange(next: Partial<ListPropertiesQuery>) {
    setFilters((prev) => ({ ...next, tenantId: prev.tenantId }));
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
  }

  const newPropertyTo = filters.tenantId
    ? `/properties/new?tenantId=${filters.tenantId}`
    : "/properties/new";

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
        <Button asChild size="lg" disabled={isSuperAdmin && !filters.tenantId}>
          <Link to={newPropertyTo} className="flex items-center gap-2">
            <IconPlus size={16} />
            New property
          </Link>
        </Button>
      </div>

      {/* Tenant selector for super_admin */}
      {isSuperAdmin && (
        <div className="max-w-sm">
          <label className="mb-1.5 block text-sm font-medium">
            Select tenant
          </label>
          <Combobox
            options={tenantOptions}
            value={filters.tenantId ?? ""}
            onChange={handleTenantChange}
            placeholder={isTenantsLoading ? "Loading tenants…" : "Choose a tenant"}
            searchPlaceholder="Search tenants…"
            disabled={isTenantsLoading}
          />
        </div>
      )}

      {/* Prompt to select tenant */}
      {isSuperAdmin && !filters.tenantId ? (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground">
            Select a tenant above to view their properties.
          </p>
        </div>
      ) : (
        <>
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
        </>
      )}

      {/* Delete confirmation dialog */}
      <DeletePropertyDialog
        property={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        tenantId={filters.tenantId}
      />
    </div>
  );
}
