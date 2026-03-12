import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import {
  IconBed,
  IconCurrencyRupee,
  IconInfoCircle,
  IconLoader,
  IconSettings,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useCreateRoomType } from "@/features/roomTypes/hooks/useCreateRoomType";
import { useUpdateRoomType } from "@/features/roomTypes/hooks/useUpdateRoomType";
import { isApiError } from "@/lib/api";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type {
  CreateRoomTypeDto,
  RoomType,
  UpdateRoomTypeDto,
} from "@/features/roomTypes/types/roomTypes.types";

// ─── Schemas ────────────────────────────────────────────────────────────────

const codeRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const decimalRegex = /^\d+(\.\d{1,2})?$/;
const intRegex = /^\d+$/;

const createRoomTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  code: z
    .string()
    .min(1, "Code is required")
    .max(100)
    .regex(codeRegex, "Lowercase alphanumeric with hyphens only"),
  description: z.string().max(2000).optional(),
  baseRate: z
    .string()
    .min(1, "Base rate is required")
    .regex(decimalRegex, "Enter a valid amount (e.g. 5000.00)"),
  maxOccupancy: z
    .string()
    .regex(intRegex, "Must be a whole number")
    .or(z.literal(""))
    .optional(),
  extraPersonCharge: z
    .string()
    .regex(decimalRegex, "Enter a valid amount")
    .or(z.literal(""))
    .optional(),
  bedType: z.enum(["king", "queen", "twin", "double", "single", "sofa_bed"], {
    error: "Bed type is required",
  }),
  bedCount: z
    .string()
    .regex(intRegex, "Must be a whole number")
    .or(z.literal(""))
    .optional(),
  areaInSqft: z
    .string()
    .regex(decimalRegex, "Enter a valid area")
    .or(z.literal(""))
    .optional(),
  floorLevel: z.string().max(50).optional(),
});

const updateRoomTypeSchema = createRoomTypeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

type CreateFormData = z.infer<typeof createRoomTypeSchema>;
type UpdateFormData = z.infer<typeof updateRoomTypeSchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function toCode(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

// ─── Create form ─────────────────────────────────────────────────────────────

function CreateRoomTypeForm({ propertyId }: { propertyId: string }) {
  const { mutate, isPending, error } = useCreateRoomType(propertyId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormData>({ resolver: zodResolver(createRoomTypeSchema) });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  // Auto-generate code from name
  const nameValue = watch("name");
  useEffect(() => {
    if (nameValue) {
      setValue("code", toCode(nameValue), { shouldValidate: false });
    }
  }, [nameValue, setValue]);

  function onSubmit(data: CreateFormData) {
    const dto: CreateRoomTypeDto = {
      name: data.name,
      code: data.code,
      baseRate: data.baseRate,
      bedType: data.bedType,
      ...(data.description ? { description: data.description } : {}),
      ...(data.maxOccupancy
        ? { maxOccupancy: Number(data.maxOccupancy) }
        : {}),
      ...(data.extraPersonCharge
        ? { extraPersonCharge: data.extraPersonCharge }
        : {}),
      ...(data.bedCount ? { bedCount: Number(data.bedCount) } : {}),
      ...(data.areaInSqft ? { areaInSqft: data.areaInSqft } : {}),
      ...(data.floorLevel ? { floorLevel: data.floorLevel } : {}),
    };
    mutate(dto);
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

      {/* ── Identity ── */}
      <Section
        icon={<IconBed size={18} />}
        title="Identity"
        description="Name, code, and description for this room type."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="name"
              label="Name"
              required
              hint="The display name shown to staff"
              error={errors.name?.message}
            >
              <Input
                id="name"
                placeholder="Deluxe Double"
                {...register("name")}
              />
            </Field>

            <Field
              id="code"
              label="Code"
              required
              hint="Auto-generated from name — used as a short identifier"
              error={errors.code?.message}
            >
              <Input
                id="code"
                placeholder="deluxe-double"
                {...register("code")}
              />
            </Field>
          </div>

          <Field
            id="description"
            label="Description"
            hint="Brief description of the room type (max 2000 chars)"
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              placeholder="A spacious room with city views and premium amenities"
              rows={3}
              {...register("description")}
            />
          </Field>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section
        icon={<IconCurrencyRupee size={18} />}
        title="Pricing"
        description="Base rate and additional charges."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="baseRate"
            label="Base rate"
            required
            hint="Default nightly rate for this room type"
            error={errors.baseRate?.message}
          >
            <Input
              id="baseRate"
              placeholder="5000.00"
              {...register("baseRate")}
            />
          </Field>

          <Field
            id="extraPersonCharge"
            label="Extra person charge"
            hint="Additional charge per extra guest"
            error={errors.extraPersonCharge?.message}
          >
            <Input
              id="extraPersonCharge"
              placeholder="1000.00"
              {...register("extraPersonCharge")}
            />
          </Field>
        </div>
      </Section>

      {/* ── Configuration ── */}
      <Section
        icon={<IconSettings size={18} />}
        title="Configuration"
        description="Bed setup, occupancy limits, and room dimensions."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            id="bedType"
            label="Bed type"
            required
            error={errors.bedType?.message}
          >
            <Select
              value={watch("bedType") ?? ""}
              onValueChange={(v) => {
                if (v)
                  setValue("bedType", v as CreateFormData["bedType"], {
                    shouldValidate: true,
                  });
              }}
            >
              <SelectTrigger id="bedType" className="w-full">
                <SelectValue placeholder="Select bed type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="king" label="King">King</SelectItem>
                <SelectItem value="queen" label="Queen">Queen</SelectItem>
                <SelectItem value="twin" label="Twin">Twin</SelectItem>
                <SelectItem value="double" label="Double">Double</SelectItem>
                <SelectItem value="single" label="Single">Single</SelectItem>
                <SelectItem value="sofa_bed" label="Sofa Bed">Sofa Bed</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            id="bedCount"
            label="Bed count"
            hint="Number of beds in the room"
            error={errors.bedCount?.message}
          >
            <Input id="bedCount" placeholder="1" {...register("bedCount")} />
          </Field>

          <Field
            id="maxOccupancy"
            label="Max occupancy"
            hint="Maximum guests allowed"
            error={errors.maxOccupancy?.message}
          >
            <Input
              id="maxOccupancy"
              placeholder="2"
              {...register("maxOccupancy")}
            />
          </Field>

          <Field
            id="areaInSqft"
            label="Area (sq ft)"
            hint="Room area in square feet"
            error={errors.areaInSqft?.message}
          >
            <Input
              id="areaInSqft"
              placeholder="450.00"
              {...register("areaInSqft")}
            />
          </Field>

          <Field
            id="floorLevel"
            label="Floor level"
            hint="Typical floor for this room type"
            error={errors.floorLevel?.message}
          >
            <Input
              id="floorLevel"
              placeholder="2"
              {...register("floorLevel")}
            />
          </Field>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to={`/properties/${propertyId}/room-types`}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
          {isPending ? "Creating..." : "Create room type"}
        </Button>
      </div>
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

interface EditRoomTypeFormProps {
  propertyId: string;
  roomType: RoomType;
}

function EditRoomTypeForm({ propertyId, roomType }: EditRoomTypeFormProps) {
  const { mutate, isPending, error } = useUpdateRoomType(propertyId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateRoomTypeSchema),
    defaultValues: {
      name: roomType.name,
      code: roomType.code,
      description: roomType.description ?? "",
      baseRate: roomType.baseRate,
      maxOccupancy: String(roomType.maxOccupancy),
      extraPersonCharge: roomType.extraPersonCharge ?? "",
      bedType: roomType.bedType,
      bedCount: String(roomType.bedCount),
      areaInSqft: roomType.areaInSqft ?? "",
      floorLevel: roomType.floorLevel ?? "",
      isActive: roomType.isActive,
    },
  });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  const currentIsActive = watch("isActive");

  function onSubmit(data: UpdateFormData) {
    const dto: UpdateRoomTypeDto = {
      ...data,
      maxOccupancy: data.maxOccupancy ? Number(data.maxOccupancy) : undefined,
      bedCount: data.bedCount ? Number(data.bedCount) : undefined,
    };
    mutate({ id: roomType.id, dto });
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

      {/* ── Identity ── */}
      <Section
        icon={<IconBed size={18} />}
        title="Identity"
        description="Name, code, status, and description."
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
              id="edit-code"
              label="Code"
              required
              error={errors.code?.message}
            >
              <Input id="edit-code" {...register("code")} />
            </Field>
          </div>

          <Field
            id="edit-description"
            label="Description"
            error={errors.description?.message}
          >
            <Textarea
              id="edit-description"
              rows={3}
              {...register("description")}
            />
          </Field>

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

      {/* ── Pricing ── */}
      <Section
        icon={<IconCurrencyRupee size={18} />}
        title="Pricing"
        description="Base rate and additional charges."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="edit-baseRate"
            label="Base rate"
            error={errors.baseRate?.message}
          >
            <Input id="edit-baseRate" {...register("baseRate")} />
          </Field>

          <Field
            id="edit-extraPersonCharge"
            label="Extra person charge"
            error={errors.extraPersonCharge?.message}
          >
            <Input
              id="edit-extraPersonCharge"
              {...register("extraPersonCharge")}
            />
          </Field>
        </div>
      </Section>

      {/* ── Configuration ── */}
      <Section
        icon={<IconSettings size={18} />}
        title="Configuration"
        description="Bed setup, occupancy limits, and room dimensions."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            id="edit-bedType"
            label="Bed type"
            error={errors.bedType?.message}
          >
            <Select
              value={watch("bedType") ?? ""}
              onValueChange={(v) => {
                if (v)
                  setValue("bedType", v as CreateFormData["bedType"], {
                    shouldValidate: true,
                  });
              }}
            >
              <SelectTrigger id="edit-bedType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="king" label="King">King</SelectItem>
                <SelectItem value="queen" label="Queen">Queen</SelectItem>
                <SelectItem value="twin" label="Twin">Twin</SelectItem>
                <SelectItem value="double" label="Double">Double</SelectItem>
                <SelectItem value="single" label="Single">Single</SelectItem>
                <SelectItem value="sofa_bed" label="Sofa Bed">Sofa Bed</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            id="edit-bedCount"
            label="Bed count"
            error={errors.bedCount?.message}
          >
            <Input id="edit-bedCount" {...register("bedCount")} />
          </Field>

          <Field
            id="edit-maxOccupancy"
            label="Max occupancy"
            error={errors.maxOccupancy?.message}
          >
            <Input id="edit-maxOccupancy" {...register("maxOccupancy")} />
          </Field>

          <Field
            id="edit-areaInSqft"
            label="Area (sq ft)"
            error={errors.areaInSqft?.message}
          >
            <Input id="edit-areaInSqft" {...register("areaInSqft")} />
          </Field>

          <Field
            id="edit-floorLevel"
            label="Floor level"
            error={errors.floorLevel?.message}
          >
            <Input id="edit-floorLevel" {...register("floorLevel")} />
          </Field>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

interface RoomTypeFormCreateProps {
  mode: "create";
  propertyId: string;
}

interface RoomTypeFormEditProps {
  mode: "edit";
  propertyId: string;
  defaultValues: RoomType;
}

export function RoomTypeForm(
  props: RoomTypeFormCreateProps | RoomTypeFormEditProps,
) {
  if (props.mode === "edit") {
    return (
      <EditRoomTypeForm
        propertyId={props.propertyId}
        roomType={props.defaultValues}
      />
    );
  }
  return <CreateRoomTypeForm propertyId={props.propertyId} />;
}
