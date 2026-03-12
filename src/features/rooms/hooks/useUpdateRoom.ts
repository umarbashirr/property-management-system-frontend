import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRoom } from "@/features/rooms/services/rooms.service";
import type { UpdateRoomDto } from "@/features/rooms/types/rooms.types";

export function useUpdateRoom(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoomDto }) =>
      updateRoom(propertyId, id, dto),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rooms", propertyId, "list"] }),
        queryClient.invalidateQueries({ queryKey: ["rooms", propertyId, id] }),
      ]);
    },
  });
}
