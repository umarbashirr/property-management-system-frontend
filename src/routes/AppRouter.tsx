import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { SuperAdminRoute } from "@/routes/SuperAdminRoute";
import { AppShell } from "@/components/layout/AppShell";
import { TenantsPage } from "@/features/tenants/pages/TenantsPage";
import { CreateTenantPage } from "@/features/tenants/pages/CreateTenantPage";
import { TenantDetailPage } from "@/features/tenants/pages/TenantDetailPage";
import { PlansPage } from "@/features/plans/pages/PlansPage";
import { CreatePlanPage } from "@/features/plans/pages/CreatePlanPage";
import { PlanDetailPage } from "@/features/plans/pages/PlanDetailPage";
import { PropertiesPage } from "@/features/properties/pages/PropertiesPage";
import { CreatePropertyPage } from "@/features/properties/pages/CreatePropertyPage";
import { PropertyDetailPage } from "@/features/properties/pages/PropertyDetailPage";
import { RoomTypesPage } from "@/features/roomTypes/pages/RoomTypesPage";
import { CreateRoomTypePage } from "@/features/roomTypes/pages/CreateRoomTypePage";
import { RoomTypeDetailPage } from "@/features/roomTypes/pages/RoomTypeDetailPage";
import { RoomsPage } from "@/features/rooms/pages/RoomsPage";
import { CreateRoomPage } from "@/features/rooms/pages/CreateRoomPage";
import { RoomDetailPage } from "@/features/rooms/pages/RoomDetailPage";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { CreateUserPage } from "@/features/users/pages/CreateUserPage";
import { UserDetailPage } from "@/features/users/pages/UserDetailPage";
import { ProfilesPage } from "@/features/profiles/pages/ProfilesPage";
import { CreateProfilePage } from "@/features/profiles/pages/CreateProfilePage";
import { ProfileDetailPage } from "@/features/profiles/pages/ProfileDetailPage";

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

        {/* Protected — properties (tenant_admin + super_admin) */}
        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <AppShell>
                <PropertiesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/new"
          element={
            <ProtectedRoute>
              <AppShell>
                <CreatePropertyPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <PropertyDetailPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Protected — room types (property-scoped) */}
        <Route
          path="/properties/:propertyId/room-types"
          element={
            <ProtectedRoute>
              <AppShell>
                <RoomTypesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:propertyId/room-types/new"
          element={
            <ProtectedRoute>
              <AppShell>
                <CreateRoomTypePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:propertyId/room-types/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <RoomTypeDetailPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Protected — rooms (property-scoped) */}
        <Route
          path="/properties/:propertyId/rooms"
          element={
            <ProtectedRoute>
              <AppShell>
                <RoomsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:propertyId/rooms/new"
          element={
            <ProtectedRoute>
              <AppShell>
                <CreateRoomPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:propertyId/rooms/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <RoomDetailPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Protected — profiles/guests (tenant-scoped) */}
        <Route
          path="/profiles"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProfilesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profiles/new"
          element={
            <ProtectedRoute>
              <AppShell>
                <CreateProfilePage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profiles/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProfileDetailPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Protected — staff/team management (tenant_admin + super_admin) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AppShell>
                <UsersPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <ProtectedRoute>
              <AppShell>
                <CreateUserPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <UserDetailPage />
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

        {/* Protected — super admin only: plans */}
        <Route
          path="/super-admin/plans"
          element={
            <SuperAdminRoute>
              <AppShell>
                <PlansPage />
              </AppShell>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/super-admin/plans/new"
          element={
            <SuperAdminRoute>
              <AppShell>
                <CreatePlanPage />
              </AppShell>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/super-admin/plans/:id"
          element={
            <SuperAdminRoute>
              <AppShell>
                <PlanDetailPage />
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
