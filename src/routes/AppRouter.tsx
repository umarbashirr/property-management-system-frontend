import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { SuperAdminRoute } from "@/routes/SuperAdminRoute";
import { AppShell } from "@/components/layout/AppShell";
import { TenantsPage } from "@/features/tenants/pages/TenantsPage";
import { CreateTenantPage } from "@/features/tenants/pages/CreateTenantPage";
import { TenantDetailPage } from "@/features/tenants/pages/TenantDetailPage";

// Placeholder dashboard — replace when Dashboard module is built
function DashboardPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">Dashboard coming soon.</p>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — general */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Protected — super admin only */}
        <Route
          path="/super-admin/tenants"
          element={
            <SuperAdminRoute>
              <AppShell>
                <TenantsPage />
              </AppShell>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/super-admin/tenants/new"
          element={
            <SuperAdminRoute>
              <AppShell>
                <CreateTenantPage />
              </AppShell>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/super-admin/tenants/:id"
          element={
            <SuperAdminRoute>
              <AppShell>
                <TenantDetailPage />
              </AppShell>
            </SuperAdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
