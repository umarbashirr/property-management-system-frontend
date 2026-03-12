import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoom } from "@/features/rooms/services/rooms.service";

export function useDeleteRoom(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoom(propertyId, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms", propertyId, "list"] });
    },
  });
}
