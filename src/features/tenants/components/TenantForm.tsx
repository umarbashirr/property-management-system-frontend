import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconLoader } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTenant } from "@/features/tenants/hooks/useCreateTenant";
import { useUpdateTenant } from "@/features/tenants/hooks/useUpdateTenant";
import { isApiError } from "@/lib/api";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type { Tenant } from "@/features/tenants/types/tenants.types";

// ─── Schemas ────────────────────────────────────────────────────────────────

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createTenantSchema = z.object({
  tenant: z.object({
    name: z.string().min(1, "Tenant name is required").max(255),
    slug: z
      .string()
      .min(1, "Slug is required")
      .max(100)
      .regex(slugRegex, "Lowercase alphanumeric with hyphens only"),
    // TODO: Replace with a Select once GET /plans endpoint is available
    planId: z.string().uuid("Must be a valid plan UUID"),
  }),
  admin: z.object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    password: z.string().min(8, "Minimum 8 characters"),
  }),
});

const updateTenantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(slugRegex, "Lowercase alphanumeric with hyphens only")
    .optional(),
  planId: z.string().uuid("Must be a valid plan UUID").optional(),
  status: z.enum(["active", "suspended", "cancelled"]).optional(),
});

type CreateFormData = z.infer<typeof createTenantSchema>;
type UpdateFormData = z.infer<typeof updateTenantSchema>;

// ─── Create form ─────────────────────────────────────────────────────────────

function CreateTenantForm() {
  const { mutate, isPending, error } = useCreateTenant();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormData>({ resolver: zodResolver(createTenantSchema) });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} noValidate className="space-y-8">
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      {/* Tenant details */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Tenant details
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tenant-name">Name</Label>
            <Input id="tenant-name" placeholder="Hotel Grand Hyatt" {...register("tenant.name")} />
            {errors.tenant?.name && (
              <p className="text-sm text-destructive">{errors.tenant.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tenant-slug">Slug</Label>
            <Input id="tenant-slug" placeholder="hotel-grand-hyatt" {...register("tenant.slug")} />
            {errors.tenant?.slug && (
              <p className="text-sm text-destructive">{errors.tenant.slug.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5 max-w-sm">
          <Label htmlFor="tenant-planId">Plan ID</Label>
          <Input
            id="tenant-planId"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            {...register("tenant.planId")}
          />
          <p className="text-xs text-muted-foreground">
            UUID of the plan.{" "}
            {/* TODO: Replace with Select once GET /plans endpoint is available */}
          </p>
          {errors.tenant?.planId && (
            <p className="text-sm text-destructive">{errors.tenant.planId.message}</p>
          )}
        </div>
      </section>

      {/* Admin account */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Admin account
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="admin-firstName">First name</Label>
            <Input id="admin-firstName" placeholder="John" {...register("admin.firstName")} />
            {errors.admin?.firstName && (
              <p className="text-sm text-destructive">{errors.admin.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="admin-lastName">Last name</Label>
            <Input id="admin-lastName" placeholder="Doe" {...register("admin.lastName")} />
            {errors.admin?.lastName && (
              <p className="text-sm text-destructive">{errors.admin.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5 max-w-sm">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            placeholder="admin@hotel.com"
            {...register("admin.email")}
          />
          {errors.admin?.email && (
            <p className="text-sm text-destructive">{errors.admin.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5 max-w-sm">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            placeholder="••••••••"
            {...register("admin.password")}
          />
          {errors.admin?.password && (
            <p className="text-sm text-destructive">{errors.admin.password.message}</p>
          )}
        </div>
      </section>

      <Button type="submit" disabled={isPending}>
        {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
        {isPending ? "Creating…" : "Create tenant"}
      </Button>
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

interface EditTenantFormProps {
  tenant: Tenant;
}

function EditTenantForm({ tenant }: EditTenantFormProps) {
  const { mutate, isPending, error } = useUpdateTenant();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateTenantSchema),
    defaultValues: {
      name: tenant.name,
      slug: tenant.slug,
      planId: tenant.planId,
      status: tenant.status,
    },
  });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  const currentStatus = watch("status");

  return (
    <form
      onSubmit={handleSubmit((dto) => mutate({ id: tenant.id, dto }))}
      noValidate
      className="space-y-6 max-w-lg"
    >
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="edit-name">Name</Label>
        <Input id="edit-name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-slug">Slug</Label>
        <Input id="edit-slug" {...register("slug")} />
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-planId">Plan ID</Label>
        <Input id="edit-planId" {...register("planId")} />
        {errors.planId && <p className="text-sm text-destructive">{errors.planId.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-status">Status</Label>
        <Select
          value={currentStatus}
          onValueChange={(v) =>
            setValue("status", v as UpdateFormData["status"], { shouldValidate: true })
          }
        >
          <SelectTrigger id="edit-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

interface TenantFormProps {
  mode: "create";
}

interface TenantFormEditProps {
  mode: "edit";
  defaultValues: Tenant;
}

export function TenantForm(props: TenantFormProps | TenantFormEditProps) {
  if (props.mode === "edit") {
    return <EditTenantForm tenant={props.defaultValues} />;
  }
  return <CreateTenantForm />;
}
