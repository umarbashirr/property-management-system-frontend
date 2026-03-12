import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoomType } from "@/features/roomTypes/services/roomTypes.service";

export function useDeleteRoomType(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoomType(propertyId, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roomTypes", propertyId, "list"] });
    },
  });
}
