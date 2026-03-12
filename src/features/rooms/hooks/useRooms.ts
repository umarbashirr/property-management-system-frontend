import { useQuery } from "@tanstack/react-query";
import { fetchRooms } from "@/features/rooms/services/rooms.service";
import type { ListRoomsQuery } from "@/features/rooms/types/rooms.types";

export function useRooms(propertyId: string, filters: Partial<ListRoomsQuery> = {}) {
  const query = { page: 1, limit: 20, ...filters };

  const stableKey = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined)
  );

  return useQuery({
    queryKey: ["rooms", propertyId, "list", stableKey],
    queryFn: () => fetchRooms(propertyId, query),
    enabled: !!propertyId,
  });
}
