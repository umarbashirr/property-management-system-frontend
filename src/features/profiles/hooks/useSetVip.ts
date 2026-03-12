import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setVip } from "@/features/profiles/services/profiles.service";
import type { SetVipDto } from "@/features/profiles/types/profiles.types";

export function useSetVip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: SetVipDto }) =>
      setVip(id, dto),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profiles", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["profiles", id] }),
      ]);
    },
  });
}
