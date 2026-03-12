import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProfile } from "@/features/profiles/services/profiles.service";

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profiles", "list"] });
    },
  });
}
