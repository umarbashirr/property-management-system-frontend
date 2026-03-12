import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createRoom } from "@/features/rooms/services/rooms.service";
import type { CreateRoomDto } from "@/features/rooms/types/rooms.types";

export function useCreateRoom(propertyId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: CreateRoomDto) => createRoom(propertyId, dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms", propertyId, "list"] });
      navigate(`/properties/${propertyId}/rooms`);
    },
  });
}
