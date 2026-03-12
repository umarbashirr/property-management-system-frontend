import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import {
  IconInfoCircle,
  IconLoader,
  IconMail,
  IconPlus,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUser } from "@/features/users/hooks/useCreateUser";
import { useUpdateUser } from "@/features/users/hooks/useUpdateUser";
import { useProperties } from "@/features/properties/hooks/useProperties";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { isApiError } from "@/lib/api";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type { CreateUserDto, StaffWithProperties } from "@/features/users/types/users.types";

// ─── Constants ──────────────────────────────────────────────────────────────

const staffRoles = [
  { value: "tenant_admin", label: "Tenant Admin" },
  { value: "property_manager", label: "Property Manager" },
  { value: "front_desk", label: "Front Desk" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "accountant", label: "Accountant" },
] as const;

// ─── Schemas ────────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  role: z.enum(["tenant_admin", "property_manager", "front_desk", "housekeeping", "accountant"], {
    error: "Please select a role",
  }),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: z
    .enum(["tenant_admin", "property_manager", "front_desk", "housekeeping", "accountant"])
    .optional(),
  isActive: z.boolean().optional(),
});

type CreateFormData = z.infer<typeof createUserSchema>;
type UpdateFormData = z.infer<typeof updateUserSchema>;

// ─── Shared helpers ─────────────────────────────────────────────────────────

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

// ─── Property assignment row (create form) ──────────────────────────────────

interface PropertyAssignmentRow {
  propertyId: string;
  role: string;
}

// ─── Create form ────────────────────────────────────────────────────────────

function CreateUserForm() {
  const { mutate, isPending, error } = useCreateUser();
  const { data: propertiesData } = useProperties({ limit: 100 });
  const currentUser = useAuthStore((s) => s.user);
  const isTenantAdmin = currentUser?.role === "tenant_admin";
  const availableRoles = isTenantAdmin
    ? staffRoles.filter((r) => r.value !== "tenant_admin")
    : staffRoles;

  const [assignments, setAssignments] = useState<PropertyAssignmentRow[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormData>({ resolver: zodResolver(createUserSchema) });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  function addAssignment() {
    setAssignments((prev) => [...prev, { propertyId: "", role: "" }]);
  }

  function removeAssignment(index: number) {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAssignment(index: number, field: keyof PropertyAssignmentRow, value: string) {
    setAssignments((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  const assignedPropertyIds = new Set(assignments.map((a) => a.propertyId).filter(Boolean));
  const availableProperties = propertiesData?.data.filter(
    (p) => p.isActive
  ) ?? [];

  function onSubmit(data: CreateFormData) {
    const propertyAssignments = assignments
      .filter((a) => a.propertyId)
      .map((a) => ({
        propertyId: a.propertyId,
        ...(a.role ? { role: a.role as CreateUserDto["role"] } : {}),
      }));

    mutate({
      ...data,
      ...(propertyAssignments.length > 0 ? { propertyAssignments } : {}),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <IconInfoCircle size={16} className="mt-0.5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      {/* Account details */}
      <Section
        icon={<IconMail size={18} />}
        title="Account details"
        description="Login credentials for the new staff member."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="email"
            label="Email"
            required
            hint="Must be unique within your organization"
            error={errors.email?.message}
          >
            <Input id="email" type="email" placeholder="staff@hotel.com" {...register("email")} />
          </Field>

          <Field
            id="password"
            label="Password"
            required
            hint="Minimum 8 characters"
            error={errors.password?.message}
          >
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
          </Field>
        </div>
      </Section>

      {/* Personal information */}
      <Section
        icon={<IconUser size={18} />}
        title="Personal information"
        description="Name and role within the organization."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="firstName"
              label="First name"
              required
              error={errors.firstName?.message}
            >
              <Input id="firstName" placeholder="John" {...register("firstName")} />
            </Field>

            <Field
              id="lastName"
              label="Last name"
              required
              error={errors.lastName?.message}
            >
              <Input id="lastName" placeholder="Doe" {...register("lastName")} />
            </Field>
          </div>

          <Field
            id="role"
            label="Role"
            required
            hint="Determines what this user can access"
            error={errors.role?.message}
          >
            <Select
              value={watch("role") ?? ""}
              onValueChange={(v) => setValue("role", v as CreateFormData["role"], { shouldValidate: true })}
              items={availableRoles.map((r) => ({ value: r.value, label: r.label }))}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      {/* Property assignments (optional) */}
      <Section
        icon={<IconUser size={18} />}
        title="Property assignments"
        description="Optionally assign this user to properties on creation."
      >
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <div key={index} className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Property</Label>
                <Select
                  value={assignment.propertyId}
                  onValueChange={(v) => updateAssignment(index, "propertyId", v ?? "")}
                  items={availableProperties.map((p) => ({ value: p.id, label: p.name }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProperties.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                        disabled={assignedPropertyIds.has(p.id) && assignment.propertyId !== p.id}
                      >
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-44">
                <Label className="text-xs text-muted-foreground">Role override</Label>
                <Select
                  value={assignment.role || "default"}
                  onValueChange={(v) => updateAssignment(index, "role", v === "default" ? "" : v ?? "")}
                  items={[
                    { value: "default", label: "Default (inherit)" },
                    ...staffRoles.map((r) => ({ value: r.value, label: r.label })),
                  ]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (inherit)</SelectItem>
                    {staffRoles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeAssignment(index)}
              >
                <IconTrash size={16} />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAssignment}
            className="gap-1.5"
          >
            <IconPlus size={14} />
            Add property
          </Button>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to="/users"
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
          {isPending ? "Creating..." : "Create staff member"}
        </Button>
      </div>
    </form>
  );
}

// ─── Edit form ──────────────────────────────────────────────────────────────

interface EditUserFormProps {
  user: StaffWithProperties;
}

function EditUserForm({ user }: EditUserFormProps) {
  const { mutate, isPending, error } = useUpdateUser();
  const currentUser = useAuthStore((s) => s.user);
  const isTenantAdmin = currentUser?.role === "tenant_admin";
  const isEditingSelf = currentUser?.userId === user.id;
  const availableRoles = isTenantAdmin
    ? staffRoles.filter((r) => r.value !== "tenant_admin")
    : staffRoles;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role === "super_admin" ? undefined : user.role,
      isActive: user.isActive,
    },
  });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  const currentIsActive = watch("isActive");

  function onSubmit(data: UpdateFormData) {
    const dto = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    ) as UpdateFormData;
    mutate({ id: user.id, dto });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <IconInfoCircle size={16} className="mt-0.5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      <Section
        icon={<IconUser size={18} />}
        title="Personal information"
        description="Update name, role, and status."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="edit-firstName" label="First name" error={errors.firstName?.message}>
              <Input id="edit-firstName" {...register("firstName")} />
            </Field>

            <Field id="edit-lastName" label="Last name" error={errors.lastName?.message}>
              <Input id="edit-lastName" {...register("lastName")} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="edit-role"
              label="Role"
              error={errors.role?.message}
              hint={isTenantAdmin && isEditingSelf ? "You cannot change your own role" : undefined}
            >
              <Select
                value={watch("role") ?? ""}
                onValueChange={(v) =>
                  setValue("role", v as UpdateFormData["role"], { shouldValidate: true })
                }
                disabled={isTenantAdmin && isEditingSelf}
                items={availableRoles.map((r) => ({ value: r.value, label: r.label }))}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              id="edit-isActive"
              label="Status"
              hint={isEditingSelf ? "You cannot deactivate your own account" : undefined}
            >
              <Select
                value={currentIsActive ? "active" : "inactive"}
                onValueChange={(v) =>
                  setValue("isActive", v === "active", { shouldValidate: true })
                }
                disabled={isEditingSelf}
                items={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              >
                <SelectTrigger id="edit-isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

// ─── Public API ─────────────────────────────────────────────────────────────

interface UserFormCreateProps {
  mode: "create";
}

interface UserFormEditProps {
  mode: "edit";
  defaultValues: StaffWithProperties;
}

export function UserForm(props: UserFormCreateProps | UserFormEditProps) {
  if (props.mode === "edit") {
    return <EditUserForm user={props.defaultValues} />;
  }
  return <CreateUserForm />;
}
