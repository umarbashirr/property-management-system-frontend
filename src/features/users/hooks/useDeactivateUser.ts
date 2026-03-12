import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateUser } from "@/features/users/services/users.service";

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}
