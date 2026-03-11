import api from "@/lib/api";
import type { ApiResponse, LoginDto, UserContext } from "@/features/auth/types/auth.types";

export async function login(dto: LoginDto): Promise<void> {
  await api.post("/auth/login", dto);
}

export async function fetchCurrentUser(): Promise<UserContext> {
  const res = await api.get<ApiResponse<UserContext>>("/auth/me");
  return res.data.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
