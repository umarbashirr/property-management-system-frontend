import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import {
  IconDoor,
  IconInfoCircle,
  IconLoader,
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
import { useCreateRoom } from "@/features/rooms/hooks/useCreateRoom";
import { useUpdateRoom } from "@/features/rooms/hooks/useUpdateRoom";
import { useRoomTypes } from "@/features/roomTypes/hooks/useRoomTypes";
import { isApiError } from "@/lib/api";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type { Room } from "@/features/rooms/types/rooms.types";

// ─── Schemas ────────────────────────────────────────────────────────────────

const createRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required").max(20),
  roomTypeId: z.string().uuid("Room type is required"),
  floor: z.string().max(10).optional(),
  status: z
    .enum(["available", "occupied", "dirty", "maintenance", "out_of_order"])
    .optional(),
  notes: z.string().max(2000).optional(),
});

const updateRoomSchema = z.object({
  roomNumber: z.string().min(1).max(20).optional(),
  roomTypeId: z.string().uuid().optional(),
  floor: z.string().max(10).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
});

type CreateFormData = z.infer<typeof createRoomSchema>;
type UpdateFormData = z.infer<typeof updateRoomSchema>;

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

function CreateRoomForm({ propertyId }: { propertyId: string }) {
  const { mutate, isPending, error } = useCreateRoom(propertyId);
  const { data: roomTypesData } = useRoomTypes(propertyId, {
    limit: 100,
    isActive: true,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormData>({ resolver: zodResolver(createRoomSchema) });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  function onSubmit(data: CreateFormData) {
    const dto = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== "" && v !== undefined),
    ) as CreateFormData;
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

      {/* ── Room details ── */}
      <Section
        icon={<IconDoor size={18} />}
        title="Room details"
        description="Basic information about this room."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="roomNumber"
              label="Room number"
              required
              hint="Unique identifier displayed to staff and guests"
              error={errors.roomNumber?.message}
            >
              <Input
                id="roomNumber"
                placeholder="101"
                {...register("roomNumber")}
              />
            </Field>

            <Field
              id="roomTypeId"
              label="Room type"
              required
              hint="Determines pricing, bed setup, and amenities"
              error={errors.roomTypeId?.message}
            >
              <Select
                value={watch("roomTypeId") ?? ""}
                onValueChange={(v) =>
                  setValue("roomTypeId", v ?? "", { shouldValidate: true })
                }
              >
                <SelectTrigger id="roomTypeId">
                  <SelectValue placeholder="Select room type">
                    {roomTypesData?.data.find(
                      (rt) => rt.id === watch("roomTypeId")
                    )?.name ?? "Select room type"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roomTypesData?.data.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id} label={rt.name}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              id="floor"
              label="Floor"
              hint="Floor number where the room is located"
              error={errors.floor?.message}
            >
              <Input id="floor" placeholder="1" {...register("floor")} />
            </Field>

            <Field
              id="status"
              label="Initial status"
              hint="Status when the room is first created"
            >
              <Select
                value={watch("status") ?? "available"}
                onValueChange={(v) => {
                  if (v)
                    setValue("status", v as CreateFormData["status"], {
                      shouldValidate: true,
                    });
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available" label="Available">Available</SelectItem>
                  <SelectItem value="maintenance" label="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="out_of_order" label="Out of Order">Out of Order</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field
            id="notes"
            label="Notes"
            hint="Internal notes about this room (max 2000 chars)"
            error={errors.notes?.message}
          >
            <Textarea
              id="notes"
              placeholder="Corner room with sea view, recently renovated"
              rows={3}
              {...register("notes")}
            />
          </Field>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to={`/properties/${propertyId}/rooms`}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
          {isPending ? "Creating..." : "Create room"}
        </Button>
      </div>
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

interface EditRoomFormProps {
  propertyId: string;
  room: Room;
}

function EditRoomForm({ propertyId, room }: EditRoomFormProps) {
  const { mutate, isPending, error } = useUpdateRoom(propertyId);
  const { data: roomTypesData } = useRoomTypes(propertyId, {
    limit: 100,
    isActive: true,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateRoomSchema),
    defaultValues: {
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
      floor: room.floor ?? "",
      isActive: room.isActive,
      notes: room.notes ?? "",
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
    mutate({ id: room.id, dto });
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

      {/* ── Room details ── */}
      <Section
        icon={<IconDoor size={18} />}
        title="Room details"
        description="Room number, type, floor, and status."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="edit-roomNumber"
              label="Room number"
              error={errors.roomNumber?.message}
            >
              <Input id="edit-roomNumber" {...register("roomNumber")} />
            </Field>

            <Field
              id="edit-roomTypeId"
              label="Room type"
              error={errors.roomTypeId?.message}
            >
              <Select
                value={watch("roomTypeId") ?? ""}
                onValueChange={(v) =>
                  setValue("roomTypeId", v ?? "", { shouldValidate: true })
                }
              >
                <SelectTrigger id="edit-roomTypeId">
                  <SelectValue>
                    {roomTypesData?.data.find(
                      (rt) => rt.id === watch("roomTypeId")
                    )?.name ?? "Select room type"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roomTypesData?.data.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id} label={rt.name}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              id="edit-floor"
              label="Floor"
              error={errors.floor?.message}
            >
              <Input id="edit-floor" {...register("floor")} />
            </Field>

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

          <Field
            id="edit-notes"
            label="Notes"
            error={errors.notes?.message}
          >
            <Textarea id="edit-notes" rows={3} {...register("notes")} />
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

interface RoomFormCreateProps {
  mode: "create";
  propertyId: string;
}

interface RoomFormEditProps {
  mode: "edit";
  propertyId: string;
  defaultValues: Room;
}

export function RoomForm(props: RoomFormCreateProps | RoomFormEditProps) {
  if (props.mode === "edit") {
    return (
      <EditRoomForm propertyId={props.propertyId} room={props.defaultValues} />
    );
  }
  return <CreateRoomForm propertyId={props.propertyId} />;
}
