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
import { useCreateProperty } from "@/features/properties/hooks/useCreateProperty";
import { useUpdateProperty } from "@/features/properties/hooks/useUpdateProperty";
import { isApiError } from "@/lib/api";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type { Property } from "@/features/properties/types/properties.types";

// ─── Schemas ────────────────────────────────────────────────────────────────

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createPropertySchema = z.object({
  name: z.string().min(1, "Property name is required").max(255),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(slugRegex, "Lowercase alphanumeric with hyphens only"),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  timezone: z.string().max(50).optional(),
  currency: z.string().length(3, "Must be a 3-letter code (e.g. USD)").or(z.literal("")).optional(),
});

const updatePropertySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(slugRegex, "Lowercase alphanumeric with hyphens only")
    .optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  timezone: z.string().max(50).optional(),
  currency: z.string().length(3, "Must be a 3-letter code (e.g. USD)").or(z.literal("")).optional(),
  isActive: z.boolean().optional(),
});

type CreateFormData = z.infer<typeof createPropertySchema>;
type UpdateFormData = z.infer<typeof updatePropertySchema>;

// ─── Create form ─────────────────────────────────────────────────────────────

function CreatePropertyForm() {
  const { mutate, isPending, error } = useCreateProperty();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormData>({ resolver: zodResolver(createPropertySchema) });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  function onSubmit(data: CreateFormData) {
    // Strip empty optional strings so backend treats them as absent
    const dto = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== "" && v !== undefined)
    ) as CreateFormData;
    mutate(dto);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Basic info
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Grand Hyatt Mumbai" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" placeholder="grand-hyatt-mumbai" {...register("slug")} />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Location
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="address">Address</Label>
          <Input id="address" placeholder="123 Marine Drive" {...register("address")} />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="Mumbai" {...register("city")} />
            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state">State</Label>
            <Input id="state" placeholder="Maharashtra" {...register("state")} />
            {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" placeholder="India" {...register("country")} />
            {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zipCode">ZIP / Postal code</Label>
            <Input id="zipCode" placeholder="400001" {...register("zipCode")} />
            {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode.message}</p>}
          </div>
        </div>
      </section>

      {/* Contact & settings */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Contact &amp; settings
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+91 22 1234 5678" {...register("phone")} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="info@grandmumbai.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" placeholder="Asia/Kolkata" {...register("timezone")} />
            {errors.timezone && <p className="text-sm text-destructive">{errors.timezone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" placeholder="INR" maxLength={3} {...register("currency")} />
            {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
          </div>
        </div>
      </section>

      <Button type="submit" disabled={isPending}>
        {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
        {isPending ? "Creating…" : "Create property"}
      </Button>
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

interface EditPropertyFormProps {
  property: Property;
}

function EditPropertyForm({ property }: EditPropertyFormProps) {
  const { mutate, isPending, error } = useUpdateProperty();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updatePropertySchema),
    defaultValues: {
      name: property.name,
      slug: property.slug,
      address: property.address ?? "",
      city: property.city ?? "",
      state: property.state ?? "",
      country: property.country ?? "",
      zipCode: property.zipCode ?? "",
      phone: property.phone ?? "",
      email: property.email ?? "",
      timezone: property.timezone ?? "",
      currency: property.currency ?? "",
      isActive: property.isActive,
    },
  });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  const currentIsActive = watch("isActive");

  function onSubmit(data: UpdateFormData) {
    const dto = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    ) as UpdateFormData;
    mutate({ id: property.id, dto });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Basic info
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        <div className="space-y-1.5 max-w-xs">
          <Label htmlFor="edit-isActive">Status</Label>
          <Select
            value={currentIsActive ? "active" : "inactive"}
            onValueChange={(v) => setValue("isActive", v === "active", { shouldValidate: true })}
          >
            <SelectTrigger id="edit-isActive">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Location */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Location
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="edit-address">Address</Label>
          <Input id="edit-address" {...register("address")} />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-city">City</Label>
            <Input id="edit-city" {...register("city")} />
            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-state">State</Label>
            <Input id="edit-state" {...register("state")} />
            {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-country">Country</Label>
            <Input id="edit-country" {...register("country")} />
            {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-zipCode">ZIP / Postal code</Label>
            <Input id="edit-zipCode" {...register("zipCode")} />
            {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode.message}</p>}
          </div>
        </div>
      </section>

      {/* Contact & settings */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Contact &amp; settings
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input id="edit-phone" {...register("phone")} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-timezone">Timezone</Label>
            <Input id="edit-timezone" {...register("timezone")} />
            {errors.timezone && <p className="text-sm text-destructive">{errors.timezone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-currency">Currency</Label>
            <Input id="edit-currency" maxLength={3} {...register("currency")} />
            {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
          </div>
        </div>
      </section>

      <Button type="submit" disabled={isPending}>
        {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

interface PropertyFormCreateProps {
  mode: "create";
}

interface PropertyFormEditProps {
  mode: "edit";
  defaultValues: Property;
}

export function PropertyForm(props: PropertyFormCreateProps | PropertyFormEditProps) {
  if (props.mode === "edit") {
    return <EditPropertyForm property={props.defaultValues} />;
  }
  return <CreatePropertyForm />;
}
