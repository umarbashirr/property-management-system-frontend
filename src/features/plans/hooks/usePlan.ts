import { useQuery } from "@tanstack/react-query";
import { fetchPlan } from "@/features/plans/services/plans.service";

export function usePlan(id: string | undefined) {
  return useQuery({
    queryKey: ["plans", "detail", id],
    queryFn: () => fetchPlan(id!),
    enabled: !!id,
  });
}
