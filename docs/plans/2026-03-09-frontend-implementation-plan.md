# Frontend Admin Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a React admin dashboard for the Hotel Management SaaS that connects to the existing Express backend, covering auth, tenants CRUD, and properties CRUD.

**Architecture:** Feature-based SPA using React 19 + React Compiler + Vite. Each domain (auth, tenants, properties) is a self-contained feature module with its own API layer, TanStack Query hooks, components, and pages. Zustand handles client state (auth token in memory, UI preferences). Axios with interceptors manages API communication and silent token refresh.

**Tech Stack:** React 19 + React Compiler, Vite, TypeScript strict, shadcn/ui, Tailwind CSS v4, React Router v7, TanStack Query v5, Zustand, React Hook Form + Zod, Axios, Lucide React, pnpm

**Backend API base:** `http://localhost:3000/api/v1`

**IMPORTANT:** Always use context7 MCP to fetch latest docs for React, Vite, shadcn/ui, TanStack Query, React Router, Zustand, React Hook Form, and Zod before writing code.

**IMPORTANT:** Always follow industry best practices. Read `frontend/CLAUDE.md` before every task.

---

## Task 1: Project Scaffolding

**GitHub Issue:** #1

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.env`, `.env.example`, `.gitignore`, `eslint.config.js`, `index.html`, `src/main.tsx`, `src/index.css`, `src/vite-env.d.ts`

**Step 1: Scaffold Vite + React 19 project**

Use context7 to get the latest Vite + React setup instructions.

```bash
cd D:/umar_bashir/personal_projects/property-management-system/frontend
pnpm create vite . --template react-ts
```

If the directory already has files (CLAUDE.md, docs/), Vite may warn — proceed and it will only create project files.

**Step 2: Install React 19 with React Compiler**

Use context7 to check the latest React Compiler setup for Vite.

```bash
pnpm add react@latest react-dom@latest
pnpm add -D @types/react @types/react-dom babel-plugin-react-compiler
```

Add the React Compiler plugin to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 3: Configure TypeScript strict mode + path aliases**

Update `tsconfig.json` (or `tsconfig.app.json` depending on Vite template):

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 4: Set up environment variables**

Create `.env`:
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Hotel Management
```

Create `.env.example`:
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Hotel Management
```

**Step 5: Set up .gitignore**

Ensure `.gitignore` includes:
```
node_modules
dist
.env
*.local
```

**Step 6: Verify dev server starts**

```bash
pnpm dev
```

Expected: Dev server starts at `http://localhost:5173`, no errors in console.

**Step 7: Verify build works**

```bash
pnpm build && pnpm preview
```

Expected: Build succeeds, preview server works.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React 19 + TypeScript project"
```

---

## Task 2: Install Tailwind CSS v4 + shadcn/ui

**GitHub Issue:** #2 (part 1)

**Files:**
- Modify: `src/index.css`, `vite.config.ts`, `package.json`
- Create: `components.json` (shadcn config)

**Step 1: Install Tailwind CSS v4**

Use context7 to get the latest Tailwind v4 + Vite setup.

```bash
pnpm add tailwindcss @tailwindcss/vite
```

Add Tailwind plugin to `vite.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({ ... }),
    tailwindcss(),
  ],
  // ...
})
```

Update `src/index.css`:
```css
@import "tailwindcss";
```

**Step 2: Install shadcn/ui**

Use context7 to get the latest shadcn/ui init for Vite + Tailwind v4.

```bash
pnpm dlx shadcn@latest init
```

Follow prompts:
- Style: Default
- Base color: Neutral (or Zinc)
- CSS variables: Yes

This creates `components.json` and updates `src/index.css` with CSS variables.

**Step 3: Install base shadcn components**

```bash
pnpm dlx shadcn@latest add button input label card dialog table badge dropdown-menu separator skeleton sonner form select textarea checkbox
```

**Step 4: Verify Tailwind + shadcn work**

Update `src/main.tsx` temporarily:

```tsx
import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button>Hello shadcn</Button>
    </div>
  )
}
```

Run `pnpm dev` — button should render styled.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Tailwind CSS v4 + shadcn/ui with base components"
```

---

## Task 3: Install Core Dependencies

**GitHub Issue:** #3, #4 (dependencies)

**Files:**
- Modify: `package.json`

**Step 1: Install all runtime dependencies**

```bash
pnpm add axios @tanstack/react-query @tanstack/react-table react-router react-hook-form @hookform/resolvers zod zustand lucide-react sonner
```

**Step 2: Install dev dependencies**

```bash
pnpm add -D @tanstack/react-query-devtools
```

**Step 3: Verify build still works**

```bash
pnpm build
```

Expected: No errors.

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: install core dependencies (axios, tanstack, zustand, react-router, zod)"
```

---

## Task 4: Global Types + Utilities

**Files:**
- Create: `src/types/api.types.ts`
- Create: `src/types/auth.types.ts`
- Create: `src/types/index.ts`
- Create: `src/lib/utils.ts`

**Step 1: Create global API types**

```typescript
// src/types/api.types.ts

export interface ApiResponse<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
  }
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
```

**Step 2: Create auth types**

```typescript
// src/types/auth.types.ts

export type UserRole =
  | 'super_admin'
  | 'tenant_admin'
  | 'property_manager'
  | 'front_desk'
  | 'housekeeping'
  | 'accountant'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  tenantId: string
  propertyIds: string[]
}

export interface LoginCredentials {
  slug: string
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

**Step 3: Create barrel export**

```typescript
// src/types/index.ts
export * from './api.types'
export * from './auth.types'
```

**Step 4: Create utils**

The `cn()` helper should already exist from shadcn init at `src/lib/utils.ts`. If not, create:

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 5: Commit**

```bash
git add src/types/ src/lib/utils.ts
git commit -m "feat: add global TypeScript types and utility helpers"
```

---

## Task 5: Zustand Stores

**GitHub Issue:** #4

**Files:**
- Create: `src/stores/auth.store.ts`
- Create: `src/stores/ui.store.ts`

**Step 1: Create auth store**

```typescript
// src/stores/auth.store.ts
import { create } from 'zustand'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, accessToken: string) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  setAccessToken: (accessToken) =>
    set({ accessToken }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) =>
    set({ isLoading }),
}))
```

**Step 2: Create UI store**

```typescript
// src/stores/ui.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    {
      name: 'ui-store',
    }
  )
)
```

**Step 3: Commit**

```bash
git add src/stores/
git commit -m "feat: add Zustand stores for auth (in-memory) and UI (persisted)"
```

---

## Task 6: Axios API Client + Token Refresh

**GitHub Issue:** #3

**Files:**
- Create: `src/lib/api-client.ts`
- Create: `src/lib/query-client.ts`

**Step 1: Create Axios API client with interceptors**

```typescript
// src/lib/api-client.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach access token
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Response interceptor — handle 401 + silent refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (config: InternalAxiosRequestConfig) => void
  reject: (error: AxiosError) => void
}> = []

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      // The retry will pick up the new token from the store via request interceptor
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Skip refresh for login and refresh endpoints
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(apiClient(originalRequest)),
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )

      const { accessToken } = response.data.data
      useAuthStore.getState().setAccessToken(accessToken)

      processQueue(null)

      // Retry the original request — interceptor will add new token
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError as AxiosError)
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
```

**Step 2: Create TanStack Query client**

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
```

**Step 3: Commit**

```bash
git add src/lib/api-client.ts src/lib/query-client.ts
git commit -m "feat: add Axios API client with silent token refresh + TanStack Query client"
```

---

## Task 7: App Providers + Entry Point

**Files:**
- Create: `src/app/providers.tsx`
- Modify: `src/main.tsx`

**Step 1: Create providers wrapper**

```typescript
// src/app/providers.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**Step 2: Update main.tsx**

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/app/providers'
import { App } from '@/app/App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
)
```

**Step 3: Create placeholder App**

```typescript
// src/app/App.tsx
export function App() {
  return <div className="p-8 text-2xl font-bold">Hotel Management Dashboard</div>
}
```

**Step 4: Run dev server to verify**

```bash
pnpm dev
```

Expected: App renders with text, Sonner toaster present, React Query devtools visible.

**Step 5: Commit**

```bash
git add src/app/ src/main.tsx
git commit -m "feat: set up app providers (QueryClient, Toaster, DevTools)"
```

---

## Task 8: Auth Feature — API + Hooks

**GitHub Issue:** #7 (part 1)

**Files:**
- Create: `src/features/auth/types/index.ts`
- Create: `src/features/auth/api/auth.api.ts`
- Create: `src/features/auth/hooks/useLogin.ts`
- Create: `src/features/auth/hooks/useLogout.ts`
- Create: `src/features/auth/hooks/useCurrentUser.ts`

**Step 1: Create auth feature types**

```typescript
// src/features/auth/types/index.ts
import type { User } from '@/types'

export interface LoginRequest {
  slug: string
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
}

export interface MeResponse {
  user: User
  accessToken: string
}
```

**Step 2: Create auth API functions**

```typescript
// src/features/auth/api/auth.api.ts
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type { LoginRequest, LoginResponse, MeResponse } from '../types'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data),

  me: () =>
    apiClient.get<ApiResponse<MeResponse>>('/auth/me'),

  logout: () =>
    apiClient.post('/auth/logout'),

  refresh: () =>
    apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),
}
```

**Step 3: Create useLogin hook**

```typescript
// src/features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '../api/auth.api'
import type { LoginRequest } from '../types'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const { user, accessToken } = response.data.data
      setAuth(user, accessToken)
      toast.success('Logged in successfully')
      navigate('/', { replace: true })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Login failed'
      toast.error(message)
    },
  })
}
```

**Step 4: Create useLogout hook**

```typescript
// src/features/auth/hooks/useLogout.ts
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import { queryClient } from '@/lib/query-client'
import { authApi } from '../api/auth.api'

export function useLogout() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
```

**Step 5: Create useCurrentUser hook**

```typescript
// src/features/auth/hooks/useCurrentUser.ts
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '../api/auth.api'

export function useCurrentUser() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const setLoading = useAuthStore((s) => s.setLoading)

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await authApi.me()
        const { user, accessToken } = response.data.data
        setAuth(user, accessToken)
        return response.data.data
      } catch {
        clearAuth()
        throw new Error('Not authenticated')
      } finally {
        setLoading(false)
      }
    },
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
```

**Step 6: Commit**

```bash
git add src/features/auth/
git commit -m "feat: add auth API layer and TanStack Query hooks (login, logout, me)"
```

---

## Task 9: Auth Feature — Login Page + Form

**GitHub Issue:** #7 (part 2)

**Files:**
- Create: `src/features/auth/components/LoginForm.tsx`
- Create: `src/features/auth/pages/LoginPage.tsx`

**Step 1: Create LoginForm component**

Use context7 for React Hook Form + Zod resolver latest docs.

```typescript
// src/features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogin } from '../hooks/useLogin'

const loginSchema = z.object({
  slug: z.string().min(1, 'Organization slug is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      slug: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Enter your credentials to access the dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Organization</Label>
            <Input
              id="slug"
              placeholder="your-hotel-slug"
              {...register('slug')}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Create LoginPage**

```typescript
// src/features/auth/pages/LoginPage.tsx
import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <LoginForm />
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/features/auth/
git commit -m "feat: add LoginForm component and LoginPage with Zod validation"
```

---

## Task 10: Routing + Auth Guards

**GitHub Issue:** #6

**Files:**
- Create: `src/components/shared/ProtectedRoute.tsx`
- Create: `src/components/shared/RoleGuard.tsx`
- Create: `src/features/auth/pages/NotFoundPage.tsx`
- Create: `src/app/router.tsx`
- Modify: `src/app/App.tsx`

**Step 1: Create ProtectedRoute**

```typescript
// src/components/shared/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

export function ProtectedRoute() {
  const { isLoading } = useCurrentUser()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const authLoading = useAuthStore((s) => s.isLoading)

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
```

**Step 2: Create RoleGuard**

```typescript
// src/components/shared/RoleGuard.tsx
import { useAuthStore } from '@/stores/auth.store'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  roles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

**Step 3: Create NotFoundPage**

```typescript
// src/features/auth/pages/NotFoundPage.tsx
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Button asChild>
        <Link to="/">Go to Dashboard</Link>
      </Button>
    </div>
  )
}
```

**Step 4: Create placeholder dashboard page**

```typescript
// src/features/dashboard/pages/DashboardPage.tsx
export function DashboardPage() {
  return <div className="p-6">Dashboard — coming soon</div>
}
```

**Step 5: Create router**

Use context7 to check latest React Router v7 API.

```typescript
// src/app/router.tsx
import { BrowserRouter, Routes, Route } from 'react-router'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { NotFoundPage } from '@/features/auth/pages/NotFoundPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Step 6: Update App.tsx**

```typescript
// src/app/App.tsx
import { AppRouter } from './router'

export function App() {
  return <AppRouter />
}
```

**Step 7: Verify routing works**

```bash
pnpm dev
```

- Visit `http://localhost:5173` — should redirect to `/login` (no auth)
- Visit `http://localhost:5173/login` — should show login form
- Visit `http://localhost:5173/blah` — should show 404

**Step 8: Commit**

```bash
git add src/
git commit -m "feat: add React Router v7 with auth guards and route protection"
```

---

## Task 11: Shared Components — PageHeader, ErrorBoundary, EmptyState, LoadingState, StatusBadge, ConfirmDialog

**GitHub Issue:** #2 (part 2)

**Files:**
- Create: `src/components/shared/PageHeader.tsx`
- Create: `src/components/shared/ErrorBoundary.tsx`
- Create: `src/components/shared/EmptyState.tsx`
- Create: `src/components/shared/LoadingState.tsx`
- Create: `src/components/shared/StatusBadge.tsx`
- Create: `src/components/shared/ConfirmDialog.tsx`

**Step 1: Create PageHeader**

```typescript
// src/components/shared/PageHeader.tsx
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
```

**Step 2: Create ErrorBoundary**

```typescript
// src/components/shared/ErrorBoundary.tsx
import { Component } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">{this.state.error?.message}</p>
          <Button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Step 3: Create EmptyState**

```typescript
// src/components/shared/EmptyState.tsx
interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
```

**Step 4: Create LoadingState**

```typescript
// src/components/shared/LoadingState.tsx
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingStateProps {
  rows?: number
}

export function LoadingState({ rows = 5 }: LoadingStateProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
```

**Step 5: Create StatusBadge**

```typescript
// src/components/shared/StatusBadge.tsx
import { Badge } from '@/components/ui/badge'

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  suspended: 'destructive',
  cancelled: 'destructive',
  pending: 'outline',
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = statusVariants[status.toLowerCase()] || 'outline'
  return <Badge variant={variant}>{status}</Badge>
}
```

**Step 6: Create ConfirmDialog**

```typescript
// src/components/shared/ConfirmDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmLabel?: string
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'Confirm',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 7: Commit**

```bash
git add src/components/shared/
git commit -m "feat: add shared components (PageHeader, ErrorBoundary, EmptyState, LoadingState, StatusBadge, ConfirmDialog)"
```

---

## Task 12: DataTable Shared Component

**GitHub Issue:** #2 (part 3)

**Files:**
- Create: `src/components/shared/DataTable.tsx`

**Step 1: Create DataTable**

Use context7 for TanStack Table latest API.

```typescript
// src/components/shared/DataTable.tsx
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '@/types'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: PaginationMeta
  onPageChange?: (page: number) => void
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPageChange,
  isLoading = false,
  emptyMessage = 'No results found',
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
  })

  if (isLoading) {
    return <LoadingState rows={5} />
  }

  if (data.length === 0) {
    return <EmptyState title={emptyMessage} />
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && onPageChange && (
        <div className="flex items-center justify-between py-4">
          <p className="text-sm text-muted-foreground">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/shared/DataTable.tsx
git commit -m "feat: add reusable DataTable component with server-side pagination"
```

---

## Task 13: App Layout — Sidebar + Topbar

**GitHub Issue:** #5

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Topbar.tsx`
- Create: `src/components/layout/AppLayout.tsx`
- Create: `src/components/layout/nav-config.ts`
- Modify: `src/app/router.tsx`

**Step 1: Create navigation config**

```typescript
// src/components/layout/nav-config.ts
import {
  LayoutDashboard,
  Building2,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  roles?: UserRole[] // if undefined, visible to all authenticated users
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        title: 'Tenants',
        href: '/tenants',
        icon: Users,
        roles: ['super_admin'],
      },
      {
        title: 'Properties',
        href: '/properties',
        icon: Building2,
      },
    ],
  },
]
```

**Step 2: Create Sidebar**

```typescript
// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router'
import { ChevronLeft, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { navGroups } from './nav-config'

export function Sidebar() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const logout = useLogout()

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-background transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!sidebarCollapsed && (
          <span className="text-lg font-semibold">Hotel MS</span>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.roles || (user && item.roles.includes(user.role))
          )

          if (visibleItems.length === 0) return null

          return (
            <div key={group.label} className="mb-4">
              {!sidebarCollapsed && (
                <p className="mb-1 px-4 text-xs font-medium uppercase text-muted-foreground">
                  {group.label}
                </p>
              )}
              {visibleItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-accent',
                      isActive && 'bg-accent font-medium',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                    title={sidebarCollapsed ? item.title : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2',
                sidebarCollapsed && 'justify-center px-2'
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              {!sidebarCollapsed && (
                <span className="truncate text-sm">
                  {user?.firstName} {user?.lastName}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
```

**Step 3: Create Topbar**

```typescript
// src/components/layout/Topbar.tsx
import { useLocation } from 'react-router'
import { Separator } from '@/components/ui/separator'

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tenants': 'Tenants',
  '/tenants/new': 'Create Tenant',
  '/properties': 'Properties',
  '/properties/new': 'Create Property',
}

export function Topbar() {
  const location = useLocation()

  // Get title — try exact match first, then pattern match for detail pages
  const title =
    routeTitles[location.pathname] ||
    (location.pathname.startsWith('/tenants/') ? 'Tenant Details' : undefined) ||
    (location.pathname.startsWith('/properties/') ? 'Property Details' : undefined) ||
    'Dashboard'

  // Generate breadcrumbs from path
  const segments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = segments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
    href: '/' + segments.slice(0, index + 1).join('/'),
    isLast: index === segments.length - 1,
  }))

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Home</span>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href}>
            <span className="mx-1">/</span>
            <span className={crumb.isLast ? 'text-foreground font-medium' : ''}>
              {crumb.label}
            </span>
          </span>
        ))}
      </div>
    </header>
  )
}
```

**Step 4: Create AppLayout**

```typescript
// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
```

**Step 5: Update router to use AppLayout**

```typescript
// src/app/router.tsx
import { BrowserRouter, Routes, Route } from 'react-router'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { NotFoundPage } from '@/features/auth/pages/NotFoundPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Step 6: Verify layout renders**

```bash
pnpm dev
```

Expected: Sidebar + Topbar + content area visible (after auth, or temporarily disable ProtectedRoute to test).

**Step 7: Commit**

```bash
git add src/components/layout/ src/app/router.tsx
git commit -m "feat: add dashboard layout with collapsible sidebar, topbar, and breadcrumbs"
```

---

## Task 14: Tenants Feature — API + Hooks + Types

**GitHub Issue:** #8 (part 1)

**Files:**
- Create: `src/features/tenants/types/index.ts`
- Create: `src/features/tenants/api/tenants.api.ts`
- Create: `src/features/tenants/hooks/useTenants.ts`

**Step 1: Create tenant types**

```typescript
// src/features/tenants/types/index.ts

export interface Tenant {
  id: string
  name: string
  slug: string
  planId: string
  status: 'active' | 'suspended' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface CreateTenantRequest {
  tenant: {
    name: string
    slug: string
    planId: string
  }
  admin: {
    email: string
    firstName: string
    lastName: string
    password: string
  }
}

export interface UpdateTenantRequest {
  name?: string
  slug?: string
  planId?: string
  status?: 'active' | 'suspended' | 'cancelled'
}

export interface TenantsListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}
```

**Step 2: Create tenants API**

```typescript
// src/features/tenants/api/tenants.api.ts
import { apiClient } from '@/lib/api-client'
import type { ApiResponse, PaginationMeta } from '@/types'
import type { Tenant, CreateTenantRequest, UpdateTenantRequest, TenantsListParams } from '../types'

export const tenantsApi = {
  list: (params?: TenantsListParams) =>
    apiClient.get<ApiResponse<Tenant[]> & { meta: PaginationMeta }>('/tenants', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Tenant>>(`/tenants/${id}`),

  create: (data: CreateTenantRequest) =>
    apiClient.post<ApiResponse<Tenant>>('/tenants', data),

  update: (id: string, data: UpdateTenantRequest) =>
    apiClient.patch<ApiResponse<Tenant>>(`/tenants/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/tenants/${id}`),
}
```

**Step 3: Create tenants hooks**

```typescript
// src/features/tenants/hooks/useTenants.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'
import { tenantsApi } from '../api/tenants.api'
import type { CreateTenantRequest, UpdateTenantRequest, TenantsListParams } from '../types'

export function useTenants(params?: TenantsListParams) {
  return useQuery({
    queryKey: ['tenants', params],
    queryFn: () => tenantsApi.list(params),
    select: (response) => ({
      tenants: response.data.data,
      meta: response.data.meta,
    }),
  })
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ['tenants', id],
    queryFn: () => tenantsApi.getById(id),
    select: (response) => response.data.data,
    enabled: !!id,
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: CreateTenantRequest) => tenantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success('Tenant created successfully')
      navigate('/tenants')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create tenant'
      toast.error(message)
    },
  })
}

export function useUpdateTenant(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTenantRequest) => tenantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['tenants', id] })
      toast.success('Tenant updated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to update tenant'
      toast.error(message)
    },
  })
}

export function useDeleteTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tenantsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success('Tenant deleted successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to delete tenant'
      toast.error(message)
    },
  })
}
```

**Step 4: Commit**

```bash
git add src/features/tenants/
git commit -m "feat: add tenants API layer and TanStack Query hooks (CRUD)"
```

---

## Task 15: Tenants Feature — Pages + Components

**GitHub Issue:** #8 (part 2)

**Files:**
- Create: `src/features/tenants/components/tenant-columns.tsx`
- Create: `src/features/tenants/components/TenantForm.tsx`
- Create: `src/features/tenants/pages/TenantsListPage.tsx`
- Create: `src/features/tenants/pages/CreateTenantPage.tsx`
- Create: `src/features/tenants/pages/TenantDetailPage.tsx`
- Modify: `src/app/router.tsx`

**Step 1: Create table column definitions**

```typescript
// src/features/tenants/components/tenant-columns.tsx
import { type ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Tenant } from '../types'

export const tenantColumns: ColumnDef<Tenant>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <Link to={`/tenants/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
]
```

**Step 2: Create TenantForm component**

```typescript
// src/features/tenants/components/TenantForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const createTenantSchema = z.object({
  tenantName: z.string().min(1, 'Tenant name is required'),
  tenantSlug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  planId: z.string().uuid('Plan ID is required'),
  adminEmail: z.string().email('Invalid email'),
  adminFirstName: z.string().min(1, 'First name is required'),
  adminLastName: z.string().min(1, 'Last name is required'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

type TenantFormValues = z.infer<typeof createTenantSchema>

interface TenantFormProps {
  onSubmit: (data: TenantFormValues) => void
  isPending: boolean
}

export function TenantForm({ onSubmit, isPending }: TenantFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(createTenantSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tenant Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenantName">Name</Label>
              <Input id="tenantName" {...register('tenantName')} />
              {errors.tenantName && <p className="text-sm text-destructive">{errors.tenantName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantSlug">Slug</Label>
              <Input id="tenantSlug" placeholder="my-hotel" {...register('tenantSlug')} />
              {errors.tenantSlug && <p className="text-sm text-destructive">{errors.tenantSlug.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="planId">Plan ID</Label>
            <Input id="planId" placeholder="UUID of the plan" {...register('planId')} />
            {errors.planId && <p className="text-sm text-destructive">{errors.planId.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminFirstName">First Name</Label>
              <Input id="adminFirstName" {...register('adminFirstName')} />
              {errors.adminFirstName && <p className="text-sm text-destructive">{errors.adminFirstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminLastName">Last Name</Label>
              <Input id="adminLastName" {...register('adminLastName')} />
              {errors.adminLastName && <p className="text-sm text-destructive">{errors.adminLastName.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email</Label>
            <Input id="adminEmail" type="email" {...register('adminEmail')} />
            {errors.adminEmail && <p className="text-sm text-destructive">{errors.adminEmail.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminPassword">Password</Label>
            <Input id="adminPassword" type="password" {...register('adminPassword')} />
            {errors.adminPassword && <p className="text-sm text-destructive">{errors.adminPassword.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Tenant'}
        </Button>
      </div>
    </form>
  )
}
```

**Step 3: Create TenantsListPage**

```typescript
// src/features/tenants/pages/TenantsListPage.tsx
import { useState } from 'react'
import { Link } from 'react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { useTenants } from '../hooks/useTenants'
import { tenantColumns } from '../components/tenant-columns'

export function TenantsListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useTenants({ page, limit: 20, search: search || undefined })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        description="Manage all tenants on the platform"
        actions={
          <Button asChild>
            <Link to="/tenants/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Tenant
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={tenantColumns}
        data={data?.tenants ?? []}
        pagination={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="No tenants found"
      />
    </div>
  )
}
```

**Step 4: Create CreateTenantPage**

```typescript
// src/features/tenants/pages/CreateTenantPage.tsx
import { PageHeader } from '@/components/shared/PageHeader'
import { TenantForm } from '../components/TenantForm'
import { useCreateTenant } from '../hooks/useTenants'

export function CreateTenantPage() {
  const createTenant = useCreateTenant()

  const handleSubmit = (data: any) => {
    createTenant.mutate({
      tenant: {
        name: data.tenantName,
        slug: data.tenantSlug,
        planId: data.planId,
      },
      admin: {
        email: data.adminEmail,
        firstName: data.adminFirstName,
        lastName: data.adminLastName,
        password: data.adminPassword,
      },
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Tenant" description="Add a new tenant to the platform" />
      <TenantForm onSubmit={handleSubmit} isPending={createTenant.isPending} />
    </div>
  )
}
```

**Step 5: Create TenantDetailPage**

```typescript
// src/features/tenants/pages/TenantDetailPage.tsx
import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTenant } from '../hooks/useTenants'

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: tenant, isLoading } = useTenant(id!)

  if (isLoading) return <LoadingState />

  if (!tenant) {
    return <div className="p-6">Tenant not found</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={tenant.name}
        description={`Slug: ${tenant.slug}`}
        actions={<StatusBadge status={tenant.status} />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Name</dt>
              <dd>{tenant.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Slug</dt>
              <dd>{tenant.slug}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Status</dt>
              <dd><StatusBadge status={tenant.status} /></dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Created</dt>
              <dd>{new Date(tenant.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 6: Update router to include tenant routes**

Add tenant routes inside the `<AppLayout>` route:

```typescript
// In src/app/router.tsx — add imports:
import { TenantsListPage } from '@/features/tenants/pages/TenantsListPage'
import { CreateTenantPage } from '@/features/tenants/pages/CreateTenantPage'
import { TenantDetailPage } from '@/features/tenants/pages/TenantDetailPage'

// Add routes inside <Route element={<AppLayout />}>:
<Route path="tenants" element={<TenantsListPage />} />
<Route path="tenants/new" element={<CreateTenantPage />} />
<Route path="tenants/:id" element={<TenantDetailPage />} />
```

**Step 7: Commit**

```bash
git add src/features/tenants/ src/app/router.tsx
git commit -m "feat: add tenants feature with list, create, and detail pages"
```

---

## Task 16: Properties Feature — API + Hooks + Types

**GitHub Issue:** #9 (part 1)

**Files:**
- Create: `src/features/properties/types/index.ts`
- Create: `src/features/properties/api/properties.api.ts`
- Create: `src/features/properties/hooks/useProperties.ts`

**Step 1: Create property types**

```typescript
// src/features/properties/types/index.ts

export interface Property {
  id: string
  tenantId: string
  name: string
  slug: string
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  zipCode: string | null
  phone: string | null
  email: string | null
  timezone: string | null
  currency: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePropertyRequest {
  name: string
  slug: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  phone?: string
  email?: string
  timezone?: string
  currency?: string
  tenantId?: string // required for SUPER_ADMIN
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  isActive?: boolean
}

export interface PropertiesListParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  tenantId?: string // required for SUPER_ADMIN
}
```

**Step 2: Create properties API**

```typescript
// src/features/properties/api/properties.api.ts
import { apiClient } from '@/lib/api-client'
import type { ApiResponse, PaginationMeta } from '@/types'
import type { Property, CreatePropertyRequest, UpdatePropertyRequest, PropertiesListParams } from '../types'

export const propertiesApi = {
  list: (params?: PropertiesListParams) =>
    apiClient.get<ApiResponse<Property[]> & { meta: PaginationMeta }>('/properties', { params }),

  getById: (id: string, tenantId?: string) =>
    apiClient.get<ApiResponse<Property>>(`/properties/${id}`, {
      params: tenantId ? { tenantId } : undefined,
    }),

  create: (data: CreatePropertyRequest) =>
    apiClient.post<ApiResponse<Property>>('/properties', data),

  update: (id: string, data: UpdatePropertyRequest) =>
    apiClient.patch<ApiResponse<Property>>(`/properties/${id}`, data),

  delete: (id: string, tenantId?: string) =>
    apiClient.delete(`/properties/${id}`, {
      params: tenantId ? { tenantId } : undefined,
    }),
}
```

**Step 3: Create properties hooks**

```typescript
// src/features/properties/hooks/useProperties.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'
import { propertiesApi } from '../api/properties.api'
import type { CreatePropertyRequest, UpdatePropertyRequest, PropertiesListParams } from '../types'

export function useProperties(params?: PropertiesListParams) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => propertiesApi.list(params),
    select: (response) => ({
      properties: response.data.data,
      meta: response.data.meta,
    }),
  })
}

export function useProperty(id: string, tenantId?: string) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => propertiesApi.getById(id, tenantId),
    select: (response) => response.data.data,
    enabled: !!id,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: CreatePropertyRequest) => propertiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property created successfully')
      navigate('/properties')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create property'
      toast.error(message)
    },
  })
}

export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePropertyRequest) => propertiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['properties', id] })
      toast.success('Property updated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to update property'
      toast.error(message)
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, tenantId }: { id: string; tenantId?: string }) =>
      propertiesApi.delete(id, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property deleted successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to delete property'
      toast.error(message)
    },
  })
}
```

**Step 4: Commit**

```bash
git add src/features/properties/
git commit -m "feat: add properties API layer and TanStack Query hooks (CRUD)"
```

---

## Task 17: Properties Feature — Pages + Components

**GitHub Issue:** #9 (part 2)

**Files:**
- Create: `src/features/properties/components/property-columns.tsx`
- Create: `src/features/properties/components/PropertyForm.tsx`
- Create: `src/features/properties/pages/PropertiesListPage.tsx`
- Create: `src/features/properties/pages/CreatePropertyPage.tsx`
- Create: `src/features/properties/pages/PropertyDetailPage.tsx`
- Modify: `src/app/router.tsx`

**Step 1: Create table column definitions**

```typescript
// src/features/properties/components/property-columns.tsx
import { type ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Property } from '../types'

export const propertyColumns: ColumnDef<Property>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <Link to={`/properties/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => row.original.city || '—',
  },
  {
    accessorKey: 'country',
    header: 'Country',
    cell: ({ row }) => row.original.country || '—',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} />
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
]
```

**Step 2: Create PropertyForm**

```typescript
// src/features/properties/components/PropertyForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth.store'

const createPropertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  tenantId: z.string().uuid().optional(),
})

type PropertyFormValues = z.infer<typeof createPropertySchema>

interface PropertyFormProps {
  onSubmit: (data: PropertyFormValues) => void
  isPending: boolean
  defaultValues?: Partial<PropertyFormValues>
  isEdit?: boolean
}

export function PropertyForm({ onSubmit, isPending, defaultValues, isEdit = false }: PropertyFormProps) {
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = user?.role === 'super_admin'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(createPropertySchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input id="tenantId" placeholder="Tenant UUID" {...register('tenantId')} />
              {errors.tenantId && <p className="text-sm text-destructive">{errors.tenantId.message}</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="my-hotel" {...register('slug')} />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register('country')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input id="zipCode" {...register('zipCode')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" placeholder="Asia/Kolkata" {...register('timezone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" placeholder="INR" {...register('currency')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Property' : 'Create Property')}
        </Button>
      </div>
    </form>
  )
}
```

**Step 3: Create PropertiesListPage**

```typescript
// src/features/properties/pages/PropertiesListPage.tsx
import { useState } from 'react'
import { Link } from 'react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { useProperties } from '../hooks/useProperties'
import { propertyColumns } from '../components/property-columns'

export function PropertiesListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useProperties({ page, limit: 20, search: search || undefined })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Manage your hotel properties"
        actions={
          <Button asChild>
            <Link to="/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Property
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search properties..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={propertyColumns}
        data={data?.properties ?? []}
        pagination={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="No properties found"
      />
    </div>
  )
}
```

**Step 4: Create CreatePropertyPage**

```typescript
// src/features/properties/pages/CreatePropertyPage.tsx
import { PageHeader } from '@/components/shared/PageHeader'
import { PropertyForm } from '../components/PropertyForm'
import { useCreateProperty } from '../hooks/useProperties'

export function CreatePropertyPage() {
  const createProperty = useCreateProperty()

  return (
    <div className="space-y-6">
      <PageHeader title="Create Property" description="Add a new hotel property" />
      <PropertyForm onSubmit={(data) => createProperty.mutate(data)} isPending={createProperty.isPending} />
    </div>
  )
}
```

**Step 5: Create PropertyDetailPage**

```typescript
// src/features/properties/pages/PropertyDetailPage.tsx
import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProperty } from '../hooks/useProperties'

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: property, isLoading } = useProperty(id!)

  if (isLoading) return <LoadingState />

  if (!property) {
    return <div className="p-6">Property not found</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={property.name}
        description={`Slug: ${property.slug}`}
        actions={<StatusBadge status={property.isActive ? 'active' : 'inactive'} />}
      />

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Name</dt>
                <dd>{property.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Email</dt>
                <dd>{property.email || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Phone</dt>
                <dd>{property.phone || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Currency</dt>
                <dd>{property.currency || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Timezone</dt>
                <dd>{property.timezone || '—'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Address</dt>
                <dd>{property.address || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">City</dt>
                <dd>{property.city || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">State</dt>
                <dd>{property.state || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Country</dt>
                <dd>{property.country || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Zip Code</dt>
                <dd>{property.zipCode || '—'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 6: Update router to include property routes**

```typescript
// In src/app/router.tsx — add imports:
import { PropertiesListPage } from '@/features/properties/pages/PropertiesListPage'
import { CreatePropertyPage } from '@/features/properties/pages/CreatePropertyPage'
import { PropertyDetailPage } from '@/features/properties/pages/PropertyDetailPage'

// Add routes inside <Route element={<AppLayout />}>:
<Route path="properties" element={<PropertiesListPage />} />
<Route path="properties/new" element={<CreatePropertyPage />} />
<Route path="properties/:id" element={<PropertyDetailPage />} />
```

**Step 7: Commit**

```bash
git add src/features/properties/ src/app/router.tsx
git commit -m "feat: add properties feature with list, create, and detail pages"
```

---

## Task 18: Dashboard Home Page

**GitHub Issue:** #10

**Files:**
- Modify: `src/features/dashboard/pages/DashboardPage.tsx`

**Step 1: Build the dashboard page**

```typescript
// src/features/dashboard/pages/DashboardPage.tsx
import { Link } from 'react-router'
import { Building2, Users, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuthStore } from '@/stores/auth.store'
import { RoleGuard } from '@/components/shared/RoleGuard'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.firstName ?? 'User'}`}
        description="Hotel Management Dashboard"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">Total properties</p>
          </CardContent>
        </Card>

        <RoleGuard roles={['super_admin']}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground">Total tenants</p>
            </CardContent>
          </Card>
        </RoleGuard>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              New Property
            </Link>
          </Button>
          <RoleGuard roles={['super_admin']}>
            <Button asChild variant="outline">
              <Link to="/tenants/new">
                <Plus className="mr-2 h-4 w-4" />
                New Tenant
              </Link>
            </Button>
          </RoleGuard>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/features/dashboard/
git commit -m "feat: add dashboard home page with stat cards and quick actions"
```

---

## Task 19: Final Integration Test + Push

**Step 1: Verify build passes**

```bash
pnpm build
```

Expected: Build succeeds with no TypeScript errors.

**Step 2: Manual smoke test against backend**

1. Start backend: `cd ../backend && pnpm start:dev`
2. Start frontend: `cd ../frontend && pnpm dev`
3. Visit `http://localhost:5173` — should redirect to `/login`
4. Login with seed credentials — should land on dashboard
5. Navigate to Tenants (if SUPER_ADMIN) — should show list
6. Navigate to Properties — should show list
7. Create a property — should work with form validation
8. Logout — should return to login

**Step 3: Push to remote**

```bash
git push origin master
```
