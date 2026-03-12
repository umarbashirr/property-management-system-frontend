import { useNavigate } from "react-router";
import {
  IconDots,
  IconEdit,
  IconStar,
  IconStarOff,
  IconBan,
  IconTrash,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileTypeBadge } from "@/features/profiles/components/ProfileTypeBadge";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Profile } from "@/features/profiles/types/profiles.types";
import type { UserRole } from "@/features/auth/types/auth.types";

const sourceLabels: Record<string, string> = {
  walk_in: "Walk-in",
  direct: "Direct",
  ota: "OTA",
  corporate: "Corporate",
  travel_agent: "Travel Agent",
  referral: "Referral",
};

const managementRoles: UserRole[] = [
  "super_admin",
  "tenant_admin",
  "property_manager",
];

interface ProfileTableProps {
  profiles: Profile[];
  isLoading: boolean;
  onDeleteClick: (profile: Profile) => void;
  onBlacklistClick: (profile: Profile) => void;
  onVipToggle: (profile: Profile) => void;
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-muted animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function ProfileTable({
  profiles,
  isLoading,
  onDeleteClick,
  onBlacklistClick,
  onVipToggle,
}: ProfileTableProps) {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const canManage = role && managementRoles.includes(role);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>VIP</TableHead>
            <TableHead>Blacklist</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : profiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                No profiles found.
              </TableCell>
            </TableRow>
          ) : (
            profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">
                  {profile.firstName} {profile.lastName}
                  {profile.companyName && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({profile.companyName})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <ProfileTypeBadge type={profile.type} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {profile.email ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {profile.phone ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {sourceLabels[profile.source] ?? profile.source}
                </TableCell>
                <TableCell>
                  {profile.isVip && (
                    <Badge variant="default" className="bg-amber-500 text-white hover:bg-amber-600">
                      VIP
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {profile.isBlacklisted && (
                    <Badge variant="destructive">Blacklisted</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                    >
                      <IconDots size={16} />
                      <span className="sr-only">Actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/profiles/${profile.id}`)}
                        className="gap-2"
                      >
                        <IconEdit size={16} />
                        View / Edit
                      </DropdownMenuItem>
                      {canManage && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onVipToggle(profile)}
                            className="gap-2"
                          >
                            {profile.isVip ? (
                              <>
                                <IconStarOff size={16} />
                                Remove VIP
                              </>
                            ) : (
                              <>
                                <IconStar size={16} />
                                Mark as VIP
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onBlacklistClick(profile)}
                            className="gap-2"
                          >
                            <IconBan size={16} />
                            {profile.isBlacklisted ? "Remove blacklist" : "Blacklist"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteClick(profile)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <IconTrash size={16} />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
