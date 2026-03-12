import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProperty } from "@/features/properties/services/properties.service";

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", "list"] });
    },
  });
}
