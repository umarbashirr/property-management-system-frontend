import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createRoomType } from "@/features/roomTypes/services/roomTypes.service";
import type { CreateRoomTypeDto } from "@/features/roomTypes/types/roomTypes.types";

export function useCreateRoomType(propertyId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: CreateRoomTypeDto) => createRoomType(propertyId, dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roomTypes", propertyId, "list"] });
      navigate(`/properties/${propertyId}/room-types`);
    },
  });
}
