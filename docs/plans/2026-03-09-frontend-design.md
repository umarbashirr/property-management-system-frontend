# Frontend Design — Hotel Management SaaS Admin Dashboard

> Date: 2026-03-09
> Status: Approved
> Scope: Admin dashboard (Phase 1). Guest-facing portal deferred to Phase 2.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + React Compiler + Vite |
| Language | TypeScript (strict) |
| UI Components | shadcn/ui + Tailwind CSS v4 |
| Routing | React Router v7 |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (interceptors for token refresh) |
| Icons | Lucide React |
| Package Manager | pnpm |

**Repository:** https://github.com/umarbashirr/property-management-system-frontend.git

---

## 2. Folder Structure

```
/frontend
  /public
  /src
    /app                        ← App entry, providers, router config
      App.tsx
      providers.tsx             ← QueryClient, Zustand, ThemeProvider
      router.tsx                ← Route definitions
    /features
      /auth
        /components             ← LoginForm, etc.
        /hooks                  ← useLogin, useRefresh, useLogout
        /pages                  ← LoginPage
        /api                    ← auth API call functions
        /types                  ← auth-specific types
      /dashboard
        /components
        /pages                  ← DashboardPage (home)
      /tenants
        /components             ← TenantForm, TenantTable, columns
        /hooks                  ← useTenants, useCreateTenant, etc.
        /pages                  ← TenantsListPage, TenantDetailPage
        /api                    ← tenant API call functions
        /types
      /properties
        /components
        /hooks
        /pages
        /api
        /types
    /components                 ← Shared UI components
      /layout
        Sidebar.tsx
        Topbar.tsx
        AppLayout.tsx
        PropertySelector.tsx
      /ui                       ← shadcn/ui components (auto-generated)
      /shared                   ← DataTable, ConfirmDialog, PageHeader, etc.
    /lib
      api-client.ts             ← Axios instance + interceptors
      query-client.ts           ← TanStack Query config
      utils.ts                  ← cn() helper, formatters
    /stores
      auth.store.ts             ← access token, user info, current tenant
      ui.store.ts               ← sidebar state, theme
    /hooks                      ← Shared hooks (useDebounce, useMediaQuery)
    /types                      ← Global types (API response, pagination, user roles)
    index.css
    main.tsx
  tailwind.config.ts
  vite.config.ts
  tsconfig.json
  CLAUDE.md
```

### Feature module convention

Every feature follows this structure:

```
/features/<name>
  /api          ← raw API call functions (axios calls)
  /hooks        ← TanStack Query hooks wrapping API functions
  /components   ← feature-specific React components
  /pages        ← route-level page components
  /types        ← feature-specific TypeScript types
```

---

## 3. Authentication Flow

### Token strategy

- **Access token**: stored in Zustand (in-memory only). Lost on page refresh — by design.
- **Refresh token**: httpOnly signed cookie, managed entirely by the backend. Sent automatically on every request.

### App load sequence

1. App mounts → call `GET /auth/me` (refresh cookie sent automatically)
2. If 200 → store user data + access token in Zustand → render app
3. If 401 / error → redirect to `/login`

### Token refresh (silent)

- Axios response interceptor catches 401 errors
- Calls `POST /auth/refresh` to get a new access token
- Queues any concurrent requests that failed with 401
- On refresh success → retries all queued requests with new token
- On refresh failure → clears auth state → redirects to `/login`

### Auth guard components

- `<ProtectedRoute>` — wraps all authenticated routes, checks auth state, shows loading spinner while `/auth/me` resolves
- `<RoleGuard roles={[...]}>` — conditionally renders children based on user role. Used for both route protection and UI element visibility.

---

## 4. Routing

### Route map

```
/login                    → LoginPage           (public)

/                         → DashboardPage       (protected)
/tenants                  → TenantsListPage      (SUPER_ADMIN)
/tenants/new              → CreateTenantPage     (SUPER_ADMIN)
/tenants/:id              → TenantDetailPage     (SUPER_ADMIN)
/properties               → PropertiesListPage   (protected)
/properties/new           → CreatePropertyPage   (protected)
/properties/:id           → PropertyDetailPage   (protected)
```

### Layout nesting

```tsx
<BrowserRouter>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute />}>
    <Route element={<AppLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="tenants/*" element={...} />
      <Route path="properties/*" element={...} />
    </Route>
  </Route>
  <Route path="*" element={<NotFoundPage />} />
</BrowserRouter>
```

---

## 5. Layout Design

### Sidebar (collapsible: 250px expanded / 64px collapsed)

- Logo/brand at top
- Property Selector dropdown (for multi-property users)
- Navigation groups:
  - **Main**: Dashboard
  - **Management**: Properties, Tenants (SUPER_ADMIN only)
  - *(Future: Rooms, Reservations, Guests)*
  - *(Future: Operations: Housekeeping)*
  - *(Future: Finance: Folios, Payments, Reports)*
- User avatar + name at bottom → dropdown: Profile, Logout

### Topbar

- Breadcrumbs (auto-generated from route)
- Page title
- User menu (accessible when sidebar collapsed)

### Content area

- Max-width container with consistent padding
- PageHeader component (title + description + action buttons)
- Content below

---

## 6. Data Fetching Patterns

### API client (`lib/api-client.ts`)

- Axios instance with `baseURL` from `VITE_API_URL`
- Request interceptor: attach `Authorization: Bearer <token>` from Zustand
- Response interceptor: handle 401 → silent refresh → retry

### Per-feature pattern

```
/features/tenants/api/tenants.api.ts       ← raw API functions
/features/tenants/hooks/useTenants.ts      ← TanStack Query wrappers
```

**API file:**
```typescript
export const tenantsApi = {
  list: (params) => apiClient.get('/tenants', { params }),
  getById: (id) => apiClient.get(`/tenants/${id}`),
  create: (data) => apiClient.post('/tenants', data),
  update: (id, data) => apiClient.patch(`/tenants/${id}`, data),
  delete: (id) => apiClient.delete(`/tenants/${id}`),
}
```

**Hook file:**
```typescript
export const useTenants = (params) =>
  useQuery({
    queryKey: ['tenants', params],
    queryFn: () => tenantsApi.list(params),
  })

export const useCreateTenant = () =>
  useMutation({
    mutationFn: tenantsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  })
```

### Query key convention

`[feature, ...identifiers, params]` — e.g. `['tenants']`, `['tenants', id]`, `['properties', { page: 1 }]`

---

## 7. Shared Components

| Component | Purpose |
|---|---|
| `DataTable` | Reusable table on TanStack Table + shadcn — pagination, sorting, filtering |
| `PageHeader` | Title + description + action buttons (consistent across all pages) |
| `ConfirmDialog` | Confirmation dialog for destructive actions |
| `FormField` | Wrapper around React Hook Form + shadcn form components |
| `StatusBadge` | Colored badge for entity statuses |
| `EmptyState` | Placeholder for empty lists |
| `LoadingState` | Skeleton loaders |
| `ErrorBoundary` | Catch React errors, show fallback UI with retry |

---

## 8. Error Handling

| Layer | Strategy |
|---|---|
| API errors | Axios interceptor parses `{ success: false, error: { code, message } }` into consistent shape |
| Toast notifications | shadcn/ui Sonner — success/error toasts on mutations |
| Form validation | Zod + React Hook Form — inline field errors |
| Render errors | ErrorBoundary — fallback UI with retry |
| 404 | Catch-all route → NotFoundPage |

---

## 9. Initial Scope (Phase 1)

### Pages to build

1. **Login page** — email + password form, error handling
2. **Dashboard page** — welcome message, placeholder stats cards
3. **Tenants list** — data table with pagination, search (SUPER_ADMIN only)
4. **Tenant detail / create / edit** — form with validation
5. **Properties list** — data table with pagination, search (tenant-scoped)
6. **Property detail / create / edit** — form with validation

### Not in scope (future phases)

- Guest-facing booking portal
- Rooms / Room Types pages
- Reservations, Guests, Folios, Payments
- Housekeeping, Reports, Branding
- Dark mode (layout supports it, just not themed yet)
- Notifications system
- i18n / localization

---

## 10. Environment Variables

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Hotel Management
```
