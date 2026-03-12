import { useQuery } from "@tanstack/react-query";
import { fetchPlans } from "@/features/plans/services/plans.service";
import type { ListPlansQuery } from "@/features/plans/types/plans.types";

export function usePlans(filters: Partial<ListPlansQuery> = {}) {
  const query = { page: 1, limit: 20, ...filters };

  const stableKey = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined)
  );

  return useQuery({
    queryKey: ["plans", "list", stableKey],
    queryFn: () => fetchPlans(query),
  });
}
