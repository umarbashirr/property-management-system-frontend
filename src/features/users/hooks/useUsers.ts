import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/features/users/services/users.service";
import type { ListUsersQuery } from "@/features/users/types/users.types";

export function useUsers(filters: Partial<ListUsersQuery> = {}) {
  const query = { page: 1, limit: 20, ...filters };

  const stableKey = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined)
  );

  return useQuery({
    queryKey: ["users", "list", stableKey],
    queryFn: () => fetchUsers(query),
  });
}
