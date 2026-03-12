import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import { Country, State, City } from "country-state-city";
import type { ICountry, IState } from "country-state-city";
import {
  IconInfoCircle,
  IconLoader,
  IconMapPin,
  IconUser,
  IconId,
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
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { PhoneInput } from "@/components/ui/phone-input";
import { useCreateProfile } from "@/features/profiles/hooks/useCreateProfile";
import { useUpdateProfile } from "@/features/profiles/hooks/useUpdateProfile";
import { isApiError } from "@/lib/api";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type {
  Profile,
  CreateProfileDto,
  UpdateProfileDto,
  ProfileType,
  Gender,
  IdType,
  ProfileSource,
} from "@/features/profiles/types/profiles.types";

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_COUNTRY_CODE = "IN";

const profileTypes = [
  { value: "individual", label: "Individual" },
  { value: "corporate", label: "Corporate" },
  { value: "travel_agent", label: "Travel Agent" },
] as const;

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer Not to Say" },
] as const;

const idTypeOptions = [
  { value: "passport", label: "Passport" },
  { value: "aadhaar", label: "Aadhaar" },
  { value: "driving_license", label: "Driving License" },
  { value: "voter_id", label: "Voter ID" },
  { value: "pan_card", label: "PAN Card" },
  { value: "other", label: "Other" },
] as const;

const sourceOptions = [
  { value: "walk_in", label: "Walk-in" },
  { value: "direct", label: "Direct" },
  { value: "ota", label: "OTA" },
  { value: "corporate", label: "Corporate" },
  { value: "travel_agent", label: "Travel Agent" },
  { value: "referral", label: "Referral" },
] as const;

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

function getCityOptions(countryCode: string, stateCode: string): ComboboxOption[] {
  return City.getCitiesOfState(countryCode, stateCode).map((c) => ({
    value: c.name,
    label: c.name,
  }));
}

function resolveCountryCode(nameOrCode: string): string {
  if (!nameOrCode) return "";
  const byCode = allCountries.find((c) => c.isoCode === nameOrCode.toUpperCase());
  if (byCode) return byCode.isoCode;
  const byName = allCountries.find((c) => c.name.toLowerCase() === nameOrCode.toLowerCase());
  return byName?.isoCode ?? "";
}

function resolveStateCode(countryCode: string, nameOrCode: string): string {
  if (!countryCode || !nameOrCode) return "";
  const states = State.getStatesOfCountry(countryCode);
  const byCode = states.find((s: IState) => s.isoCode === nameOrCode.toUpperCase());
  if (byCode) return byCode.isoCode;
  const byName = states.find((s: IState) => s.name.toLowerCase() === nameOrCode.toLowerCase());
  return byName?.isoCode ?? "";
}

// ─── Schemas ────────────────────────────────────────────────────────────────

const createProfileSchema = z
  .object({
    type: z.enum(["individual", "corporate", "travel_agent"]),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    companyName: z.string().max(200).optional().or(z.literal("")),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().max(30).optional().or(z.literal("")),
    alternatePhone: z.string().max(30).optional().or(z.literal("")),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().or(z.literal("")),
    dateOfBirth: z.string().optional().or(z.literal("")),
    nationality: z.string().max(100).optional().or(z.literal("")),
    idType: z.enum(["passport", "aadhaar", "driving_license", "voter_id", "pan_card", "other"]).optional().or(z.literal("")),
    idNumber: z.string().max(100).optional().or(z.literal("")),
    source: z.enum(["walk_in", "direct", "ota", "corporate", "travel_agent", "referral"]),
    notes: z.string().optional().or(z.literal("")),
    addressLine1: z.string().max(255).optional().or(z.literal("")),
    addressLine2: z.string().max(255).optional().or(z.literal("")),
    addressCity: z.string().max(100).optional().or(z.literal("")),
    addressState: z.string().max(100).optional().or(z.literal("")),
    addressPostalCode: z.string().max(20).optional().or(z.literal("")),
    addressCountry: z.string().max(100).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!(data.email && data.email.length > 0) && !(data.phone && data.phone.length > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one of email or phone is required",
        path: ["email"],
      });
    }
    if (
      data.type !== "individual" &&
      !(data.companyName && data.companyName.trim().length > 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company name is required for corporate and travel agent profiles",
        path: ["companyName"],
      });
    }
  });

type CreateFormData = z.infer<typeof createProfileSchema>;

const updateProfileSchema = z.object({
  type: z.enum(["individual", "corporate", "travel_agent"]).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  companyName: z.string().max(200).optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  alternatePhone: z.string().max(30).optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  nationality: z.string().max(100).optional().or(z.literal("")),
  idType: z.enum(["passport", "aadhaar", "driving_license", "voter_id", "pan_card", "other"]).optional().or(z.literal("")),
  idNumber: z.string().max(100).optional().or(z.literal("")),
  source: z.enum(["walk_in", "direct", "ota", "corporate", "travel_agent", "referral"]).optional(),
  notes: z.string().optional().or(z.literal("")),
  addressLine1: z.string().max(255).optional().or(z.literal("")),
  addressLine2: z.string().max(255).optional().or(z.literal("")),
  addressCity: z.string().max(100).optional().or(z.literal("")),
  addressState: z.string().max(100).optional().or(z.literal("")),
  addressPostalCode: z.string().max(20).optional().or(z.literal("")),
  addressCountry: z.string().max(100).optional().or(z.literal("")),
});

type UpdateFormData = z.infer<typeof updateProfileSchema>;

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

// ─── Helpers to convert flat form data → DTO ────────────────────────────────

function buildAddress(data: { addressLine1?: string; addressLine2?: string; addressCity?: string; addressState?: string; addressPostalCode?: string; addressCountry?: string }) {
  const address = {
    ...(data.addressLine1 ? { line1: data.addressLine1 } : {}),
    ...(data.addressLine2 ? { line2: data.addressLine2 } : {}),
    ...(data.addressCity ? { city: data.addressCity } : {}),
    ...(data.addressState ? { state: data.addressState } : {}),
    ...(data.addressPostalCode ? { postalCode: data.addressPostalCode } : {}),
    ...(data.addressCountry ? { country: data.addressCountry } : {}),
  };
  return Object.keys(address).length > 0 ? address : undefined;
}

function stripEmpty(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

// ─── Create form ────────────────────────────────────────────────────────────

function CreateProfileForm() {
  const { mutate, isPending, error } = useCreateProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      type: "individual",
      source: "direct",
    },
  });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  const profileType = watch("type");
  const phoneValue = watch("phone") ?? "";
  const altPhoneValue = watch("alternatePhone") ?? "";

  // Address geo state
  const countryFormValue = watch("addressCountry") ?? "";
  const stateFormValue = watch("addressState") ?? "";

  const selectedCountryCode = useMemo(
    () => resolveCountryCode(countryFormValue) || DEFAULT_COUNTRY_CODE,
    [countryFormValue],
  );
  const selectedStateCode = useMemo(
    () => resolveStateCode(selectedCountryCode, stateFormValue),
    [selectedCountryCode, stateFormValue],
  );
  const stateOptions = useMemo(
    () => getStateOptions(selectedCountryCode),
    [selectedCountryCode],
  );
  const cityOptions = useMemo(
    () => getCityOptions(selectedCountryCode, selectedStateCode),
    [selectedCountryCode, selectedStateCode],
  );

  function onSubmit(data: CreateFormData) {
    const dto: CreateProfileDto = {
      type: data.type,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: stripEmpty(data.companyName),
      email: stripEmpty(data.email),
      phone: stripEmpty(data.phone),
      alternatePhone: stripEmpty(data.alternatePhone),
      gender: (stripEmpty(data.gender) as Gender) || undefined,
      dateOfBirth: stripEmpty(data.dateOfBirth),
      nationality: stripEmpty(data.nationality),
      idType: (stripEmpty(data.idType) as IdType) || undefined,
      idNumber: stripEmpty(data.idNumber),
      source: data.source,
      notes: stripEmpty(data.notes),
      address: buildAddress(data),
    };
    mutate(dto);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <IconInfoCircle size={16} className="mt-0.5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      {/* Basic information */}
      <Section
        icon={<IconUser size={18} />}
        title="Basic information"
        description="Name, type, and contact details."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="type" label="Profile type" required error={errors.type?.message}>
              <Select
                value={watch("type") ?? "individual"}
                onValueChange={(v) => setValue("type", v as ProfileType, { shouldValidate: true })}
                items={profileTypes.map((t) => ({ value: t.value, label: t.label }))}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {profileTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value} label={t.label}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="firstName" label="First name" required error={errors.firstName?.message}>
              <Input id="firstName" placeholder="John" {...register("firstName")} />
            </Field>

            <Field id="lastName" label="Last name" required error={errors.lastName?.message}>
              <Input id="lastName" placeholder="Doe" {...register("lastName")} />
            </Field>
          </div>

          {profileType !== "individual" && (
            <Field
              id="companyName"
              label="Company name"
              required
              error={errors.companyName?.message}
            >
              <Input id="companyName" placeholder="Acme Corp" {...register("companyName")} />
            </Field>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="email"
              label="Email"
              hint="At least one of email or phone is required"
              error={errors.email?.message}
            >
              <Input id="email" type="email" placeholder="guest@example.com" {...register("email")} />
            </Field>

            <Field
              id="phone"
              label="Phone"
              hint="At least one of email or phone is required"
              error={errors.phone?.message}
            >
              <PhoneInput
                id="phone"
                value={phoneValue}
                onChange={(v) => setValue("phone", v)}
                placeholder="98765 43210"
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="alternatePhone" label="Alternate phone" error={errors.alternatePhone?.message}>
              <PhoneInput
                id="alternatePhone"
                value={altPhoneValue}
                onChange={(v) => setValue("alternatePhone", v)}
                placeholder="98765 43210"
              />
            </Field>

            <Field id="source" label="Source" error={errors.source?.message}>
              <Select
                value={watch("source") ?? "direct"}
                onValueChange={(v) => setValue("source", v as ProfileSource, { shouldValidate: true })}
                items={sourceOptions.map((s) => ({ value: s.value, label: s.label }))}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value} label={s.label}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </Section>

      {/* Personal details */}
      <Section
        icon={<IconId size={18} />}
        title="Personal details"
        description="Identity, demographics, and notes."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="gender" label="Gender" error={errors.gender?.message}>
              <Select
                value={watch("gender") ?? ""}
                onValueChange={(v) => setValue("gender", (v === "" ? undefined : v) as Gender, { shouldValidate: true })}
                items={genderOptions.map((g) => ({ value: g.value, label: g.label }))}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((g) => (
                    <SelectItem key={g.value} value={g.value} label={g.label}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="dateOfBirth" label="Date of birth" error={errors.dateOfBirth?.message}>
              <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
            </Field>

            <Field id="nationality" label="Nationality" error={errors.nationality?.message}>
              <Input id="nationality" placeholder="Indian" {...register("nationality")} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="idType" label="ID type" error={errors.idType?.message}>
              <Select
                value={watch("idType") ?? ""}
                onValueChange={(v) => setValue("idType", (v === "" ? undefined : v) as IdType, { shouldValidate: true })}
                items={idTypeOptions.map((t) => ({ value: t.value, label: t.label }))}
              >
                <SelectTrigger id="idType">
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  {idTypeOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value} label={t.label}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="idNumber" label="ID number" error={errors.idNumber?.message}>
              <Input id="idNumber" placeholder="AB1234567" {...register("idNumber")} />
            </Field>
          </div>

          <Field id="notes" label="Notes" error={errors.notes?.message}>
            <textarea
              id="notes"
              rows={3}
              placeholder="Any additional notes…"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register("notes")}
            />
          </Field>
        </div>
      </Section>

      {/* Address */}
      <Section
        icon={<IconMapPin size={18} />}
        title="Address"
        description="Guest's mailing or residential address."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="addressLine1" label="Address line 1" error={errors.addressLine1?.message}>
              <Input id="addressLine1" placeholder="123 Main Street" {...register("addressLine1")} />
            </Field>
            <Field id="addressLine2" label="Address line 2" error={errors.addressLine2?.message}>
              <Input id="addressLine2" placeholder="Apt 4B" {...register("addressLine2")} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="addressCountry" label="Country" error={errors.addressCountry?.message}>
              <Combobox
                id="addressCountry"
                options={countryOptions}
                value={selectedCountryCode}
                onChange={(isoCode) => {
                  const country = allCountries.find((c) => c.isoCode === isoCode);
                  setValue("addressCountry", country?.name ?? isoCode);
                  setValue("addressState", "");
                  setValue("addressCity", "");
                }}
                placeholder="Select country"
                searchPlaceholder="Search countries…"
              />
            </Field>
            <Field id="addressState" label="State / Province" error={errors.addressState?.message}>
              <Combobox
                id="addressState"
                options={stateOptions}
                value={selectedStateCode}
                onChange={(isoCode) => {
                  const states = State.getStatesOfCountry(selectedCountryCode);
                  const state = states.find((s: IState) => s.isoCode === isoCode);
                  setValue("addressState", state?.name ?? isoCode);
                  setValue("addressCity", "");
                }}
                placeholder="Select state"
                searchPlaceholder="Search states…"
                disabled={!selectedCountryCode}
              />
            </Field>
            <Field id="addressCity" label="City" error={errors.addressCity?.message}>
              <Combobox
                id="addressCity"
                options={cityOptions}
                value={watch("addressCity") ?? ""}
                onChange={(cityName) => setValue("addressCity", cityName)}
                placeholder="Select city"
                searchPlaceholder="Search cities…"
                disabled={!selectedStateCode}
              />
            </Field>
            <Field id="addressPostalCode" label="Postal code" error={errors.addressPostalCode?.message}>
              <Input id="addressPostalCode" placeholder="400001" {...register("addressPostalCode")} />
            </Field>
          </div>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to="/profiles"
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
          {isPending ? "Creating..." : "Create profile"}
        </Button>
      </div>
    </form>
  );
}

// ─── Edit form ──────────────────────────────────────────────────────────────

interface EditProfileFormProps {
  profile: Profile;
}

function EditProfileForm({ profile }: EditProfileFormProps) {
  const { mutate, isPending, error } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      type: profile.type,
      firstName: profile.firstName,
      lastName: profile.lastName,
      companyName: profile.companyName ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      alternatePhone: profile.alternatePhone ?? "",
      gender: profile.gender ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      nationality: profile.nationality ?? "",
      idType: profile.idType ?? "",
      idNumber: profile.idNumber ?? "",
      source: profile.source,
      notes: profile.notes ?? "",
      addressLine1: profile.address?.line1 ?? "",
      addressLine2: profile.address?.line2 ?? "",
      addressCity: profile.address?.city ?? "",
      addressState: profile.address?.state ?? "",
      addressPostalCode: profile.address?.postalCode ?? "",
      addressCountry: profile.address?.country ?? "",
    },
  });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  const profileType = watch("type");
  const phoneValue = watch("phone") ?? "";
  const altPhoneValue = watch("alternatePhone") ?? "";

  // Address geo state
  const countryFormValue = watch("addressCountry") ?? "";
  const stateFormValue = watch("addressState") ?? "";

  const selectedCountryCode = useMemo(
    () => resolveCountryCode(countryFormValue),
    [countryFormValue],
  );
  const selectedStateCode = useMemo(
    () => resolveStateCode(selectedCountryCode, stateFormValue),
    [selectedCountryCode, stateFormValue],
  );
  const stateOptions = useMemo(
    () => getStateOptions(selectedCountryCode),
    [selectedCountryCode],
  );
  const cityOptions = useMemo(
    () => getCityOptions(selectedCountryCode, selectedStateCode),
    [selectedCountryCode, selectedStateCode],
  );

  function onSubmit(data: UpdateFormData) {
    const dto: UpdateProfileDto = {
      type: data.type,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: stripEmpty(data.companyName),
      email: stripEmpty(data.email),
      phone: stripEmpty(data.phone),
      alternatePhone: stripEmpty(data.alternatePhone),
      gender: (stripEmpty(data.gender) as Gender) || undefined,
      dateOfBirth: stripEmpty(data.dateOfBirth),
      nationality: stripEmpty(data.nationality),
      idType: (stripEmpty(data.idType) as IdType) || undefined,
      idNumber: stripEmpty(data.idNumber),
      source: data.source,
      notes: stripEmpty(data.notes),
      address: buildAddress(data),
    };
    mutate({ id: profile.id, dto });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <IconInfoCircle size={16} className="mt-0.5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      {/* Basic information */}
      <Section
        icon={<IconUser size={18} />}
        title="Basic information"
        description="Name, type, and contact details."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="edit-type" label="Profile type" error={errors.type?.message}>
              <Select
                value={watch("type") ?? "individual"}
                onValueChange={(v) => setValue("type", v as ProfileType, { shouldValidate: true })}
                items={profileTypes.map((t) => ({ value: t.value, label: t.label }))}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {profileTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value} label={t.label}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="edit-firstName" label="First name" error={errors.firstName?.message}>
              <Input id="edit-firstName" {...register("firstName")} />
            </Field>

            <Field id="edit-lastName" label="Last name" error={errors.lastName?.message}>
              <Input id="edit-lastName" {...register("lastName")} />
            </Field>
          </div>

          {profileType !== "individual" && (
            <Field id="edit-companyName" label="Company name" error={errors.companyName?.message}>
              <Input id="edit-companyName" {...register("companyName")} />
            </Field>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="edit-email" label="Email" error={errors.email?.message}>
              <Input id="edit-email" type="email" {...register("email")} />
            </Field>

            <Field id="edit-phone" label="Phone" error={errors.phone?.message}>
              <PhoneInput
                id="edit-phone"
                value={phoneValue}
                onChange={(v) => setValue("phone", v)}
                placeholder="98765 43210"
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="edit-alternatePhone" label="Alternate phone" error={errors.alternatePhone?.message}>
              <PhoneInput
                id="edit-alternatePhone"
                value={altPhoneValue}
                onChange={(v) => setValue("alternatePhone", v)}
                placeholder="98765 43210"
              />
            </Field>

            <Field id="edit-source" label="Source" error={errors.source?.message}>
              <Select
                value={watch("source") ?? "direct"}
                onValueChange={(v) => setValue("source", v as ProfileSource, { shouldValidate: true })}
                items={sourceOptions.map((s) => ({ value: s.value, label: s.label }))}
              >
                <SelectTrigger id="edit-source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value} label={s.label}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </Section>

      {/* Personal details */}
      <Section
        icon={<IconId size={18} />}
        title="Personal details"
        description="Identity, demographics, and notes."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="edit-gender" label="Gender" error={errors.gender?.message}>
              <Select
                value={watch("gender") ?? ""}
                onValueChange={(v) => setValue("gender", (v === "" ? undefined : v) as Gender, { shouldValidate: true })}
                items={genderOptions.map((g) => ({ value: g.value, label: g.label }))}
              >
                <SelectTrigger id="edit-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((g) => (
                    <SelectItem key={g.value} value={g.value} label={g.label}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="edit-dateOfBirth" label="Date of birth" error={errors.dateOfBirth?.message}>
              <Input id="edit-dateOfBirth" type="date" {...register("dateOfBirth")} />
            </Field>

            <Field id="edit-nationality" label="Nationality" error={errors.nationality?.message}>
              <Input id="edit-nationality" {...register("nationality")} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="edit-idType" label="ID type" error={errors.idType?.message}>
              <Select
                value={watch("idType") ?? ""}
                onValueChange={(v) => setValue("idType", (v === "" ? undefined : v) as IdType, { shouldValidate: true })}
                items={idTypeOptions.map((t) => ({ value: t.value, label: t.label }))}
              >
                <SelectTrigger id="edit-idType">
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  {idTypeOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value} label={t.label}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="edit-idNumber" label="ID number" error={errors.idNumber?.message}>
              <Input id="edit-idNumber" {...register("idNumber")} />
            </Field>
          </div>

          <Field id="edit-notes" label="Notes" error={errors.notes?.message}>
            <textarea
              id="edit-notes"
              rows={3}
              placeholder="Any additional notes…"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register("notes")}
            />
          </Field>
        </div>
      </Section>

      {/* Address */}
      <Section
        icon={<IconMapPin size={18} />}
        title="Address"
        description="Guest's mailing or residential address."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="edit-addressLine1" label="Address line 1" error={errors.addressLine1?.message}>
              <Input id="edit-addressLine1" {...register("addressLine1")} />
            </Field>
            <Field id="edit-addressLine2" label="Address line 2" error={errors.addressLine2?.message}>
              <Input id="edit-addressLine2" {...register("addressLine2")} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="edit-addressCountry" label="Country" error={errors.addressCountry?.message}>
              <Combobox
                id="edit-addressCountry"
                options={countryOptions}
                value={selectedCountryCode}
                onChange={(isoCode) => {
                  const country = allCountries.find((c) => c.isoCode === isoCode);
                  setValue("addressCountry", country?.name ?? isoCode);
                  setValue("addressState", "");
                  setValue("addressCity", "");
                }}
                placeholder="Select country"
                searchPlaceholder="Search countries…"
              />
            </Field>
            <Field id="edit-addressState" label="State / Province" error={errors.addressState?.message}>
              <Combobox
                id="edit-addressState"
                options={stateOptions}
                value={selectedStateCode}
                onChange={(isoCode) => {
                  const states = State.getStatesOfCountry(selectedCountryCode);
                  const state = states.find((s: IState) => s.isoCode === isoCode);
                  setValue("addressState", state?.name ?? isoCode);
                  setValue("addressCity", "");
                }}
                placeholder="Select state"
                searchPlaceholder="Search states…"
                disabled={!selectedCountryCode}
              />
            </Field>
            <Field id="edit-addressCity" label="City" error={errors.addressCity?.message}>
              <Combobox
                id="edit-addressCity"
                options={cityOptions}
                value={watch("addressCity") ?? ""}
                onChange={(cityName) => setValue("addressCity", cityName)}
                placeholder="Select city"
                searchPlaceholder="Search cities…"
                disabled={!selectedStateCode}
              />
            </Field>
            <Field id="edit-addressPostalCode" label="Postal code" error={errors.addressPostalCode?.message}>
              <Input id="edit-addressPostalCode" {...register("addressPostalCode")} />
            </Field>
          </div>
        </div>
      </Section>

      {/* Actions */}
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

interface ProfileFormCreateProps {
  mode: "create";
}

interface ProfileFormEditProps {
  mode: "edit";
  defaultValues: Profile;
}

export function ProfileForm(props: ProfileFormCreateProps | ProfileFormEditProps) {
  if (props.mode === "edit") {
    return <EditProfileForm profile={props.defaultValues} />;
  }
  return <CreateProfileForm />;
}
