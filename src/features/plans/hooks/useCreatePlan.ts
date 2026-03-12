import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createPlan } from "@/features/plans/services/plans.service";
import type { CreatePlanDto } from "@/features/plans/types/plans.types";

export function useCreatePlan() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: CreatePlanDto) => createPlan(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["plans", "list"] });
      navigate("/super-admin/plans");
    },
  });
}
