import { Navigate } from "react-router";
import { useIsFetching } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.user !== null);
  // True only while the initial ["auth", "me"] fetch is in flight (from SessionLoader)
  const isSessionLoading = useIsFetching({ queryKey: ["auth", "me"] }) > 0;

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
