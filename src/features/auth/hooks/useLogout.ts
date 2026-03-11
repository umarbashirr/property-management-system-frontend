import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function useLogout() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearUser();
      queryClient.clear();
      navigate("/login");
    },
  });
}
