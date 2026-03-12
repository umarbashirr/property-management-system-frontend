import { useQuery } from "@tanstack/react-query";
import { fetchRoom } from "@/features/rooms/services/rooms.service";

export function useRoom(propertyId: string, id: string) {
  return useQuery({
    queryKey: ["rooms", propertyId, id],
    queryFn: () => fetchRoom(propertyId, id),
    enabled: !!propertyId && !!id,
  });
}
