import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconLoader, IconPlus, IconX } from "@tabler/icons-react";
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
import { useCreatePlan } from "@/features/plans/hooks/useCreatePlan";
import { useUpdatePlan } from "@/features/plans/hooks/useUpdatePlan";
import { isApiError } from "@/lib/api";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type { Plan } from "@/features/plans/types/plans.types";

// ─── Known features ─────────────────────────────────────────────────────────

const KNOWN_FEATURES = [
  "multi_property",
  "housekeeping",
  "custom_workflows",
  "api_access",
  "advanced_reports",
  "channel_manager",
  "revenue_management",
  "guest_messaging",
] as const;

// ─── Schemas ────────────────────────────────────────────────────────────────

const slugRegex = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const createPlanSchema = z.object({
  name: z
    .string()
    .min(1, "Internal name is required")
    .max(50)
    .regex(slugRegex, "Lowercase alphanumeric with underscores only"),
  displayName: z.string().min(1, "Display name is required").max(100),
  maxProperties: z.coerce.number().int().min(1, "At least 1"),
  maxRoomsPerProperty: z.coerce.number().int().min(1, "At least 1"),
  maxUsers: z.coerce.number().int().min(1, "At least 1"),
  maxWorkflows: z.coerce.number().int().min(0, "Cannot be negative"),
  priceMonthly: z.coerce.number().int().min(0, "Cannot be negative"),
  priceYearly: z.coerce.number().int().min(0, "Cannot be negative"),
  isActive: z.boolean(),
});

const updatePlanSchema = createPlanSchema.partial();

type CreateFormData = z.infer<typeof createPlanSchema>;
type UpdateFormData = z.infer<typeof updatePlanSchema>;

// ─── Feature tag input ──────────────────────────────────────────────────────

interface FeatureTagInputProps {
  value: string[];
  onChange: (features: string[]) => void;
}

function FeatureTagInput({ value, onChange }: FeatureTagInputProps) {
  const [input, setInput] = useState("");

  function addFeature(feature: string) {
    const trimmed = feature.trim().toLowerCase().replace(/\s+/g, "_");
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  }

  function removeFeature(feature: string) {
    onChange(value.filter((f) => f !== feature));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature(input);
    }
  }

  const unusedKnown = KNOWN_FEATURES.filter((f) => !value.includes(f));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((feature) => (
          <span
            key={feature}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
          >
            {feature}
            <button
              type="button"
              onClick={() => removeFeature(feature)}
              className="rounded-sm hover:bg-primary/20 p-0.5"
            >
              <IconX size={12} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add custom feature flag…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addFeature(input)}
          disabled={!input.trim()}
        >
          <IconPlus size={14} />
        </Button>
      </div>

      {unusedKnown.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {unusedKnown.map((feature) => (
            <button
              key={feature}
              type="button"
              onClick={() => addFeature(feature)}
              className="rounded-md border border-dashed border-muted-foreground/30 px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              + {feature}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create form ─────────────────────────────────────────────────────────────

function CreatePlanForm() {
  const { mutate, isPending, error } = useCreatePlan();
  const [features, setFeatures] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      maxProperties: 1,
      maxRoomsPerProperty: 50,
      maxUsers: 5,
      maxWorkflows: 0,
      priceMonthly: 0,
      priceYearly: 0,
      isActive: true,
    },
  });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  const currentIsActive = watch("isActive");

  function onSubmit(data: CreateFormData) {
    mutate({ ...data, features });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      {/* Identity */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Plan identity
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="plan-name">Internal name</Label>
            <Input id="plan-name" placeholder="starter" {...register("name")} />
            <p className="text-xs text-muted-foreground">
              Lowercase with underscores (e.g. starter, pro, enterprise)
            </p>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-displayName">Display name</Label>
            <Input id="plan-displayName" placeholder="Starter Plan" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5 max-w-xs">
          <Label htmlFor="plan-isActive">Status</Label>
          <Select
            value={currentIsActive ? "true" : "false"}
            onValueChange={(v) => setValue("isActive", (v ?? "false") === "true", { shouldValidate: true })}
          >
            <SelectTrigger id="plan-isActive">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Limits */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Resource limits
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="plan-maxProperties">Max properties</Label>
            <Input
              id="plan-maxProperties"
              type="number"
              min={1}
              {...register("maxProperties")}
            />
            {errors.maxProperties && (
              <p className="text-sm text-destructive">{errors.maxProperties.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-maxRooms">Max rooms / property</Label>
            <Input
              id="plan-maxRooms"
              type="number"
              min={1}
              {...register("maxRoomsPerProperty")}
            />
            {errors.maxRoomsPerProperty && (
              <p className="text-sm text-destructive">{errors.maxRoomsPerProperty.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-maxUsers">Max users</Label>
            <Input
              id="plan-maxUsers"
              type="number"
              min={1}
              {...register("maxUsers")}
            />
            {errors.maxUsers && (
              <p className="text-sm text-destructive">{errors.maxUsers.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-maxWorkflows">Max workflows</Label>
            <Input
              id="plan-maxWorkflows"
              type="number"
              min={0}
              {...register("maxWorkflows")}
            />
            {errors.maxWorkflows && (
              <p className="text-sm text-destructive">{errors.maxWorkflows.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Pricing (in cents)
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="plan-priceMonthly">Monthly price</Label>
            <Input
              id="plan-priceMonthly"
              type="number"
              min={0}
              {...register("priceMonthly")}
            />
            <p className="text-xs text-muted-foreground">0 = free tier</p>
            {errors.priceMonthly && (
              <p className="text-sm text-destructive">{errors.priceMonthly.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-priceYearly">Yearly price</Label>
            <Input
              id="plan-priceYearly"
              type="number"
              min={0}
              {...register("priceYearly")}
            />
            {errors.priceYearly && (
              <p className="text-sm text-destructive">{errors.priceYearly.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Feature flags
        </h3>
        <FeatureTagInput value={features} onChange={setFeatures} />
      </section>

      <Button type="submit" disabled={isPending}>
        {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
        {isPending ? "Creating…" : "Create plan"}
      </Button>
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

interface EditPlanFormProps {
  plan: Plan;
}

function EditPlanForm({ plan }: EditPlanFormProps) {
  const { mutate, isPending, error } = useUpdatePlan();
  const [features, setFeatures] = useState<string[]>(plan.features);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: {
      name: plan.name,
      displayName: plan.displayName,
      maxProperties: plan.maxProperties,
      maxRoomsPerProperty: plan.maxRoomsPerProperty,
      maxUsers: plan.maxUsers,
      maxWorkflows: plan.maxWorkflows,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      isActive: plan.isActive,
    },
  });

  const serverError = isApiError(error)
    ? (error.response?.data as ApiErrorResponse | undefined)?.error?.message
    : null;

  const currentIsActive = watch("isActive");

  function onSubmit(data: UpdateFormData) {
    mutate({ id: plan.id, dto: { ...data, features } });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      {/* Identity */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Plan identity
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Internal name</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-displayName">Display name</Label>
            <Input id="edit-displayName" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5 max-w-xs">
          <Label htmlFor="edit-isActive">Status</Label>
          <Select
            value={currentIsActive ? "true" : "false"}
            onValueChange={(v) => setValue("isActive", (v ?? "false") === "true", { shouldValidate: true })}
          >
            <SelectTrigger id="edit-isActive">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Limits */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Resource limits
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-maxProperties">Max properties</Label>
            <Input
              id="edit-maxProperties"
              type="number"
              min={1}
              {...register("maxProperties")}
            />
            {errors.maxProperties && (
              <p className="text-sm text-destructive">{errors.maxProperties.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-maxRooms">Max rooms / property</Label>
            <Input
              id="edit-maxRooms"
              type="number"
              min={1}
              {...register("maxRoomsPerProperty")}
            />
            {errors.maxRoomsPerProperty && (
              <p className="text-sm text-destructive">{errors.maxRoomsPerProperty.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-maxUsers">Max users</Label>
            <Input
              id="edit-maxUsers"
              type="number"
              min={1}
              {...register("maxUsers")}
            />
            {errors.maxUsers && (
              <p className="text-sm text-destructive">{errors.maxUsers.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-maxWorkflows">Max workflows</Label>
            <Input
              id="edit-maxWorkflows"
              type="number"
              min={0}
              {...register("maxWorkflows")}
            />
            {errors.maxWorkflows && (
              <p className="text-sm text-destructive">{errors.maxWorkflows.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Pricing (in cents)
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="edit-priceMonthly">Monthly price</Label>
            <Input
              id="edit-priceMonthly"
              type="number"
              min={0}
              {...register("priceMonthly")}
            />
            {errors.priceMonthly && (
              <p className="text-sm text-destructive">{errors.priceMonthly.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-priceYearly">Yearly price</Label>
            <Input
              id="edit-priceYearly"
              type="number"
              min={0}
              {...register("priceYearly")}
            />
            {errors.priceYearly && (
              <p className="text-sm text-destructive">{errors.priceYearly.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Feature flags
        </h3>
        <FeatureTagInput value={features} onChange={setFeatures} />
      </section>

      <Button type="submit" disabled={isPending}>
        {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

interface PlanFormCreateProps {
  mode: "create";
}

interface PlanFormEditProps {
  mode: "edit";
  defaultValues: Plan;
}

export function PlanForm(props: PlanFormCreateProps | PlanFormEditProps) {
  if (props.mode === "edit") {
    return <EditPlanForm plan={props.defaultValues} />;
  }
  return <CreatePlanForm />;
}
