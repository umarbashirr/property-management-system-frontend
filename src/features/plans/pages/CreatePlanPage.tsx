import { Link } from "react-router";
import { IconArrowLeft, IconCreditCard } from "@tabler/icons-react";
import { PlanForm } from "@/features/plans/components/PlanForm";

export function CreatePlanPage() {
  return (
    <div className="mx-auto max-w-3xl pb-12">
      {/* Navigation */}
      <Link
        to="/super-admin/plans"
        className="group mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Back to plans
      </Link>

      {/* Page header */}
      <div className="mb-10 flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <IconCreditCard size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create a new plan
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Set up a subscription plan with resource limits, pricing, and
            feature flags. You can always update these details later.
          </p>
        </div>
      </div>

      {/* Form */}
      <PlanForm mode="create" />
    </div>
  );
}
