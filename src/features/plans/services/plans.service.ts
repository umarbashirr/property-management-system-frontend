import api from "@/lib/api";
import type { ApiResponse, PaginatedApiResponse, PaginationMeta } from "@/features/auth/types/auth.types";
import type {
  CreatePlanDto,
  ListPlansQuery,
  Plan,
  UpdatePlanDto,
} from "@/features/plans/types/plans.types";

export async function fetchPlans(
  query: Partial<ListPlansQuery>
): Promise<{ data: Plan[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));

  const res = await api.get<PaginatedApiResponse<Plan>>(`/plans?${params.toString()}`);
  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchPlan(id: string): Promise<Plan> {
  const res = await api.get<ApiResponse<Plan>>(`/plans/${id}`);
  return res.data.data;
}

export async function createPlan(dto: CreatePlanDto): Promise<Plan> {
  const res = await api.post<ApiResponse<Plan>>("/plans", dto);
  return res.data.data;
}

export async function updatePlan(id: string, dto: UpdatePlanDto): Promise<Plan> {
  const res = await api.patch<ApiResponse<Plan>>(`/plans/${id}`, dto);
  return res.data.data;
}

export async function deletePlan(id: string): Promise<void> {
  await api.delete(`/plans/${id}`);
}
