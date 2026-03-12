"use client";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiPing, apiProtected } from "@/lib/api";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [protectedResult, setProtectedResult] = useState<string | null>(null);

  const testPing = async () => {
    try {
      const res = await apiPing();
      setPingResult(JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      setPingResult(JSON.stringify(e.response?.data || e.message, null, 2));
    }
  };

  const testProtected = async () => {
    try {
      const res = await apiProtected();
      setProtectedResult(JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      setProtectedResult(JSON.stringify(e.response?.data || e.message, null, 2));
    }
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
