import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

interface SessionLoaderProps {
  children: React.ReactNode;
}

/**
 * Rehydrates auth session on app load by calling GET /auth/me once.
 * Must be rendered inside QueryClientProvider.
 * Renders children immediately — ProtectedRoute handles the loading/redirect logic.
 */
export function SessionLoader({ children }: SessionLoaderProps) {
  useCurrentUser();
  return <>{children}</>;
}
