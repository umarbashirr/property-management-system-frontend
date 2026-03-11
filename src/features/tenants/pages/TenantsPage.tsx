import { useState } from "react";
import { Link } from "react-router";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TenantFilters } from "@/features/tenants/components/TenantFilters";
import { TenantTable } from "@/features/tenants/components/TenantTable";
import { DeleteTenantDialog } from "@/features/tenants/components/DeleteTenantDialog";
import { useTenants } from "@/features/tenants/hooks/useTenants";
import type { ListTenantsQuery, Tenant } from "@/features/tenants/types/tenants.types";

export function TenantsPage() {
  const [filters, setFilters] = useState<Partial<ListTenantsQuery>>({ page: 1, limit: 20 });
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);

  const { data, isLoading } = useTenants(filters);

  const tenants = data?.data ?? [];
  const meta = data?.meta;

  function handleFiltersChange(next: Partial<ListTenantsQuery>) {
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
          <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all tenants on the platform.
          </p>
        </div>
        <Button asChild>
          <Link to="/super-admin/tenants/new" className="gap-2">
            <IconPlus size={16} />
            New tenant
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <TenantFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Table */}
      <TenantTable
        tenants={tenants}
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
      <DeleteTenantDialog
        tenant={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
