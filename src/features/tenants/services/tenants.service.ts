import api from "@/lib/api";
import type { ApiResponse, PaginatedApiResponse, PaginationMeta } from "@/features/auth/types/auth.types";
import type {
  CreateTenantDto,
  ListTenantUsersQuery,
  ListTenantsQuery,
  Tenant,
  TenantUser,
  UpdateTenantDto,
} from "@/features/tenants/types/tenants.types";

export async function fetchTenants(
  query: Partial<ListTenantsQuery>
): Promise<{ data: Tenant[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.status) params.set("status", query.status);
  if (query.search) params.set("search", query.search);

  const res = await api.get<PaginatedApiResponse<Tenant>>(`/tenants?${params.toString()}`);
  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchTenant(id: string): Promise<Tenant> {
  const res = await api.get<ApiResponse<Tenant>>(`/tenants/${id}`);
  return res.data.data;
}

export async function createTenant(dto: CreateTenantDto): Promise<void> {
  await api.post("/tenants", dto);
}

export async function updateTenant(id: string, dto: UpdateTenantDto): Promise<Tenant> {
  const res = await api.patch<ApiResponse<Tenant>>(`/tenants/${id}`, dto);
  return res.data.data;
}

export async function deleteTenant(id: string): Promise<void> {
  await api.delete(`/tenants/${id}`);
}

export async function fetchTenantUsers(
  tenantId: string,
  query: Partial<ListTenantUsersQuery>
): Promise<{ data: TenantUser[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.role) params.set("role", query.role);
  if (query.search) params.set("search", query.search);

  const res = await api.get<PaginatedApiResponse<TenantUser>>(
    `/tenants/${tenantId}/users?${params.toString()}`
  );
  return { data: res.data.data, meta: res.data.meta };
}
