import { useState } from "react";
import { Link } from "react-router";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { UserFilters } from "@/features/users/components/UserFilters";
import { UserTable } from "@/features/users/components/UserTable";
import { DeactivateUserDialog } from "@/features/users/components/DeactivateUserDialog";
import { useUsers } from "@/features/users/hooks/useUsers";
import type { ListUsersQuery, StaffUser } from "@/features/users/types/users.types";

export function UsersPage() {
  const [filters, setFilters] = useState<Partial<ListUsersQuery>>({ page: 1, limit: 20 });
  const [deactivateTarget, setDeactivateTarget] = useState<StaffUser | null>(null);

  const { data, isLoading } = useUsers(filters);

  const users = data?.data ?? [];
  const meta = data?.meta;

  function handleFiltersChange(next: Partial<ListUsersQuery>) {
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
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage staff members and their roles.
          </p>
        </div>
        <Button size="lg" render={<Link to="/users/new" />} className="flex items-center gap-2">
          <IconPlus size={16} />
          New staff member
        </Button>
      </div>

      {/* Filters */}
      <UserFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        onDeactivateClick={setDeactivateTarget}
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

      {/* Deactivate confirmation dialog */}
      <DeactivateUserDialog
        user={deactivateTarget}
        open={deactivateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null);
        }}
      />
    </div>
  );
}
