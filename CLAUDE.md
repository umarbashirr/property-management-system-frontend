# CLAUDE.md — Hotel Management SaaS Frontend

> This file is the single source of truth for Claude when working on the frontend codebase.
> Read this fully before writing any code, suggesting any changes, or answering any questions.

---

## 1. WHAT THIS IS

The **admin dashboard** for a multi-tenant Hotel Management SaaS platform. Hotel staff (front desk, managers, admins) use this to manage properties, rooms, reservations, guests, billing, and operations.

This is **Phase 1** — internal dashboard only. A guest-facing booking portal will be a separate app in Phase 2.

**Design doc:** `docs/plans/2026-03-09-frontend-design.md`

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Framework | React 19 + React Compiler + Vite |
| Language | TypeScript (strict mode) |
| UI Components | shadcn/ui + Tailwind CSS v4 |
| Routing | React Router v7 |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Icons | Lucide React |
| Package Manager | pnpm |

---

## 3. FOLDER STRUCTURE

```
/frontend/src
  /app                          ← App entry, providers, router
    App.tsx
    providers.tsx
    router.tsx
  /features                     ← One folder per domain feature
    /auth
    /dashboard
    /tenants
    /properties
  /components
    /layout                     ← Sidebar, Topbar, AppLayout
    /ui                         ← shadcn/ui (auto-generated, do not edit)
    /shared                     ← DataTable, PageHeader, ConfirmDialog, etc.
  /lib                          ← api-client, query-client, utils
  /stores                       ← Zustand stores
  /hooks                        ← Shared hooks
  /types                        ← Global types
```

---

## 4. FEATURE MODULE STRUCTURE (STRICT — FOLLOW ALWAYS)

Every feature follows this exact structure:

```
/features/<name>
  /api/<name>.api.ts            ← Raw Axios API call functions
  /hooks/use<Name>.ts           ← TanStack Query hooks wrapping API
  /components/                  ← Feature-specific components
  /pages/                       ← Route-level page components
  /types/                       ← Feature-specific types
```

### Rules:

- **Pages** only compose components and use hooks — no direct API calls
- **Hooks** wrap API functions with TanStack Query — the ONLY place useQuery/useMutation live
- **API files** contain raw Axios calls — no React, no hooks
- **Components** receive data via props or hooks — no direct Axios calls
- Feature modules are self-contained — import from `/lib`, `/components/shared`, `/stores`, `/types`, but NOT from other features

---

## 5. DATA FETCHING CONVENTIONS

### API client (`/lib/api-client.ts`)

- Axios instance with `baseURL` from `VITE_API_URL`
- Request interceptor: attach `Authorization: Bearer <token>`
- Response interceptor: 401 → call `/auth/refresh` → retry failed request

### API file pattern:

```typescript
// features/tenants/api/tenants.api.ts
import { apiClient } from '@/lib/api-client'
import type { CreateTenantDto, Tenant } from '../types'

export const tenantsApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<Tenant[]>>('/tenants', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<Tenant>>(`/tenants/${id}`),
  create: (data: CreateTenantDto) =>
    apiClient.post<ApiResponse<Tenant>>('/tenants', data),
  update: (id: string, data: Partial<CreateTenantDto>) =>
    apiClient.patch<ApiResponse<Tenant>>(`/tenants/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/tenants/${id}`),
}
```

### Hook file pattern:

```typescript
// features/tenants/hooks/useTenants.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantsApi } from '../api/tenants.api'

export const useTenants = (params?: PaginationParams) =>
  useQuery({
    queryKey: ['tenants', params],
    queryFn: () => tenantsApi.list(params),
  })

export const useCreateTenant = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: tenantsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })
}
```

### Query key convention:

`[feature, ...identifiers, params]`

Examples: `['tenants']`, `['tenants', id]`, `['properties', { page: 1 }]`

---

## 6. AUTHENTICATION

- **Access token**: stored in Zustand (in-memory). Lost on refresh — intentional.
- **Refresh token**: httpOnly cookie managed by backend.
- **On app load**: call `GET /auth/me` → if 200, store user + token → render app. If 401, redirect to `/login`.
- **Silent refresh**: Axios interceptor catches 401 → calls `/auth/refresh` → retries failed request. If refresh fails → clear state → redirect to `/login`.
- **`<ProtectedRoute>`**: wraps authenticated routes, checks auth state.
- **`<RoleGuard roles={[...]}>`**: conditionally renders by user role.

---

## 7. ROUTING

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

Layout nesting: `<ProtectedRoute>` → `<AppLayout>` (sidebar + topbar) → page content.

---

## 8. LAYOUT

- **Sidebar**: collapsible (250px / 64px), logo, property selector, nav groups, user menu at bottom
- **Topbar**: breadcrumbs, page title
- **Content**: max-width container, consistent padding, PageHeader + content

---

## 9. SHARED COMPONENTS

| Component | Location | Purpose |
|---|---|---|
| DataTable | `/components/shared` | TanStack Table + shadcn — pagination, sorting, filtering |
| PageHeader | `/components/shared` | Title + description + action buttons |
| ConfirmDialog | `/components/shared` | Destructive action confirmation |
| StatusBadge | `/components/shared` | Colored status indicators |
| EmptyState | `/components/shared` | Empty list placeholders |
| LoadingState | `/components/shared` | Skeleton loaders |
| ErrorBoundary | `/components/shared` | Render error fallback with retry |

---

## 10. ERROR HANDLING

- **API errors**: interceptor parses `{ success: false, error: { code, message } }` from backend
- **Toasts**: Sonner (via shadcn/ui) — success/error on mutations
- **Form errors**: Zod + React Hook Form — inline validation
- **Render errors**: ErrorBoundary with fallback UI
- **404**: catch-all route → NotFoundPage

---

## 11. CODING STYLE

- TypeScript strict mode — `"strict": true`
- No `any` — use `unknown` and narrow
- All async with `async/await` — no `.then()` chains
- Prefer `interface` over `type` for object shapes
- Use path alias `@/*` → `src/*`
- File names: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- Component names: `PascalCase`
- Hooks: `use<Name>` prefix
- No barrel exports in features (avoid circular imports) — import directly from files
- Co-locate tests next to source files: `Component.test.tsx`

---

## 12. WHAT NOT TO DO

- NEVER make API calls directly from page/component — always go through hooks
- NEVER use useQuery/useMutation outside of `/hooks` directories
- NEVER store access tokens in localStorage or sessionStorage
- NEVER import from one feature into another feature
- NEVER edit files in `/components/ui` — these are shadcn/ui generated
- NEVER use `any` type
- NEVER skip Zod validation on form submissions
- NEVER hardcode API URLs — use `VITE_API_URL` env variable
- NEVER commit `.env` files

---

## 13. ENVIRONMENT

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Hotel Management
```

---

## 14. BUILD & DEV SCRIPTS

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm lint             # ESLint
pnpm type-check       # tsc --noEmit
```

---

## 15. WHEN CLAUDE IS ASKED TO BUILD SOMETHING

1. **Always** read this file first
2. **Always** use context7 to fetch latest library docs
3. **Always** follow the feature module structure in Section 4
4. **Always** follow data fetching conventions in Section 5
5. **Always** follow industry best practices
6. **Always** use the shared components from Section 9 when applicable
7. **Ask** before introducing any new library not in the tech stack
8. **Ask** before changing any architectural pattern defined here
9. **Never** violate Section 12 rules
