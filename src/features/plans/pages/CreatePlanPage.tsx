import { Link } from "react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { PlanForm } from "@/features/plans/components/PlanForm";

export function CreatePlanPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          to="/super-admin/plans"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft size={16} />
          Back to plans
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">New plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new subscription plan with resource limits and feature flags.
        </p>
      </div>

      <PlanForm mode="create" />
    </div>
  );
}
