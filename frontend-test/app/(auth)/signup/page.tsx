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

    // Client-side guardrails
    const name = form.full_name.trim();
    if (name.length < 1 || name.length > 100) {
      setError("Full name must be between 1 and 100 characters.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password.length > 64) {
      setError("Password must be at most 64 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiSignup({ ...form, full_name: name });
      setToken(res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(", "));
      } else {
        setError(detail || "Signup failed. Try again.");
      }
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
                maxLength={100}
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
                maxLength={64}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="8–64 characters"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm 
                           rounded-lg px-3 py-2.5 outline-none 
                           focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
              />
              <p className="text-[10px] text-zinc-600">8–64 characters</p>
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
