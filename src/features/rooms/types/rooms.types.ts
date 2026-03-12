import type { RoomType } from "@/features/roomTypes/types/roomTypes.types";

export type RoomStatus = "available" | "occupied" | "dirty" | "maintenance" | "out_of_order";

export interface Room {
  id: string;
  tenantId: string;
  propertyId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: string | null;
  status: RoomStatus;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roomType?: RoomType;
}

export interface CreateRoomDto {
  roomNumber: string;
  roomTypeId: string;
  floor?: string;
  status?: RoomStatus;
  notes?: string;
}

export interface UpdateRoomDto {
  roomNumber?: string;
  roomTypeId?: string;
  floor?: string;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateRoomStatusDto {
  status: RoomStatus;
}

export interface ListRoomsQuery {
  page: number;
  limit: number;
  search?: string;
  status?: RoomStatus;
  roomTypeId?: string;
  floor?: string;
  isActive?: boolean;
}
