import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRoomType } from "@/features/roomTypes/services/roomTypes.service";
import type { UpdateRoomTypeDto } from "@/features/roomTypes/types/roomTypes.types";

export function useUpdateRoomType(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoomTypeDto }) =>
      updateRoomType(propertyId, id, dto),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["roomTypes", propertyId, "list"] }),
        queryClient.invalidateQueries({ queryKey: ["roomTypes", propertyId, id] }),
      ]);
    },
  });
}
