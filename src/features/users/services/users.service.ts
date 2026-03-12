import api from "@/lib/api";
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationMeta,
} from "@/features/auth/types/auth.types";
import type {
  AssignPropertyDto,
  CreateUserDto,
  ListUsersQuery,
  PropertyAssignment,
  StaffUser,
  StaffWithProperties,
  UpdateUserDto,
} from "@/features/users/types/users.types";

export async function fetchUsers(
  query: Partial<ListUsersQuery>
): Promise<{ data: StaffUser[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.role) params.set("role", query.role);
  if (query.propertyId) params.set("propertyId", query.propertyId);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));

  const res = await api.get<PaginatedApiResponse<StaffUser>>(
    `/users?${params.toString()}`
  );
  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchUser(id: string): Promise<StaffWithProperties> {
  const res = await api.get<ApiResponse<StaffWithProperties>>(`/users/${id}`);
  return res.data.data;
}

export async function createUser(dto: CreateUserDto): Promise<void> {
  await api.post("/users", dto);
}

export async function updateUser(
  id: string,
  dto: UpdateUserDto
): Promise<StaffUser> {
  const res = await api.patch<ApiResponse<StaffUser>>(`/users/${id}`, dto);
  return res.data.data;
}

export async function deactivateUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function assignProperty(
  userId: string,
  dto: AssignPropertyDto
): Promise<PropertyAssignment[]> {
  const res = await api.post<ApiResponse<PropertyAssignment[]>>(
    `/users/${userId}/properties`,
    dto
  );
  return res.data.data;
}

export async function removePropertyAssignment(
  userId: string,
  propertyId: string
): Promise<PropertyAssignment[]> {
  const res = await api.delete<ApiResponse<PropertyAssignment[]>>(
    `/users/${userId}/properties/${propertyId}`
  );
  return res.data.data;
}
