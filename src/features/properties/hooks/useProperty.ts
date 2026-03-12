import { useQuery } from "@tanstack/react-query";
import { fetchProperty } from "@/features/properties/services/properties.service";

export function useProperty(id: string | undefined, tenantId?: string) {
  return useQuery({
    queryKey: ["properties", "detail", id, tenantId],
    queryFn: () => fetchProperty(id!, tenantId),
    enabled: !!id,
  });
}
