import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/features/profiles/services/profiles.service";

export function useProfile(id: string) {
  return useQuery({
    queryKey: ["profiles", id],
    queryFn: () => fetchProfile(id),
    enabled: !!id,
  });
}
