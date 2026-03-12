import { useQuery } from "@tanstack/react-query";
import { fetchProperties } from "@/features/properties/services/properties.service";
import type { ListPropertiesQuery } from "@/features/properties/types/properties.types";

export function useProperties(filters?: Partial<ListPropertiesQuery>) {
  const query = filters ? { page: 1, limit: 20, ...filters } : null;

  // Omit undefined values for a stable query key
  const stableKey = query
    ? Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined))
    : null;

  return useQuery({
    queryKey: ["properties", "list", stableKey],
    queryFn: () => fetchProperties(query!),
    enabled: !!query,
  });
}
