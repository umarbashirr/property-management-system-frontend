import { useQuery } from "@tanstack/react-query";
import { fetchRoomType } from "@/features/roomTypes/services/roomTypes.service";

export function useRoomType(propertyId: string, id: string) {
  return useQuery({
    queryKey: ["roomTypes", propertyId, id],
    queryFn: () => fetchRoomType(propertyId, id),
    enabled: !!propertyId && !!id,
  });
}
