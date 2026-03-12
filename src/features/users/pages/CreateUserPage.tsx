import { Link } from "react-router";
import { IconArrowLeft, IconUsers } from "@tabler/icons-react";
import { UserForm } from "@/features/users/components/UserForm";

export function CreateUserPage() {
  return (
    <div className="mx-auto max-w-3xl pb-12">
      {/* Navigation */}
      <Link
        to="/users"
        className="group mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Back to team
      </Link>

      {/* Page header */}
      <div className="mb-10 flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <IconUsers size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Add a new staff member
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Create an account with login credentials, assign a role, and
            optionally link them to specific properties.
          </p>
        </div>
      </div>

      {/* Form */}
      <UserForm mode="create" />
    </div>
  );
}
