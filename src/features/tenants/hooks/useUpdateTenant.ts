import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTenant } from "@/features/tenants/services/tenants.service";
import type { Tenant, UpdateTenantDto } from "@/features/tenants/types/tenants.types";

interface UpdateTenantVariables {
  id: string;
  dto: UpdateTenantDto;
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation<Tenant, Error, UpdateTenantVariables>({
    mutationFn: ({ id, dto }) => updateTenant(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["tenants", "list"] });
      queryClient.invalidateQueries({ queryKey: ["tenants", "detail", id] });
    },
  });
}
