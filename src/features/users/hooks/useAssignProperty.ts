import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignProperty } from "@/features/users/services/users.service";
import type { AssignPropertyDto } from "@/features/users/types/users.types";

export function useAssignProperty(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AssignPropertyDto) => assignProperty(userId, dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });
}
