import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProperty } from "@/features/properties/services/properties.service";

interface DeletePropertyVariables {
  id: string;
  tenantId?: string;
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeletePropertyVariables>({
    mutationFn: ({ id, tenantId }) => deleteProperty(id, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", "list"] });
    },
  });
}
