import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePlan } from "@/features/plans/services/plans.service";

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans", "list"] });
    },
  });
}
