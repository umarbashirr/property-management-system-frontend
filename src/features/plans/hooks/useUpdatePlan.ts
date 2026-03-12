import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePlan } from "@/features/plans/services/plans.service";
import type { Plan, UpdatePlanDto } from "@/features/plans/types/plans.types";

interface UpdatePlanVariables {
  id: string;
  dto: UpdatePlanDto;
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation<Plan, Error, UpdatePlanVariables>({
    mutationFn: ({ id, dto }) => updatePlan(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["plans", "list"] });
      queryClient.invalidateQueries({ queryKey: ["plans", "detail", id] });
    },
  });
}
