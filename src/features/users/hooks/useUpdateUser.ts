import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/features/users/services/users.service";
import type { UpdateUserDto } from "@/features/users/types/users.types";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) =>
      updateUser(id, dto),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["users", id] }),
      ]);
    },
  });
}
