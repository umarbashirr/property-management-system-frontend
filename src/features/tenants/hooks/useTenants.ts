import { useQuery } from "@tanstack/react-query";
import { fetchTenants } from "@/features/tenants/services/tenants.service";
import type { ListTenantsQuery } from "@/features/tenants/types/tenants.types";

export function useTenants(filters: Partial<ListTenantsQuery> = {}) {
  const query = { page: 1, limit: 20, ...filters };

  // Omit undefined values for a stable query key
  const stableKey = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined)
  );

  return useQuery({
    queryKey: ["tenants", "list", stableKey],
    queryFn: () => fetchTenants(query),
  });
}
