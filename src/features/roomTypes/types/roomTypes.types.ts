export type BedType = "king" | "queen" | "twin" | "double" | "single" | "sofa_bed";

export interface RoomType {
  id: string;
  tenantId: string;
  propertyId: string;
  name: string;
  code: string;
  description: string | null;
  baseRate: string;
  maxOccupancy: number;
  extraPersonCharge: string | null;
  bedType: BedType;
  bedCount: number;
  areaInSqft: string | null;
  floorLevel: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roomTypeAmenities?: RoomTypeAmenity[];
  images?: RoomTypeImage[];
}

export interface RoomTypeAmenity {
  id: string;
  roomTypeId: string;
  amenityId: string;
  createdAt: string;
  amenity: {
    id: string;
    tenantId: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RoomTypeImage {
  id: string;
  tenantId: string;
  roomTypeId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomTypeDto {
  name: string;
  code: string;
  description?: string;
  baseRate: string;
  maxOccupancy?: number;
  extraPersonCharge?: string;
  bedType: BedType;
  bedCount?: number;
  areaInSqft?: string;
  floorLevel?: string;
}

export interface UpdateRoomTypeDto {
  name?: string;
  code?: string;
  description?: string;
  baseRate?: string;
  maxOccupancy?: number;
  extraPersonCharge?: string;
  bedType?: BedType;
  bedCount?: number;
  areaInSqft?: string;
  floorLevel?: string;
  isActive?: boolean;
}

export interface ListRoomTypesQuery {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  bedType?: BedType;
}
