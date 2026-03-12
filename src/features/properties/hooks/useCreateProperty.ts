import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createProperty } from "@/features/properties/services/properties.service";
import type { CreatePropertyDto } from "@/features/properties/types/properties.types";

export function useCreateProperty() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: CreatePropertyDto) => createProperty(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["properties", "list"] });
      navigate("/properties");
    },
  });
}
