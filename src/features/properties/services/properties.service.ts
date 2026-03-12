import api from "@/lib/api";
import type { ApiResponse, PaginatedApiResponse, PaginationMeta } from "@/features/auth/types/auth.types";
import type {
  CreatePropertyDto,
  ListPropertiesQuery,
  Property,
  UpdatePropertyDto,
} from "@/features/properties/types/properties.types";

function tenantQuery(tenantId?: string): string {
  return tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
}

export async function fetchProperties(
  query: Partial<ListPropertiesQuery>
): Promise<{ data: Property[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));
  if (query.tenantId) params.set("tenantId", query.tenantId);

  const res = await api.get<PaginatedApiResponse<Property>>(`/properties?${params.toString()}`);
  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchProperty(id: string, tenantId?: string): Promise<Property> {
  const res = await api.get<ApiResponse<Property>>(`/properties/${id}${tenantQuery(tenantId)}`);
  return res.data.data;
}

export async function createProperty(dto: CreatePropertyDto, tenantId?: string): Promise<void> {
  await api.post(`/properties${tenantQuery(tenantId)}`, dto);
}

export async function updateProperty(id: string, dto: UpdatePropertyDto, tenantId?: string): Promise<Property> {
  const res = await api.patch<ApiResponse<Property>>(`/properties/${id}${tenantQuery(tenantId)}`, dto);
  return res.data.data;
}

export async function deleteProperty(id: string, tenantId?: string): Promise<void> {
  await api.delete(`/properties/${id}${tenantQuery(tenantId)}`);
}
