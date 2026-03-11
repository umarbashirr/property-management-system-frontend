import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const user = await fetchCurrentUser();
      // Sync into Zustand immediately after a successful fetch
      setUser(user);
      return user;
    },
    retry: false,
    // On 401 the interceptor calls clearUser() + redirects — no need to handle error here
  });
}
