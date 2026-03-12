import type { UserRole } from "@/features/auth/types/auth.types";

export interface StaffUser {
  readonly id: string;
  readonly tenantId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly lastLoginAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PropertyAssignment {
  readonly propertyId: string;
  readonly propertyName: string;
  readonly role: UserRole | null;
  readonly assignedAt: string;
}

export interface StaffWithProperties extends StaffUser {
  readonly propertyAssignments: readonly PropertyAssignment[];
}

export interface CreateUserDto {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: Exclude<UserRole, "super_admin">;
  readonly propertyAssignments?: readonly {
    readonly propertyId: string;
    readonly role?: UserRole;
  }[];
}

export interface UpdateUserDto {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly role?: Exclude<UserRole, "super_admin">;
  readonly isActive?: boolean;
}

export interface AssignPropertyDto {
  readonly propertyId: string;
  readonly role?: UserRole;
}

export interface ListUsersQuery {
  readonly page: number;
  readonly limit: number;
  readonly search?: string;
  readonly role?: UserRole;
  readonly propertyId?: string;
  readonly isActive?: boolean;
}
