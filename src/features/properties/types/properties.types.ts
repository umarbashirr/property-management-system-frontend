export interface Property {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  timezone: string | null;
  currency: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreatePropertyDto {
  name: string;
  slug: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  currency?: string;
}

export interface UpdatePropertyDto {
  name?: string;
  slug?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  currency?: string;
  isActive?: boolean;
}

export interface ListPropertiesQuery {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}
