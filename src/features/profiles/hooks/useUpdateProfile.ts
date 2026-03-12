import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/features/profiles/services/profiles.service";
import type { UpdateProfileDto } from "@/features/profiles/types/profiles.types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProfileDto }) =>
      updateProfile(id, dto),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profiles", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["profiles", id] }),
      ]);
    },
  });
}
