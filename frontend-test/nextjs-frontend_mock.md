# ⚡ Next.js Auth Frontend — Build Spec
> **For:** Antigravity  
> **Purpose:** Signup / Login UI wired to the FastAPI backend — test Google Auth + normal auth end-to-end  
> **Stack:** Next.js 14 (App Router) · Tailwind CSS · shadcn/ui · axios · js-cookie

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx               # Root layout, font setup
│   ├── page.tsx                 # Root → redirects to /login or /dashboard
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── signup/
│   │   │   └── page.tsx         # Signup page
│   │   └── callback/
│   │       └── page.tsx         # Google OAuth callback handler
│   └── dashboard/
│       └── page.tsx             # Protected dashboard (post-login test page)
├── components/
│   ├── AuthForm.tsx             # Shared form shell
│   ├── GoogleButton.tsx         # "Continue with Google" button
│   └── ProtectedRoute.tsx       # Auth guard wrapper
├── lib/
│   ├── api.ts                   # Axios instance + all API calls
│   ├── auth.ts                  # Token helpers (get/set/clear)
│   └── hooks/
│       └── useAuth.ts           # useAuth hook
├── .env.local                   # Local env vars
├── .env.example
├── tailwind.config.ts
└── next.config.ts
```

---

## 📦 Dependencies

```bash
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend

# Core deps
npm install axios js-cookie
npm install -D @types/js-cookie

# shadcn/ui (optional but fast for clean inputs/buttons)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card
```

---

## ⚙️ Environment Variables (`.env.example`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google
```

> `NEXT_PUBLIC_` prefix exposes the variable to the browser. Keep it only for non-secret values.

---

## 🔧 Implementation

### `lib/auth.ts` — Token Helpers

```ts
import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: "Lax" });
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const clearToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const isLoggedIn = (): boolean => {
  return !!getToken();
};
```

---

### `lib/api.ts` — Axios Instance + All API Calls

```ts
import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────

export const apiSignup = (data: {
  email: string;
  full_name: string;
  password: string;
}) => api.post("/auth/signup", data);

export const apiLogin = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

// Redirect browser to backend Google OAuth route
export const triggerGoogleLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
};

// ── Protected ─────────────────────────────────────────────────────────────────

export const apiGetMe = () => api.get("/api/me");

export const apiPing = () => api.get("/api/ping");

export const apiProtected = () => api.get("/api/protected");
```

---

### `lib/hooks/useAuth.ts`

```ts
"use client";
import { useState, useEffect } from "react";
import { getToken, clearToken, isLoggedIn } from "../auth";
import { apiGetMe } from "../api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }
    apiGetMe()
      .then((res) => setUser(res.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    clearToken();
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loading, logout, isLoggedIn: isLoggedIn() };
}
```

---

### `components/GoogleButton.tsx`

```tsx
"use client";
import { triggerGoogleLogin } from "@/lib/api";

export default function GoogleButton({ label = "Continue with Google" }) {
  return (
    <button
      onClick={triggerGoogleLogin}
      className="w-full flex items-center justify-center gap-3 border border-zinc-300 
                 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-700 
                 hover:bg-zinc-50 transition-colors"
    >
      {/* Google SVG icon */}
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.2 33.6 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l6-6C34.3 6.5 29.4 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c11 0 20.5-8 20.5-20.5 0-1.4-.1-2.7-.5-5z"/>
        <path fill="#34A853" d="M6.3 15.6l7 5.1C15 17 19.2 14.5 24 14.5c3 0 5.7 1.1 7.8 2.9l6-6C34.3 6.5 29.4 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 11.1z"/>
        <path fill="#FBBC05" d="M24 45.5c5.3 0 10.1-1.9 13.8-5l-6.4-5.3C29.4 37 26.8 38 24 38c-5.6 0-10.3-3.8-11.9-8.9l-6.9 5.3C8.8 41.5 15.9 45.5 24 45.5z"/>
        <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.3-4.3 5.7l6.4 5.3c3.8-3.5 6.2-8.7 6.2-14.5 0-1.4-.1-2.7-.5-5z"/>
      </svg>
      {label}
    </button>
  );
}
```

---

### `components/ProtectedRoute.tsx`

```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
    }
  }, [router]);

  if (!isLoggedIn()) return null;
  return <>{children}</>;
}
```

---

### `app/(auth)/login/page.tsx`

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiLogin } from "@/lib/api";
import { setToken } from "@/lib/auth";
import GoogleButton from "@/components/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiLogin(form);
      setToken(res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-zinc-400">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <GoogleButton label="Sign in with Google" />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-500">or</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm 
                           rounded-lg px-3 py-2.5 outline-none 
                           focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm 
                           rounded-lg px-3 py-2.5 outline-none 
                           focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 
                            rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 
                         text-white text-sm font-semibold rounded-lg py-2.5 
                         transition-colors mt-1"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500">
          No account?{" "}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
```

---

### `app/(auth)/signup/page.tsx`

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiSignup } from "@/lib/api";
import { setToken } from "@/lib/auth";
import GoogleButton from "@/components/GoogleButton";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiSignup(form);
      setToken(res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create account</h1>
          <p className="text-sm text-zinc-400">Start building something great</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <GoogleButton label="Sign up with Google" />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-500">or</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Full name</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="John Doe"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm 
                           rounded-lg px-3 py-2.5 outline-none 
                           focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm 
                           rounded-lg px-3 py-2.5 outline-none 
                           focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 8 characters"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm 
                           rounded-lg px-3 py-2.5 outline-none 
                           focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 
                            rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 
                         text-white text-sm font-semibold rounded-lg py-2.5 
                         transition-colors mt-1"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
```

---

### `app/(auth)/callback/page.tsx` — Google OAuth Callback Handler

> This page runs when Google redirects back to the frontend with a token  
> (after you uncomment the redirect line in the backend's `auth.py`)

```tsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      router.replace("/dashboard");
    } else {
      // No token — something went wrong
      router.replace("/login?error=google_failed");
    }
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent 
                        rounded-full animate-spin mx-auto" />
        <p className="text-sm text-zinc-400">Completing sign in…</p>
      </div>
    </main>
  );
}
```

> **Backend wiring:** In `app/routers/auth.py` Google callback, swap the `return result` line for:
> ```python
> return RedirectResponse(f"{settings.FRONTEND_URL}/callback?token={result['access_token']}")
> ```

---

### `app/dashboard/page.tsx` — Protected Test Page

```tsx
"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiPing, apiProtected } from "@/lib/api";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [protectedResult, setProtectedResult] = useState<string | null>(null);

  const testPing = async () => {
    const res = await apiPing();
    setPingResult(JSON.stringify(res.data, null, 2));
  };

  const testProtected = async () => {
    const res = await apiProtected();
    setProtectedResult(JSON.stringify(res.data, null, 2));
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-zinc-950 px-4 py-12">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-zinc-400">You're in ✅</p>
            </div>
            <button
              onClick={logout}
              className="text-sm text-zinc-400 hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* User Card */}
          {user && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Logged in as</p>
              <div className="flex items-center gap-3">
                {user.avatar_url && (
                  <img src={user.avatar_url} className="w-10 h-10 rounded-full" alt="avatar" />
                )}
                <div>
                  <p className="text-white font-semibold">{user.full_name}</p>
                  <p className="text-zinc-400 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="pt-1 flex gap-2">
                <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 
                                 rounded-full px-2.5 py-0.5">
                  {user.auth_provider}
                </span>
                {user.is_verified && (
                  <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 
                                   rounded-full px-2.5 py-0.5">
                    verified
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Test Endpoints */}
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Test Endpoints</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">GET /api/ping</p>
                  <p className="text-xs text-zinc-500">Public endpoint</p>
                </div>
                <button
                  onClick={testPing}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 
                             rounded-lg px-3 py-1.5 transition-colors"
                >
                  Fire
                </button>
              </div>
              {pingResult && (
                <pre className="text-xs text-emerald-400 bg-zinc-950 rounded-lg p-3 overflow-auto">
                  {pingResult}
                </pre>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">GET /api/protected</p>
                  <p className="text-xs text-zinc-500">Auth-gated endpoint</p>
                </div>
                <button
                  onClick={testProtected}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 
                             rounded-lg px-3 py-1.5 transition-colors"
                >
                  Fire
                </button>
              </div>
              {protectedResult && (
                <pre className="text-xs text-emerald-400 bg-zinc-950 rounded-lg p-3 overflow-auto">
                  {protectedResult}
                </pre>
              )}
            </div>
          </div>

        </div>
      </main>
    </ProtectedRoute>
  );
}
```

---

### `app/page.tsx` — Root Redirect

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/login");
}
```

---

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"], // Google profile pictures
  },
};

export default nextConfig;
```

---

## 🔌 Frontend ↔ Backend Connection Map

| Frontend Action | What Happens |
|---|---|
| Click **Sign up** | `POST /auth/signup` → get JWT → save to cookie → redirect `/dashboard` |
| Click **Sign in** | `POST /auth/login` → get JWT → save to cookie → redirect `/dashboard` |
| Click **Sign in with Google** | Browser navigates to `/auth/google` on backend → Google OAuth → backend callback → redirect to `/callback?token=…` → save JWT → redirect `/dashboard` |
| Load `/dashboard` | `GET /api/me` with JWT in header → hydrate user state |
| Click **Sign out** | Clear cookie → redirect `/login` |
| Click **Fire** (ping) | `GET /api/ping` → show JSON response inline |
| Click **Fire** (protected) | `GET /api/protected` with JWT → show JSON response inline |

---

## 🚀 Running Both Together

```bash
# Terminal 1 — Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:3000
```

---

## ✅ Google OAuth — One Change Needed in Backend

In `backend/app/routers/auth.py`, update the Google callback to redirect to the frontend instead of returning JSON:

```python
# BEFORE (testing only)
return result

# AFTER (connect to frontend)
return RedirectResponse(
    f"{settings.FRONTEND_URL}/callback?token={result['access_token']}"
)
```

Make sure `FRONTEND_URL=http://localhost:3000` is set in your backend `.env`.

Also add `http://localhost:3000/callback` to the **Authorized redirect URIs** in Google Cloud Console.

---

## 🧩 Hackathon Tips

- **Token storage** — using a cookie (not localStorage) so it survives page refreshes without any extra work.
- **Add a new protected page** — just wrap it in `<ProtectedRoute>`. Done.
- **Add a new API call** — add one function to `lib/api.ts`. That's it.
- **CORS** — backend is wide open in dev, so no config needed. If you deploy separately, set `NEXT_PUBLIC_API_URL` to the live backend URL.
- **Avatar** — Google users get a profile pic automatically. Local users get `null` — add a default avatar fallback if you need one.

---

> Plug into the FastAPI backend, run both, and your auth flow is live in under 5 minutes. 🏆