import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { login, fetchCurrentUser } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { LoginDto } from "@/features/auth/types/auth.types";

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: LoginDto) => login(dto),
    onSuccess: async () => {
      // Fetch user context after cookies are set
      const user = await fetchCurrentUser();
      setUser(user);
      // Seed the query cache so useCurrentUser doesn't refetch immediately
      queryClient.setQueryData(["auth", "me"], user);
      navigate("/dashboard");
    },
  });
}
