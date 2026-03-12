import api from "@/lib/api";
import type { ApiResponse, PaginatedApiResponse, PaginationMeta } from "@/features/auth/types/auth.types";
import type {
  CreateRoomTypeDto,
  ListRoomTypesQuery,
  RoomType,
  UpdateRoomTypeDto,
} from "@/features/roomTypes/types/roomTypes.types";

export async function fetchRoomTypes(
  propertyId: string,
  query: Partial<ListRoomTypesQuery>
): Promise<{ data: RoomType[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));
  if (query.bedType) params.set("bedType", query.bedType);

  const res = await api.get<PaginatedApiResponse<RoomType>>(
    `/properties/${propertyId}/room-types?${params.toString()}`
  );
  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchRoomType(propertyId: string, id: string): Promise<RoomType> {
  const res = await api.get<ApiResponse<RoomType>>(
    `/properties/${propertyId}/room-types/${id}`
  );
  return res.data.data;
}

export async function createRoomType(propertyId: string, dto: CreateRoomTypeDto): Promise<void> {
  await api.post(`/properties/${propertyId}/room-types`, dto);
}

export async function updateRoomType(
  propertyId: string,
  id: string,
  dto: UpdateRoomTypeDto
): Promise<RoomType> {
  const res = await api.patch<ApiResponse<RoomType>>(
    `/properties/${propertyId}/room-types/${id}`,
    dto
  );
  return res.data.data;
}

export async function deleteRoomType(propertyId: string, id: string): Promise<void> {
  await api.delete(`/properties/${propertyId}/room-types/${id}`);
}
