import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createProperty } from "@/features/properties/services/properties.service";
import type { CreatePropertyDto } from "@/features/properties/types/properties.types";

interface CreatePropertyVariables {
  dto: CreatePropertyDto;
  tenantId?: string;
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ dto, tenantId }: CreatePropertyVariables) => createProperty(dto, tenantId),
    onSuccess: async (_, { tenantId }) => {
      await queryClient.invalidateQueries({ queryKey: ["properties", "list"] });
      navigate(tenantId ? `/properties?tenantId=${tenantId}` : "/properties");
    },
  });
}
