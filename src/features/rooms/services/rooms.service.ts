import api from "@/lib/api";
import type { ApiResponse, PaginatedApiResponse, PaginationMeta } from "@/features/auth/types/auth.types";
import type {
  CreateRoomDto,
  ListRoomsQuery,
  Room,
  UpdateRoomDto,
  UpdateRoomStatusDto,
} from "@/features/rooms/types/rooms.types";

export async function fetchRooms(
  propertyId: string,
  query: Partial<ListRoomsQuery>
): Promise<{ data: Room[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.roomTypeId) params.set("roomTypeId", query.roomTypeId);
  if (query.floor) params.set("floor", query.floor);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));

  const res = await api.get<PaginatedApiResponse<Room>>(
    `/properties/${propertyId}/rooms?${params.toString()}`
  );
  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchRoom(propertyId: string, id: string): Promise<Room> {
  const res = await api.get<ApiResponse<Room>>(
    `/properties/${propertyId}/rooms/${id}`
  );
  return res.data.data;
}

export async function createRoom(propertyId: string, dto: CreateRoomDto): Promise<void> {
  await api.post(`/properties/${propertyId}/rooms`, dto);
}

export async function updateRoom(
  propertyId: string,
  id: string,
  dto: UpdateRoomDto
): Promise<Room> {
  const res = await api.patch<ApiResponse<Room>>(
    `/properties/${propertyId}/rooms/${id}`,
    dto
  );
  return res.data.data;
}

export async function updateRoomStatus(
  propertyId: string,
  id: string,
  dto: UpdateRoomStatusDto
): Promise<Room> {
  const res = await api.patch<ApiResponse<Room>>(
    `/properties/${propertyId}/rooms/${id}/status`,
    dto
  );
  return res.data.data;
}

export async function deleteRoom(propertyId: string, id: string): Promise<void> {
  await api.delete(`/properties/${propertyId}/rooms/${id}`);
}
