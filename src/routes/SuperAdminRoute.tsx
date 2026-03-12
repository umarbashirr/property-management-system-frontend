import { Navigate } from "react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const user = useAuthStore((s) => s.user);
  const { isPending } = useCurrentUser();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "super_admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
