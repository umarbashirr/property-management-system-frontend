import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRoomStatus } from "@/features/rooms/services/rooms.service";
import type { UpdateRoomStatusDto } from "@/features/rooms/types/rooms.types";

export function useUpdateRoomStatus(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoomStatusDto }) =>
      updateRoomStatus(propertyId, id, dto),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rooms", propertyId, "list"] }),
        queryClient.invalidateQueries({ queryKey: ["rooms", propertyId, id] }),
      ]);
    },
  });
}
