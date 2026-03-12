import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createUser } from "@/features/users/services/users.service";
import type { CreateUserDto } from "@/features/users/types/users.types";

export function useCreateUser() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: CreateUserDto) => createUser(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      navigate("/users");
    },
  });
}
