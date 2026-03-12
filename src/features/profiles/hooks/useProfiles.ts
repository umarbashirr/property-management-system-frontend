import { useQuery } from "@tanstack/react-query";
import { fetchProfiles } from "@/features/profiles/services/profiles.service";
import type { ListProfilesQuery } from "@/features/profiles/types/profiles.types";

export function useProfiles(filters: Partial<ListProfilesQuery> = {}) {
  const query = { page: 1, limit: 20, ...filters };

  const stableKey = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined),
  );

  return useQuery({
    queryKey: ["profiles", "list", stableKey],
    queryFn: () => fetchProfiles(query),
  });
}
