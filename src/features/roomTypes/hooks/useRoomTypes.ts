import { useQuery } from "@tanstack/react-query";
import { fetchRoomTypes } from "@/features/roomTypes/services/roomTypes.service";
import type { ListRoomTypesQuery } from "@/features/roomTypes/types/roomTypes.types";

export function useRoomTypes(propertyId: string, filters: Partial<ListRoomTypesQuery> = {}) {
  const query = { page: 1, limit: 20, ...filters };

  const stableKey = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined)
  );

  return useQuery({
    queryKey: ["roomTypes", propertyId, "list", stableKey],
    queryFn: () => fetchRoomTypes(propertyId, query),
    enabled: !!propertyId,
  });
}
