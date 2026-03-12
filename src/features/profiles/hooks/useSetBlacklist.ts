import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setBlacklist } from "@/features/profiles/services/profiles.service";
import type { SetBlacklistDto } from "@/features/profiles/types/profiles.types";

export function useSetBlacklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: SetBlacklistDto }) =>
      setBlacklist(id, dto),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profiles", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["profiles", id] }),
      ]);
    },
  });
}
