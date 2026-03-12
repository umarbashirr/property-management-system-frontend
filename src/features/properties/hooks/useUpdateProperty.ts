import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProperty } from "@/features/properties/services/properties.service";
import type { Property, UpdatePropertyDto } from "@/features/properties/types/properties.types";

interface UpdatePropertyVariables {
  id: string;
  dto: UpdatePropertyDto;
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation<Property, Error, UpdatePropertyVariables>({
    mutationFn: ({ id, dto }) => updateProperty(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["properties", "list"] });
      queryClient.invalidateQueries({ queryKey: ["properties", "detail", id] });
    },
  });
}
