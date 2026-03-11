# CLAUDE.md — Hotel Management SaaS Frontend

> Single source of truth for Claude/Cursor when working on this frontend.
> Read fully before writing any code or suggesting changes.

---

## 1. WHAT WE ARE BUILDING

A **multi-tenant Hotel Management SaaS frontend** — the web client for hotel staff (tenant admins, property managers, front desk, housekeeping, etc.).

Users log in with a **tenant slug + email + password**. Auth is cookie-based (httpOnly, no tokens in JS). The app is a protected SPA — all meaningful routes require authentication.

---

## 2. TECH STACK

| Layer             | Technology                                         |
| ----------------- | -------------------------------------------------- |
| Build Tool        | Vite 7                                             |
| Language          | TypeScript 5 (strict mode)                         |
| Framework         | React 19                                           |
| Routing           | React Router v7                                    |
| Server State      | TanStack Query v5                                  |
| Client State      | Zustand v5                                         |
| HTTP Client       | Axios (withCredentials: true for cookie auth)      |
| UI Components     | shadcn/ui (via `shadcn` package + Base UI)         |
| Styling           | Tailwind CSS v4                                    |
| Icons             | @tabler/icons-react                                |
| Forms             | React Hook Form + Zod (mirrors backend validation) |
| Font              | Figtree Variable (@fontsource-variable/figtree)    |
| Testing           | Vitest + React Testing Library                     |

---

## 3. PROJECT FOLDER STRUCTURE

```
/frontend/src
  /features             ← one folder per domain feature (mirrors backend modules)
    /auth               ← login, logout, session, /me
      /components       ← UI components specific to this feature
      /hooks            ← TanStack Query hooks (useLogin, useCurrentUser, etc.)
      /pages            ← page-level components (LoginPage, etc.)
      /services         ← raw axios API call functions
      /store            ← Zustand store slice for this feature
      /types            ← TypeScript interfaces for this feature
  /components           ← shared UI components (not feature-specific)
    /ui                 ← shadcn primitives (auto-generated, do not hand-edit)
    /layout             ← AppShell, Sidebar, Header, etc.
  /lib
    api.ts              ← axios instance (baseURL, credentials, interceptors)
    queryClient.ts      ← TanStack QueryClient singleton
    utils.ts            ← cn() utility (already exists)
  /routes
    AppRouter.tsx       ← all route definitions
    ProtectedRoute.tsx  ← redirects to /login if not authenticated
  /providers
    AppProviders.tsx    ← QueryClientProvider + RouterProvider composition root
  /hooks                ← global shared hooks (useMediaQuery, useDebounce, etc.)
  /types                ← global shared types
  App.tsx               ← renders AppRouter
  main.tsx              ← renders App inside AppProviders
  index.css             ← Tailwind + theme tokens (do not modify)
```

---

## 4. FEATURE MODULE STRUCTURE (STRICT — FOLLOW ALWAYS)

Every feature follows this exact structure:

```
/features/reservations
  /components
    ReservationTable.tsx
    ReservationForm.tsx
  /hooks
    useReservations.ts      ← useQuery for list
    useReservation.ts       ← useQuery for single
    useCreateReservation.ts ← useMutation for create
    useUpdateReservation.ts ← useMutation for update
  /pages
    ReservationsPage.tsx
    ReservationDetailPage.tsx
  /services
    reservations.service.ts ← all axios calls for this feature
  /store
    reservations.store.ts   ← only if feature needs local client state
  /types
    reservations.types.ts   ← interfaces, DTOs, enums
```

### Rules:

- **Pages** compose hooks + components — no direct axios calls
- **Hooks** call services — never call axios directly in components
- **Services** are pure async functions returning typed data — no React
- **Stores** hold only client UI state — server state lives in TanStack Query cache
- **Types** mirror backend types — keep them in sync manually

---

## 5. API CLIENT

### `src/lib/api.ts` — the ONLY place axios is configured

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // e.g. http://localhost:3000/api/v1
  withCredentials: true,                   // REQUIRED — sends httpOnly cookies
  headers: { 'Content-Type': 'application/json' },
})
```

### Response interceptor (token refresh):

```
Response 401 received
  → POST /auth/refresh (silent, no redirect)
  → If refresh succeeds: retry original request
  → If refresh fails (401): clearUser() in Zustand + redirect to /login
```

### Service functions return typed data (never raw AxiosResponse):

```typescript
// auth.service.ts
export async function login(dto: LoginDto): Promise<void> {
  await api.post('/auth/login', dto)   // no return — backend sets cookies
}

export async function fetchCurrentUser(): Promise<UserContext> {
  const res = await api.get<ApiResponse<UserContext>>('/auth/me')
  return res.data.data
}
```

---

## 6. BACKEND API RESPONSE FORMAT

Every backend response follows:

```typescript
// Success
interface ApiResponse<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

// Error
interface ApiErrorResponse {
  success: false
  error: { code: string; message: string }
}
```

Always type service return values using the inner `data` field, not the wrapper.

---

## 7. AUTH SYSTEM

### How auth works:

- Login → backend sets `access_token` + `refresh_token` as **httpOnly signed cookies**
- No tokens stored in JS (no localStorage, no sessionStorage)
- Every axios request sends cookies automatically via `withCredentials: true`
- On app load: call `GET /auth/me` to determine if user is authenticated
- On 401 from any request: attempt silent refresh via `POST /auth/refresh`
- On refresh failure: redirect to `/login`

### Auth state in Zustand (`auth.store.ts`):

```typescript
interface AuthStore {
  user: UserContext | null   // null = not authenticated
  setUser: (user: UserContext) => void
  clearUser: () => void
  isAuthenticated: () => boolean
}
```

### `UserContext` type (mirrors backend JWT payload):

```typescript
interface UserContext {
  userId: string
  tenantId: string
  role: UserRole
  plan: {
    name: string
    features: string[]
    limits: Record<string, number>
  }
}
```

### `useCurrentUser` hook:

- Runs `GET /auth/me` on mount
- On success: calls `setUser()`
- On error (401): leaves user as `null` (ProtectedRoute handles redirect)
- Used in `AppProviders` or top-level to rehydrate session on page refresh

---

## 8. ROUTING

### Route layout:

```
/                    → redirect to /dashboard
/login               → public, redirect to /dashboard if already authed
/dashboard           → protected
/properties          → protected
/properties/:id      → protected
...
```

### ProtectedRoute:

```typescript
// Checks auth.store user — if null, redirect to /login
// Shows loading state while useCurrentUser is pending
```

### Auth guard on login page:

- If user is already authenticated, redirect away from `/login` to `/dashboard`

---

## 9. FORM CONVENTIONS

- **Always** use React Hook Form + Zod resolver
- **Always** mirror the backend Zod schema for the same endpoint
- Field errors display inline below each field
- Submit button shows loading state during mutation
- On mutation error: show error toast or inline form-level error message

### Zod schema pattern:

```typescript
// login.schema.ts
export const loginSchema = z.object({
  slug: z.string().min(1, 'Tenant slug is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>
```

---

## 10. COMPONENT CONVENTIONS

- **Always** use shadcn/ui primitives first — don't write raw HTML form elements
- shadcn components live in `src/components/ui/` — **never hand-edit these**
- Add new shadcn components via `pnpm dlx shadcn@latest add <component>`
- Use `@tabler/icons-react` for all icons (e.g. `IconEye`, `IconLoader`)
- Dark mode is supported via `.dark` class — use semantic color tokens (e.g. `text-foreground`, `bg-card`), never hardcode colors
- Font is **Figtree Variable** — applied globally via `@layer base`

---

## 11. STATE MANAGEMENT RULES

| Type of State           | Where it lives                  |
| ----------------------- | ------------------------------- |
| Server data (API cache) | TanStack Query                  |
| Auth user context       | Zustand (`auth.store.ts`)       |
| UI state (modals, tabs) | `useState` in the component     |
| Cross-feature UI state  | Zustand store in that feature   |

- **Never** duplicate server state in Zustand — TanStack Query is the source of truth for server data
- **Never** use React Context for things that Zustand or TanStack Query handle better

---

## 12. ENVIRONMENT VARIABLES

All env vars prefixed with `VITE_` (Vite convention):

```env
VITE_API_URL=http://localhost:3000/api/v1
```

Access in code: `import.meta.env.VITE_API_URL`

---

## 13. NAMING CONVENTIONS

| Thing              | Convention                     | Example                         |
| ------------------ | ------------------------------ | ------------------------------- |
| Files              | `camelCase.ts` / `PascalCase.tsx` | `auth.service.ts`, `LoginForm.tsx` |
| Components         | PascalCase                     | `LoginForm`, `ProtectedRoute`   |
| Hooks              | `use` prefix, camelCase        | `useLogin`, `useCurrentUser`    |
| Services           | camelCase functions            | `login()`, `fetchCurrentUser()` |
| Zustand stores     | `use` prefix + `Store` suffix  | `useAuthStore`                  |
| Query keys         | `[feature, action, ...params]` | `['auth', 'me']`                |
| Types/Interfaces   | PascalCase                     | `LoginDto`, `UserContext`       |
| Zod schemas        | camelCase + `Schema` suffix    | `loginSchema`                   |

---

## 14. WHAT NOT TO DO — STRICT RULES

- ❌ NEVER store tokens (access/refresh) in localStorage or sessionStorage
- ❌ NEVER call axios directly inside React components — always go through a hook → service
- ❌ NEVER put business logic in components — it belongs in hooks or services
- ❌ NEVER hand-edit files in `src/components/ui/` — these are shadcn managed
- ❌ NEVER use `any` in TypeScript
- ❌ NEVER hardcode the API base URL — always use `import.meta.env.VITE_API_URL`
- ❌ NEVER use `useEffect` to fetch data — use TanStack Query
- ❌ NEVER duplicate server state in Zustand
- ❌ NEVER use raw CSS or inline styles — use Tailwind utility classes only
- ❌ NEVER hardcode colors — use design token variables (e.g. `bg-primary`, `text-muted-foreground`)

---

## 15. CURRENT BUILD STATUS

> Update this section as features are completed.

### ✅ Done

- [x] Vite + React 19 + TypeScript project scaffold
- [x] Tailwind CSS v4 + theme tokens (oklch palette, dark mode)
- [x] Figtree Variable font
- [x] shadcn/ui setup via `shadcn` package + Base UI
- [x] `@tabler/icons-react` installed
- [x] Path alias `@/*` → `src/*` configured (vite + tsconfig)
- [x] `src/components/ui/button.tsx`, `input.tsx`, `label.tsx`, `card.tsx`
- [x] `src/lib/utils.ts` (cn utility)
- [x] `src/lib/api.ts` (axios instance, withCredentials, refresh interceptor)
- [x] `src/lib/queryClient.ts`
- [x] Auth module complete:
  - [x] `src/features/auth/types/auth.types.ts`
  - [x] `src/features/auth/services/auth.service.ts`
  - [x] `src/features/auth/store/auth.store.ts` (Zustand)
  - [x] `src/features/auth/hooks/useCurrentUser.ts`
  - [x] `src/features/auth/hooks/useLogin.ts`
  - [x] `src/features/auth/hooks/useLogout.ts`
  - [x] `src/features/auth/components/LoginForm.tsx`
  - [x] `src/features/auth/pages/LoginPage.tsx`
- [x] `src/routes/ProtectedRoute.tsx`
- [x] `src/routes/AppRouter.tsx`
- [x] `src/providers/AppProviders.tsx` (+ Toaster added)
- [x] `main.tsx` + `App.tsx` wired up
- [x] Shared layout: `AppShell`, `Sidebar`, `Header` at `src/components/layout/`
- [x] `src/routes/SuperAdminRoute.tsx` — role guard for SUPER_ADMIN
- [x] `src/hooks/useDebounce.ts` — generic debounce hook
- [x] Additional shadcn components: `table`, `dialog`, `dropdown-menu`, `select`, `tabs`, `badge`, `separator`, `sonner`
- [x] Tenants module (super_admin only):
  - [x] `src/features/tenants/types/tenants.types.ts`
  - [x] `src/features/tenants/services/tenants.service.ts`
  - [x] `src/features/tenants/hooks/useTenants.ts`
  - [x] `src/features/tenants/hooks/useTenant.ts`
  - [x] `src/features/tenants/hooks/useCreateTenant.ts`
  - [x] `src/features/tenants/hooks/useUpdateTenant.ts`
  - [x] `src/features/tenants/hooks/useDeleteTenant.ts`
  - [x] `src/features/tenants/hooks/useTenantUsers.ts`
  - [x] `src/features/tenants/components/StatusBadge.tsx`
  - [x] `src/features/tenants/components/TenantFilters.tsx`
  - [x] `src/features/tenants/components/TenantTable.tsx`
  - [x] `src/features/tenants/components/DeleteTenantDialog.tsx`
  - [x] `src/features/tenants/components/TenantForm.tsx`
  - [x] `src/features/tenants/pages/TenantsPage.tsx` → `/super-admin/tenants`
  - [x] `src/features/tenants/pages/CreateTenantPage.tsx` → `/super-admin/tenants/new`
  - [x] `src/features/tenants/pages/TenantDetailPage.tsx` → `/super-admin/tenants/:id`

### 🚧 In Progress

_(nothing)_

### ❌ Not Started

- [ ] Dashboard
- [ ] Properties module
- [ ] Room Types module
- [ ] Rooms module
- [ ] Reservations module
- [ ] Guests module
- [ ] Staff (Users) module
- [ ] Housekeeping module
- [ ] Reports module
- [ ] Plans endpoint (GET /plans) — needed to replace planId text input with a dropdown in TenantForm

---

## 16. WHEN CLAUDE IS ASKED TO BUILD SOMETHING

1. **Always** read this file first
2. **Always** follow the feature folder structure (Section 4)
3. **Always** use the axios instance from `src/lib/api.ts` — never create new instances
4. **Always** use TanStack Query for server state — no `useEffect` fetching
5. **Always** use React Hook Form + Zod for forms
6. **Always** use shadcn primitives — don't write raw form elements
7. **Always** type everything — no `any`
8. **Ask** before adding any library not in the tech stack (Section 2)
9. **Ask** before changing any architectural pattern defined here
