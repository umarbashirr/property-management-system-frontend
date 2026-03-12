import { useParams, Link } from "react-router";
import { IconArrowLeft, IconCreditCard } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { PlanForm } from "@/features/plans/components/PlanForm";
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {plan.displayName}
            </h1>
            <Badge variant={plan.isActive ? "default" : "secondary"}>
              {plan.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-sm leading-relaxed text-muted-foreground">
            {plan.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <PlanForm mode="edit" defaultValues={plan} />
    </div>
  );
}
