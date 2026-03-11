import { create } from "zustand";
import type { UserContext } from "@/features/auth/types/auth.types";

interface AuthState {
  user: UserContext | null;
  setUser: (user: UserContext) => void;
  clearUser: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),

  isAuthenticated: () => get().user !== null,
}));
