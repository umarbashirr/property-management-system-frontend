import { useState } from "react";
import { Link } from "react-router";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PlanFilters } from "@/features/plans/components/PlanFilters";
import { PlanTable } from "@/features/plans/components/PlanTable";
import { DeletePlanDialog } from "@/features/plans/components/DeletePlanDialog";
import { usePlans } from "@/features/plans/hooks/usePlans";
import type { ListPlansQuery, Plan } from "@/features/plans/types/plans.types";

export function PlansPage() {
  const [filters, setFilters] = useState<Partial<ListPlansQuery>>({ page: 1, limit: 20 });
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

  const { data, isLoading } = usePlans(filters);

  const plans = data?.data ?? [];
  const meta = data?.meta;

  function handleFiltersChange(next: Partial<ListPlansQuery>) {
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
          <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage subscription plans and their resource limits.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/super-admin/plans/new" className="flex items-center gap-2">
            <IconPlus size={16} />
            New plan
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <PlanFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Table */}
      <PlanTable
        plans={plans}
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
      <DeletePlanDialog
        plan={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
