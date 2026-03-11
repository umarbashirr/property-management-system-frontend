export type UserRole =
  | "super_admin"
  | "tenant_admin"
  | "property_manager"
  | "front_desk"
  | "housekeeping"
  | "accountant";

export interface PlanContext {
  name: string;
  features: string[];
  limits: Record<string, number>;
}

export interface UserContext {
  userId: string;
  tenantId: string;
  role: UserRole;
  plan: PlanContext;
}

export interface LoginDto {
  slug: string;
  email: string;
  password: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface PaginatedApiResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
