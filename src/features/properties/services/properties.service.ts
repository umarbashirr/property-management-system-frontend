import api from "@/lib/api";
import type { ApiResponse, PaginatedApiResponse, PaginationMeta } from "@/features/auth/types/auth.types";
import type {
  CreatePropertyDto,
  ListPropertiesQuery,
  Property,
  UpdatePropertyDto,
} from "@/features/properties/types/properties.types";

export async function fetchProperties(
  query: Partial<ListPropertiesQuery>
): Promise<{ data: Property[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));

  const res = await api.get<PaginatedApiResponse<Property>>(`/properties?${params.toString()}`);
  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchProperty(id: string): Promise<Property> {
  const res = await api.get<ApiResponse<Property>>(`/properties/${id}`);
  return res.data.data;
}

export async function createProperty(dto: CreatePropertyDto): Promise<void> {
  await api.post("/properties", dto);
}

export async function updateProperty(id: string, dto: UpdatePropertyDto): Promise<Property> {
  const res = await api.patch<ApiResponse<Property>>(`/properties/${id}`, dto);
  return res.data.data;
}

export async function deleteProperty(id: string): Promise<void> {
  await api.delete(`/properties/${id}`);
}
