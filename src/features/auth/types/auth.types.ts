export type UserRole =
  | "SUPER_ADMIN"
  | "TENANT_ADMIN"
  | "PROPERTY_MANAGER"
  | "FRONT_DESK"
  | "HOUSEKEEPING"
  | "ACCOUNTANT";

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

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
