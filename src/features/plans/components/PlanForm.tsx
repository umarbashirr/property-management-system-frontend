import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import {
  IconCreditCard,
  IconGauge,
  IconCoin,
  IconFlag,
  IconInfoCircle,
  IconLoader,
  IconPlus,
  IconX,
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

      {/* ── Plan identity ── */}
      <Section
        icon={<IconCreditCard size={18} />}
        title="Plan identity"
        description="Internal name, display name, and status."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="name"
              label="Internal name"
              required
              hint="Lowercase with underscores (e.g. starter, pro, enterprise)"
              error={errors.name?.message}
            >
              <Input
                id="name"
                placeholder="starter"
                {...register("name")}
              />
            </Field>

            <Field
              id="displayName"
              label="Display name"
              required
              error={errors.displayName?.message}
            >
              <Input
                id="displayName"
                placeholder="Starter Plan"
                {...register("displayName")}
              />
            </Field>
          </div>

          <div className="max-w-xs">
            <Field id="isActive" label="Status">
              <Select
                value={currentIsActive ? "true" : "false"}
                onValueChange={(v) =>
                  setValue("isActive", (v ?? "false") === "true", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true" label="Active">Active</SelectItem>
                  <SelectItem value="false" label="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Resource limits ── */}
      <Section
        icon={<IconGauge size={18} />}
        title="Resource limits"
        description="Maximum resources allowed for tenants on this plan."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            id="maxProperties"
            label="Max properties"
            required
            error={errors.maxProperties?.message}
          >
            <Input
              id="maxProperties"
              type="number"
              min={1}
              {...register("maxProperties")}
            />
          </Field>

          <Field
            id="maxRooms"
            label="Max rooms / property"
            required
            error={errors.maxRoomsPerProperty?.message}
          >
            <Input
              id="maxRooms"
              type="number"
              min={1}
              {...register("maxRoomsPerProperty")}
            />
          </Field>

          <Field
            id="maxUsers"
            label="Max users"
            required
            error={errors.maxUsers?.message}
          >
            <Input
              id="maxUsers"
              type="number"
              min={1}
              {...register("maxUsers")}
            />
          </Field>

          <Field
            id="maxWorkflows"
            label="Max workflows"
            required
            error={errors.maxWorkflows?.message}
          >
            <Input
              id="maxWorkflows"
              type="number"
              min={0}
              {...register("maxWorkflows")}
            />
          </Field>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section
        icon={<IconCoin size={18} />}
        title="Pricing"
        description="Monthly and yearly pricing in cents (0 = free tier)."
      >
        <div className="grid gap-5 sm:grid-cols-2 max-w-md">
          <Field
            id="priceMonthly"
            label="Monthly price"
            required
            hint="0 = free tier"
            error={errors.priceMonthly?.message}
          >
            <Input
              id="priceMonthly"
              type="number"
              min={0}
              {...register("priceMonthly")}
            />
          </Field>

          <Field
            id="priceYearly"
            label="Yearly price"
            required
            error={errors.priceYearly?.message}
          >
            <Input
              id="priceYearly"
              type="number"
              min={0}
              {...register("priceYearly")}
            />
          </Field>
        </div>
      </Section>

      {/* ── Feature flags ── */}
      <Section
        icon={<IconFlag size={18} />}
        title="Feature flags"
        description="Features available to tenants on this plan."
      >
        <FeatureTagInput value={features} onChange={setFeatures} />
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to="/super-admin/plans"
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
          {isPending ? "Creating…" : "Create plan"}
        </Button>
      </div>
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

      {/* ── Plan identity ── */}
      <Section
        icon={<IconCreditCard size={18} />}
        title="Plan identity"
        description="Internal name, display name, and status."
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="edit-name"
              label="Internal name"
              required
              hint="Lowercase with underscores (e.g. starter, pro, enterprise)"
              error={errors.name?.message}
            >
              <Input
                id="edit-name"
                {...register("name")}
              />
            </Field>

            <Field
              id="edit-displayName"
              label="Display name"
              required
              error={errors.displayName?.message}
            >
              <Input
                id="edit-displayName"
                {...register("displayName")}
              />
            </Field>
          </div>

          <div className="max-w-xs">
            <Field id="edit-isActive" label="Status">
              <Select
                value={currentIsActive ? "true" : "false"}
                onValueChange={(v) =>
                  setValue("isActive", (v ?? "false") === "true", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="edit-isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true" label="Active">Active</SelectItem>
                  <SelectItem value="false" label="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Resource limits ── */}
      <Section
        icon={<IconGauge size={18} />}
        title="Resource limits"
        description="Maximum resources allowed for tenants on this plan."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            id="edit-maxProperties"
            label="Max properties"
            required
            error={errors.maxProperties?.message}
          >
            <Input
              id="edit-maxProperties"
              type="number"
              min={1}
              {...register("maxProperties")}
            />
          </Field>

          <Field
            id="edit-maxRooms"
            label="Max rooms / property"
            required
            error={errors.maxRoomsPerProperty?.message}
          >
            <Input
              id="edit-maxRooms"
              type="number"
              min={1}
              {...register("maxRoomsPerProperty")}
            />
          </Field>

          <Field
            id="edit-maxUsers"
            label="Max users"
            required
            error={errors.maxUsers?.message}
          >
            <Input
              id="edit-maxUsers"
              type="number"
              min={1}
              {...register("maxUsers")}
            />
          </Field>

          <Field
            id="edit-maxWorkflows"
            label="Max workflows"
            required
            error={errors.maxWorkflows?.message}
          >
            <Input
              id="edit-maxWorkflows"
              type="number"
              min={0}
              {...register("maxWorkflows")}
            />
          </Field>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section
        icon={<IconCoin size={18} />}
        title="Pricing"
        description="Monthly and yearly pricing in cents (0 = free tier)."
      >
        <div className="grid gap-5 sm:grid-cols-2 max-w-md">
          <Field
            id="edit-priceMonthly"
            label="Monthly price"
            required
            error={errors.priceMonthly?.message}
          >
            <Input
              id="edit-priceMonthly"
              type="number"
              min={0}
              {...register("priceMonthly")}
            />
          </Field>

          <Field
            id="edit-priceYearly"
            label="Yearly price"
            required
            error={errors.priceYearly?.message}
          >
            <Input
              id="edit-priceYearly"
              type="number"
              min={0}
              {...register("priceYearly")}
            />
          </Field>
        </div>
      </Section>

      {/* ── Feature flags ── */}
      <Section
        icon={<IconFlag size={18} />}
        title="Feature flags"
        description="Features available to tenants on this plan."
      >
        <FeatureTagInput value={features} onChange={setFeatures} />
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to="/super-admin/plans"
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
