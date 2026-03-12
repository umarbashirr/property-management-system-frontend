import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removePropertyAssignment } from "@/features/users/services/users.service";

export function useRemovePropertyAssignment(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) =>
      removePropertyAssignment(userId, propertyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });
}
