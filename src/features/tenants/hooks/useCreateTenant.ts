import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createTenant } from "@/features/tenants/services/tenants.service";
import type { CreateTenantDto } from "@/features/tenants/types/tenants.types";

export function useCreateTenant() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: CreateTenantDto) => createTenant(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tenants", "list"] });
      navigate("/super-admin/tenants");
    },
  });
}
