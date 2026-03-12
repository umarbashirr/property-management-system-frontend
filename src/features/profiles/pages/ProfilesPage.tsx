import { useState } from "react";
import { Link } from "react-router";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProfileFilters } from "@/features/profiles/components/ProfileFilters";
import { ProfileTable } from "@/features/profiles/components/ProfileTable";
import { DeleteProfileDialog } from "@/features/profiles/components/DeleteProfileDialog";
import { BlacklistDialog } from "@/features/profiles/components/BlacklistDialog";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import { useSetVip } from "@/features/profiles/hooks/useSetVip";
import type { ListProfilesQuery, Profile } from "@/features/profiles/types/profiles.types";

export function ProfilesPage() {
  const [filters, setFilters] = useState<Partial<ListProfilesQuery>>({ page: 1, limit: 20 });
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [blacklistTarget, setBlacklistTarget] = useState<Profile | null>(null);

  const { data, isLoading } = useProfiles(filters);
  const vipMutation = useSetVip();

  const profiles = data?.data ?? [];
  const meta = data?.meta;

  function handleFiltersChange(next: Partial<ListProfilesQuery>) {
    setFilters(next);
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
  }

  function handleVipToggle(profile: Profile) {
    vipMutation.mutate(
      { id: profile.id, dto: { isVip: !profile.isVip } },
      {
        onSuccess: () => {
          toast.success(
            profile.isVip ? "VIP status removed." : "Marked as VIP.",
          );
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage guest, booker, and corporate profiles.
          </p>
        </div>
        <Button size="lg" render={<Link to="/profiles/new" />} className="flex items-center gap-2">
          <IconPlus size={16} />
          New profile
        </Button>
      </div>

      {/* Filters */}
      <ProfileFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Table */}
      <ProfileTable
        profiles={profiles}
        isLoading={isLoading}
        onDeleteClick={setDeleteTarget}
        onBlacklistClick={setBlacklistTarget}
        onVipToggle={handleVipToggle}
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
      <DeleteProfileDialog
        profile={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />

      {/* Blacklist dialog */}
      <BlacklistDialog
        profile={blacklistTarget}
        open={blacklistTarget !== null}
        onOpenChange={(open) => {
          if (!open) setBlacklistTarget(null);
        }}
      />
    </div>
  );
}
