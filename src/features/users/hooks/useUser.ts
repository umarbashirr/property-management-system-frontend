import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "@/features/users/services/users.service";

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}
