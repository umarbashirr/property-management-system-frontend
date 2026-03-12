import api from "@/lib/api";
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationMeta,
} from "@/features/auth/types/auth.types";
import type {
  CreateProfileDto,
  CreateProfileResult,
  ListProfilesQuery,
  Profile,
  SetBlacklistDto,
  SetVipDto,
  UpdateProfileDto,
} from "@/features/profiles/types/profiles.types";

export async function fetchProfiles(
  query: Partial<ListProfilesQuery>,
): Promise<{ data: Profile[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.type) params.set("type", query.type);
  if (query.source) params.set("source", query.source);
  if (query.propertyId) params.set("propertyId", query.propertyId);
  if (query.isVip !== undefined) params.set("isVip", String(query.isVip));
  if (query.isBlacklisted !== undefined)
    params.set("isBlacklisted", String(query.isBlacklisted));

  const res = await api.get<PaginatedApiResponse<Profile>>(
    `/profiles?${params.toString()}`,
  );
  return { data: res.data.data, meta: res.data.meta };
}

export async function fetchProfile(id: string): Promise<Profile> {
  const res = await api.get<ApiResponse<Profile>>(`/profiles/${id}`);
  return res.data.data;
}

export async function createProfile(
  dto: CreateProfileDto,
): Promise<CreateProfileResult> {
  const res = await api.post<ApiResponse<CreateProfileResult>>(
    "/profiles",
    dto,
  );
  return res.data.data;
}

export async function updateProfile(
  id: string,
  dto: UpdateProfileDto,
): Promise<Profile> {
  const res = await api.patch<ApiResponse<Profile>>(`/profiles/${id}`, dto);
  return res.data.data;
}

export async function deleteProfile(id: string): Promise<void> {
  await api.delete(`/profiles/${id}`);
}

export async function setBlacklist(
  id: string,
  dto: SetBlacklistDto,
): Promise<Profile> {
  const res = await api.patch<ApiResponse<Profile>>(
    `/profiles/${id}/blacklist`,
    dto,
  );
  return res.data.data;
}

export async function setVip(id: string, dto: SetVipDto): Promise<Profile> {
  const res = await api.patch<ApiResponse<Profile>>(
    `/profiles/${id}/vip`,
    dto,
  );
  return res.data.data;
}
