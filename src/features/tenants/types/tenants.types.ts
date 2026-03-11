export type TenantStatus = "active" | "suspended" | "cancelled";

export type TenantUserRole =
  | "tenant_admin"
  | "property_manager"
  | "front_desk"
  | "housekeeping"
  | "accountant";

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  maxProperties: number;
  maxRoomsPerProperty: number;
  maxUsers: number;
  maxWorkflows: number;
  features: string[];
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  planId: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  plan: Plan;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: TenantUserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  tenant: {
    name: string;
    slug: string;
    planId: string;
  };
  admin: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  };
}

export interface UpdateTenantDto {
  name?: string;
  slug?: string;
  planId?: string;
  status?: TenantStatus;
}

export interface ListTenantsQuery {
  page: number;
  limit: number;
  status?: TenantStatus;
  search?: string;
}

export interface ListTenantUsersQuery {
  page: number;
  limit: number;
  role?: TenantUserRole;
  search?: string;
}
