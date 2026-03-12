import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import {
  IconBuilding,
  IconInfoCircle,
  IconLoader,
  IconShield,
} from "@tabler/icons-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// ─── Shared field component ─────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ id, label, hint, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

// ─── Section card wrapper ───────────────────────────────────────────────────

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function Section({ icon, title, description, children }: SectionProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

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
    <form onSubmit={handleSubmit((data) => mutate(data))} noValidate className="space-y-6">
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <IconInfoCircle
            size={16}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      {/* ── Tenant details ── */}
      <Section
        icon={<IconBuilding size={18} />}
        title="Tenant details"
        description="Organization name, URL slug, and subscription plan."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="tenant-name"
              label="Name"
              required
              hint="The organization's display name"
              error={errors.tenant?.name?.message}
            >
              <Input
                id="tenant-name"
                placeholder="Hotel Grand Hyatt"
                {...register("tenant.name")}
              />
            </Field>

            <Field
              id="tenant-slug"
              label="Slug"
              required
              hint="Used in URLs — lowercase with hyphens"
              error={errors.tenant?.slug?.message}
            >
              <Input
                id="tenant-slug"
                placeholder="hotel-grand-hyatt"
                {...register("tenant.slug")}
              />
            </Field>
          </div>

          <div className="max-w-sm">
            <Field
              id="tenant-planId"
              label="Plan ID"
              required
              hint="UUID of the subscription plan"
              error={errors.tenant?.planId?.message}
            >
              <Input
                id="tenant-planId"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                {...register("tenant.planId")}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Admin account ── */}
      <Section
        icon={<IconShield size={18} />}
        title="Admin account"
        description="Initial administrator account for this tenant."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="admin-firstName"
              label="First name"
              required
              error={errors.admin?.firstName?.message}
            >
              <Input
                id="admin-firstName"
                placeholder="John"
                {...register("admin.firstName")}
              />
            </Field>

            <Field
              id="admin-lastName"
              label="Last name"
              required
              error={errors.admin?.lastName?.message}
            >
              <Input
                id="admin-lastName"
                placeholder="Doe"
                {...register("admin.lastName")}
              />
            </Field>
          </div>

          <div className="max-w-sm">
            <Field
              id="admin-email"
              label="Email"
              required
              error={errors.admin?.email?.message}
            >
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@hotel.com"
                {...register("admin.email")}
              />
            </Field>
          </div>

          <div className="max-w-sm">
            <Field
              id="admin-password"
              label="Password"
              required
              hint="Minimum 8 characters"
              error={errors.admin?.password?.message}
            >
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                {...register("admin.password")}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to="/super-admin/tenants"
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
          {isPending ? "Creating…" : "Create tenant"}
        </Button>
      </div>
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
      className="space-y-6"
    >
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <IconInfoCircle
            size={16}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      {/* ── Tenant details ── */}
      <Section
        icon={<IconBuilding size={18} />}
        title="Tenant details"
        description="Organization name, URL slug, plan, and status."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="edit-name"
              label="Name"
              required
              error={errors.name?.message}
            >
              <Input id="edit-name" {...register("name")} />
            </Field>

            <Field
              id="edit-slug"
              label="Slug"
              required
              error={errors.slug?.message}
            >
              <Input id="edit-slug" {...register("slug")} />
            </Field>
          </div>

          <div className="max-w-sm">
            <Field
              id="edit-planId"
              label="Plan ID"
              error={errors.planId?.message}
            >
              <Input id="edit-planId" {...register("planId")} />
            </Field>
          </div>

          <div className="max-w-xs">
            <Field id="edit-status" label="Status">
              <Select
                value={currentStatus}
                onValueChange={(v) =>
                  setValue("status", v as UpdateFormData["status"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" label="Active">Active</SelectItem>
                  <SelectItem value="suspended" label="Suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled" label="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to="/super-admin/tenants"
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
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
