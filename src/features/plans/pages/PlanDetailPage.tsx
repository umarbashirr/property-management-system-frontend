import { useParams, Link } from "react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { PlanForm } from "@/features/plans/components/PlanForm";
import { PlanStatusBadge } from "@/features/plans/components/PlanStatusBadge";
import { usePlan } from "@/features/plans/hooks/usePlan";

export function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: plan, isLoading, isError } = usePlan(id);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">Plan not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This plan may have been deleted or the ID is invalid.
        </p>
        <Link
          to="/super-admin/plans"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <IconArrowLeft size={16} />
          Back to plans
        </Link>
      </div>
    );
  }

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
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{plan.displayName}</h1>
          <PlanStatusBadge isActive={plan.isActive} />
        </div>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{plan.name}</p>
      </div>

      <PlanForm mode="edit" defaultValues={plan} />
    </div>
  );
}
