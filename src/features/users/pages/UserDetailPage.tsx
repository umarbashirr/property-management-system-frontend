import { Link, useParams } from "react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { UserRoleBadge } from "@/features/users/components/UserRoleBadge";
import { UserForm } from "@/features/users/components/UserForm";
import { PropertyAssignments } from "@/features/users/components/PropertyAssignments";
import { useUser } from "@/features/users/hooks/useUser";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError } = useUser(id!);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">Staff member not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This user may have been removed or the ID is invalid.
        </p>
        <Link
          to="/users"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <IconArrowLeft size={16} />
          Back to team
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* Navigation + header */}
      <div>
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft size={16} />
          Back to team
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {user.firstName} {user.lastName}
          </h1>
          <UserRoleBadge role={user.role} />
          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      </div>

      {/* Edit form */}
      <UserForm mode="edit" defaultValues={user} />

      {/* Property assignments */}
      <PropertyAssignments userId={id!} assignments={user.propertyAssignments} />
    </div>
  );
}
