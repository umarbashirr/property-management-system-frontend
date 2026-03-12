import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import { Country, State, City } from "country-state-city";
import type { ICountry, IState } from "country-state-city";
import {
  IconBuildingSkyscraper,
  IconLoader,
  IconMapPin,
  IconSettings,
  IconInfoCircle,
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
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { PhoneInput } from "@/components/ui/phone-input";
import { useCreateProperty } from "@/features/properties/hooks/useCreateProperty";
import { useUpdateProperty } from "@/features/properties/hooks/useUpdateProperty";
import { isApiError } from "@/lib/api";
import { TIMEZONE_OPTIONS } from "@/features/properties/data/timezones";
import { CURRENCY_OPTIONS } from "@/features/properties/data/currencies";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type { Property } from "@/features/properties/types/properties.types";

// ─── Defaults (India-first) ─────────────────────────────────────────────────

const DEFAULT_COUNTRY_CODE = "IN";
const DEFAULT_TIMEZONE = "Asia/Kolkata";
const DEFAULT_CURRENCY = "INR";

// ─── Schemas ────────────────────────────────────────────────────────────────

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const phoneRegex = /^\+[1-9]\d{6,14}$/;

const createPropertySchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .max(255, "Name must be 255 characters or fewer"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or fewer")
    .regex(slugRegex, "Lowercase alphanumeric with hyphens only"),
  address: z
    .string()
    .min(1, "Street address is required")
    .max(500, "Address must be 500 characters or fewer"),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  zipCode: z.string().max(20, "ZIP code must be 20 characters or fewer").optional(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(30)
    .regex(phoneRegex, "Enter a valid international phone number"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  timezone: z.string().min(1, "Timezone is required").max(50),
  currency: z.string().length(3, "Currency is required (3-letter code)"),
});

const updatePropertySchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .max(255, "Name must be 255 characters or fewer")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or fewer")
    .regex(slugRegex, "Lowercase alphanumeric with hyphens only")
    .optional(),
  address: z.string().max(500, "Address must be 500 characters or fewer").optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  zipCode: z.string().max(20, "ZIP code must be 20 characters or fewer").optional(),
  phone: z
    .string()
    .regex(phoneRegex, "Enter a valid international phone number")
    .or(z.literal(""))
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .or(z.literal(""))
    .optional(),
  timezone: z.string().max(50).optional(),
  currency: z
    .string()
    .length(3, "Must be a 3-letter code (e.g. USD)")
    .or(z.literal(""))
    .optional(),
  isActive: z.boolean().optional(),
});

type CreateFormData = z.infer<typeof createPropertySchema>;
type UpdateFormData = z.infer<typeof updatePropertySchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Geography helpers ──────────────────────────────────────────────────────

const allCountries: ICountry[] = Country.getAllCountries();

const countryOptions: ComboboxOption[] = allCountries.map((c) => ({
  value: c.isoCode,
  label: c.name,
  meta: c.isoCode,
}));

function getStateOptions(countryCode: string): ComboboxOption[] {
  return State.getStatesOfCountry(countryCode).map((s: IState) => ({
    value: s.isoCode,
    label: s.name,
    meta: s.isoCode,
  }));
}

function getCityOptions(
  countryCode: string,
  stateCode: string,
): ComboboxOption[] {
  return City.getCitiesOfState(countryCode, stateCode).map((c) => ({
    value: c.name,
    label: c.name,
  }));
}

/** Resolve a country name to its ISO code, or return "" */
function resolveCountryCode(nameOrCode: string): string {
  if (!nameOrCode) return "";
  // Direct code match
  const byCode = allCountries.find(
    (c) => c.isoCode === nameOrCode.toUpperCase(),
  );
  if (byCode) return byCode.isoCode;
  // Name match
  const byName = allCountries.find(
    (c) => c.name.toLowerCase() === nameOrCode.toLowerCase(),
  );
  return byName?.isoCode ?? "";
}

/** Resolve a state name to its ISO code within a country, or return "" */
function resolveStateCode(countryCode: string, nameOrCode: string): string {
  if (!countryCode || !nameOrCode) return "";
  const states = State.getStatesOfCountry(countryCode);
  const byCode = states.find(
    (s: IState) => s.isoCode === nameOrCode.toUpperCase(),
  );
  if (byCode) return byCode.isoCode;
  const byName = states.find(
    (s: IState) => s.name.toLowerCase() === nameOrCode.toLowerCase(),
  );
  return byName?.isoCode ?? "";
}

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

// ─── Location section (shared between create & edit) ────────────────────────

interface LocationFieldsProps {
  countryCode: string;
  stateCode: string;
  cityValue: string;
  onCountryChange: (isoCode: string) => void;
  onStateChange: (isoCode: string) => void;
  onCityChange: (cityName: string) => void;
  idPrefix?: string;
  /** Mark address/country/state/city as required */
  required?: boolean;
  addressRegister: React.ComponentProps<"input">;
  zipCodeRegister: React.ComponentProps<"input">;
  errors: {
    address?: { message?: string };
    city?: { message?: string };
    state?: { message?: string };
    country?: { message?: string };
    zipCode?: { message?: string };
  };
}

function LocationFields({
  countryCode,
  stateCode,
  cityValue,
  onCountryChange,
  onStateChange,
  onCityChange,
  idPrefix = "",
  required = false,
  addressRegister,
  zipCodeRegister,
  errors,
}: LocationFieldsProps) {
  const stateOptions = useMemo(
    () => getStateOptions(countryCode),
    [countryCode],
  );
  const cityOptions = useMemo(
    () => getCityOptions(countryCode, stateCode),
    [countryCode, stateCode],
  );

  return (
    <div className="space-y-5">
      <Field
        id={`${idPrefix}address`}
        label="Street address"
        required={required}
        error={errors.address?.message}
      >
        <Input
          id={`${idPrefix}address`}
          placeholder="123 Marine Drive"
          {...addressRegister}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={`${idPrefix}country`}
          label="Country"
          required={required}
          error={errors.country?.message}
        >
          <Combobox
            id={`${idPrefix}country`}
            options={countryOptions}
            value={countryCode}
            onChange={onCountryChange}
            placeholder="Select country"
            searchPlaceholder="Search countries…"
          />
        </Field>

        <Field
          id={`${idPrefix}state`}
          label="State / Province"
          required={required}
          error={errors.state?.message}
        >
          <Combobox
            id={`${idPrefix}state`}
            options={stateOptions}
            value={stateCode}
            onChange={onStateChange}
            placeholder="Select state"
            searchPlaceholder="Search states…"
            disabled={!countryCode}
          />
        </Field>

        <Field
          id={`${idPrefix}city`}
          label="City"
          required={required}
          error={errors.city?.message}
        >
          <Combobox
            id={`${idPrefix}city`}
            options={cityOptions}
            value={cityValue}
            onChange={onCityChange}
            placeholder="Select city"
            searchPlaceholder="Search cities…"
            disabled={!stateCode}
          />
        </Field>

        <Field
          id={`${idPrefix}zipCode`}
          label="ZIP / Postal code"
          error={errors.zipCode?.message}
        >
          <Input
            id={`${idPrefix}zipCode`}
            placeholder="400001"
            {...zipCodeRegister}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Create form ─────────────────────────────────────────────────────────────

interface CreatePropertyFormProps {
  tenantId?: string;
}

function CreatePropertyForm({ tenantId }: CreatePropertyFormProps) {
  const { mutate, isPending, error } = useCreateProperty();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      timezone: DEFAULT_TIMEZONE,
      currency: DEFAULT_CURRENCY,
      country: "India",
    },
  });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  // Auto-generate slug from name
  const nameValue = watch("name");
  useEffect(() => {
    if (nameValue) {
      setValue("slug", toSlug(nameValue), { shouldValidate: false });
    }
  }, [nameValue, setValue]);

  // ── Location state (ISO codes for cascading selects) ──
  const countryFormValue = watch("country") ?? "";
  const stateFormValue = watch("state") ?? "";

  const selectedCountryCode = useMemo(
    () => resolveCountryCode(countryFormValue) || DEFAULT_COUNTRY_CODE,
    [countryFormValue],
  );
  const selectedStateCode = useMemo(
    () => resolveStateCode(selectedCountryCode, stateFormValue),
    [selectedCountryCode, stateFormValue],
  );

  // ── Phone state ──
  const phoneValue = watch("phone") ?? "";

  function onSubmit(data: CreateFormData) {
    const dto = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== "" && v !== undefined),
    ) as CreateFormData;
    mutate({ dto, tenantId });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <IconInfoCircle
            size={16}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      {/* ── Basic info ── */}
      <Section
        icon={<IconBuildingSkyscraper size={18} />}
        title="Property details"
        description="Name and unique identifier for your property."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="name"
            label="Property name"
            required
            hint="The public-facing name of your property"
            error={errors.name?.message}
          >
            <Input
              id="name"
              placeholder="Grand Hyatt Mumbai"
              {...register("name")}
            />
          </Field>

          <Field
            id="slug"
            label="Slug"
            required
            hint="Auto-generated from name — used in URLs"
            error={errors.slug?.message}
          >
            <Input
              id="slug"
              placeholder="grand-hyatt-mumbai"
              {...register("slug")}
            />
          </Field>
        </div>
      </Section>

      {/* ── Location ── */}
      <Section
        icon={<IconMapPin size={18} />}
        title="Location"
        description="Physical address of the property."
      >
        <LocationFields
          required
          countryCode={selectedCountryCode}
          stateCode={selectedStateCode}
          cityValue={watch("city") ?? ""}
          onCountryChange={(isoCode) => {
            const country = allCountries.find((c) => c.isoCode === isoCode);
            setValue("country", country?.name ?? isoCode);
            setValue("state", "");
            setValue("city", "");
          }}
          onStateChange={(isoCode) => {
            const states = State.getStatesOfCountry(selectedCountryCode);
            const state = states.find((s: IState) => s.isoCode === isoCode);
            setValue("state", state?.name ?? isoCode);
            setValue("city", "");
          }}
          onCityChange={(cityName) => {
            setValue("city", cityName);
          }}
          addressRegister={register("address")}
          zipCodeRegister={register("zipCode")}
          errors={errors}
        />
      </Section>

      {/* ── Contact & settings ── */}
      <Section
        icon={<IconSettings size={18} />}
        title="Contact & settings"
        description="Contact information and regional preferences."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="phone" label="Phone" required error={errors.phone?.message}>
            <PhoneInput
              id="phone"
              value={phoneValue}
              onChange={(v) => setValue("phone", v)}
              placeholder="22 1234 5678"
            />
          </Field>

          <Field id="email" label="Email" required error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="info@grandmumbai.com"
              {...register("email")}
            />
          </Field>

          <Field
            id="timezone"
            label="Timezone"
            required
            error={errors.timezone?.message}
          >
            <Combobox
              id="timezone"
              options={TIMEZONE_OPTIONS}
              value={watch("timezone") ?? ""}
              onChange={(v) =>
                setValue("timezone", v, { shouldValidate: true })
              }
              placeholder="Select timezone"
              searchPlaceholder="Search timezones…"
            />
          </Field>

          <Field
            id="currency"
            label="Currency"
            required
            error={errors.currency?.message}
          >
            <Combobox
              id="currency"
              options={CURRENCY_OPTIONS}
              value={watch("currency") ?? ""}
              onChange={(v) =>
                setValue("currency", v, { shouldValidate: true })
              }
              placeholder="Select currency"
              searchPlaceholder="Search currencies…"
            />
          </Field>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to={tenantId ? `/properties?tenantId=${tenantId}` : "/properties"}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
          {isPending ? "Creating..." : "Create property"}
        </Button>
      </div>
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

interface EditPropertyFormProps {
  property: Property;
  tenantId?: string;
}

function EditPropertyForm({ property, tenantId }: EditPropertyFormProps) {
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

  // ── Location state (ISO codes for cascading selects) ──
  const countryFormValue = watch("country") ?? "";
  const stateFormValue = watch("state") ?? "";

  const selectedCountryCode = useMemo(
    () => resolveCountryCode(countryFormValue),
    [countryFormValue],
  );
  const selectedStateCode = useMemo(
    () => resolveStateCode(selectedCountryCode, stateFormValue),
    [selectedCountryCode, stateFormValue],
  );

  // ── Phone state ──
  const phoneValue = watch("phone") ?? "";

  function onSubmit(data: UpdateFormData) {
    const dto = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    ) as UpdateFormData;
    mutate({ id: property.id, dto, tenantId });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <IconInfoCircle
            size={16}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      {/* ── Basic info ── */}
      <Section
        icon={<IconBuildingSkyscraper size={18} />}
        title="Property details"
        description="Name, slug, and status of your property."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="edit-name"
              label="Property name"
              required
              hint="The public-facing name of your property"
              error={errors.name?.message}
            >
              <Input
                id="edit-name"
                placeholder="Grand Hyatt Mumbai"
                {...register("name")}
              />
            </Field>

            <Field
              id="edit-slug"
              label="Slug"
              required
              hint="Auto-generated from name — used in URLs"
              error={errors.slug?.message}
            >
              <Input
                id="edit-slug"
                placeholder="grand-hyatt-mumbai"
                {...register("slug")}
              />
            </Field>
          </div>

          <div className="max-w-xs">
            <Field id="edit-isActive" label="Status">
              <Select
                value={currentIsActive ? "active" : "inactive"}
                onValueChange={(v) =>
                  setValue("isActive", v === "active", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="edit-isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" label="Active">Active</SelectItem>
                  <SelectItem value="inactive" label="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Location ── */}
      <Section
        icon={<IconMapPin size={18} />}
        title="Location"
        description="Physical address of the property."
      >
        <LocationFields
          idPrefix="edit-"
          countryCode={selectedCountryCode}
          stateCode={selectedStateCode}
          cityValue={watch("city") ?? ""}
          onCountryChange={(isoCode) => {
            const country = allCountries.find((c) => c.isoCode === isoCode);
            setValue("country", country?.name ?? isoCode);
            setValue("state", "");
            setValue("city", "");
          }}
          onStateChange={(isoCode) => {
            const states = State.getStatesOfCountry(selectedCountryCode);
            const state = states.find((s: IState) => s.isoCode === isoCode);
            setValue("state", state?.name ?? isoCode);
            setValue("city", "");
          }}
          onCityChange={(cityName) => {
            setValue("city", cityName);
          }}
          addressRegister={register("address")}
          zipCodeRegister={register("zipCode")}
          errors={errors}
        />
      </Section>

      {/* ── Contact & settings ── */}
      <Section
        icon={<IconSettings size={18} />}
        title="Contact & settings"
        description="Contact information and regional preferences."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="edit-phone"
            label="Phone"
            required
            error={errors.phone?.message}
          >
            <PhoneInput
              id="edit-phone"
              value={phoneValue}
              onChange={(v) => setValue("phone", v)}
              placeholder="22 1234 5678"
            />
          </Field>

          <Field
            id="edit-email"
            label="Email"
            required
            error={errors.email?.message}
          >
            <Input
              id="edit-email"
              type="email"
              placeholder="info@grandmumbai.com"
              {...register("email")}
            />
          </Field>

          <Field
            id="edit-timezone"
            label="Timezone"
            required
            error={errors.timezone?.message}
          >
            <Combobox
              id="edit-timezone"
              options={TIMEZONE_OPTIONS}
              value={watch("timezone") ?? ""}
              onChange={(v) =>
                setValue("timezone", v, { shouldValidate: true })
              }
              placeholder="Select timezone"
              searchPlaceholder="Search timezones…"
            />
          </Field>

          <Field
            id="edit-currency"
            label="Currency"
            required
            error={errors.currency?.message}
          >
            <Combobox
              id="edit-currency"
              options={CURRENCY_OPTIONS}
              value={watch("currency") ?? ""}
              onChange={(v) =>
                setValue("currency", v, { shouldValidate: true })
              }
              placeholder="Select currency"
              searchPlaceholder="Search currencies…"
            />
          </Field>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to={tenantId ? `/properties?tenantId=${tenantId}` : "/properties"}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

interface PropertyFormCreateProps {
  mode: "create";
  tenantId?: string;
}

interface PropertyFormEditProps {
  mode: "edit";
  defaultValues: Property;
  tenantId?: string;
}

export function PropertyForm(
  props: PropertyFormCreateProps | PropertyFormEditProps,
) {
  if (props.mode === "edit") {
    return <EditPropertyForm property={props.defaultValues} tenantId={props.tenantId} />;
  }
  return <CreatePropertyForm tenantId={props.tenantId} />;
}
