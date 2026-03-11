import { useQuery } from "@tanstack/react-query";
import { fetchTenant } from "@/features/tenants/services/tenants.service";

export function useTenant(id: string | undefined) {
  return useQuery({
    queryKey: ["tenants", "detail", id],
    queryFn: () => fetchTenant(id!),
    enabled: !!id,
  });
}
