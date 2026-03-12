import { Link, useParams } from "react-router";
import { IconArrowLeft, IconStar, IconStarOff, IconBan, IconLoader } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileTypeBadge } from "@/features/profiles/components/ProfileTypeBadge";
import { ProfileForm } from "@/features/profiles/components/ProfileForm";
import { BlacklistDialog } from "@/features/profiles/components/BlacklistDialog";
import { useProfile } from "@/features/profiles/hooks/useProfile";
import { useSetVip } from "@/features/profiles/hooks/useSetVip";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { UserRole } from "@/features/auth/types/auth.types";

const managementRoles: UserRole[] = [
  "super_admin",
  "tenant_admin",
  "property_manager",
];

export function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading, isError } = useProfile(id!);
  const vipMutation = useSetVip();
  const role = useAuthStore((s) => s.user?.role);
  const canManage = role && managementRoles.includes(role);
  const [blacklistOpen, setBlacklistOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">Profile not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This profile may have been removed or the ID is invalid.
        </p>
        <Link
          to="/profiles"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <IconArrowLeft size={16} />
          Back to guests
        </Link>
      </div>
    );
  }

  function handleVipToggle() {
    if (!profile) return;
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
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* Navigation + header */}
      <div>
        <Link
          to="/profiles"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft size={16} />
          Back to guests
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.firstName} {profile.lastName}
          </h1>
          <ProfileTypeBadge type={profile.type} />
          {profile.isVip && (
            <Badge variant="default" className="bg-amber-500 text-white hover:bg-amber-600">
              VIP
            </Badge>
          )}
          {profile.isBlacklisted && (
            <Badge variant="destructive">Blacklisted</Badge>
          )}
        </div>
        {profile.email && (
          <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
        )}

        {/* Action buttons */}
        {canManage && (
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVipToggle}
              disabled={vipMutation.isPending}
              className="gap-1.5"
            >
              {vipMutation.isPending ? (
                <IconLoader size={14} className="animate-spin" />
              ) : profile.isVip ? (
                <IconStarOff size={14} />
              ) : (
                <IconStar size={14} />
              )}
              {profile.isVip ? "Remove VIP" : "Mark as VIP"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBlacklistOpen(true)}
              className="gap-1.5"
            >
              <IconBan size={14} />
              {profile.isBlacklisted ? "Remove blacklist" : "Blacklist"}
            </Button>
          </div>
        )}
      </div>

      {/* Edit form */}
      <ProfileForm mode="edit" defaultValues={profile} />

      {/* Blacklist dialog */}
      <BlacklistDialog
        profile={profile}
        open={blacklistOpen}
        onOpenChange={setBlacklistOpen}
      />
    </div>
  );
}
