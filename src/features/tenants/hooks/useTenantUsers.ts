import { useQuery } from "@tanstack/react-query";
import { fetchTenantUsers } from "@/features/tenants/services/tenants.service";
import type { ListTenantUsersQuery } from "@/features/tenants/types/tenants.types";

export function useTenantUsers(
  tenantId: string | undefined,
  filters: Partial<ListTenantUsersQuery> = {}
) {
  const query = { page: 1, limit: 20, ...filters };

  const stableKey = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined)
  );

  return useQuery({
    queryKey: ["tenants", "users", tenantId, stableKey],
    queryFn: () => fetchTenantUsers(tenantId!, query),
    enabled: !!tenantId,
  });
}
