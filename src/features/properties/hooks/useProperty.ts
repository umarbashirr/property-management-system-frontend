import { useQuery } from "@tanstack/react-query";
import { fetchProperty } from "@/features/properties/services/properties.service";

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ["properties", "detail", id],
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
  });
}
