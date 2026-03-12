"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiSignup } from "@/lib/api";
import { setToken } from "@/lib/auth";
import GoogleButton from "@/components/GoogleButton";
import {
  Activity,
  Mail,
  Lock,
  User,
  ArrowRight,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

const roles = [
  {
    id: "doctor",
    label: "Doctor",
    icon: Stethoscope,
    desc: "Clinical access & patient records",
  },
  {
    id: "admin",
    label: "Admin",
    icon: ShieldCheck,
    desc: "Full system administration",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "doctor",
  });
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
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-mesh">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-transparent to-emerald-900/30" />
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [15, -15, 15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-16 h-16 rounded-2xl gradient-teal flex items-center justify-center mx-auto mb-6 glow-teal">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-white mb-3">
            Join Vitalix
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            Create your account to access powerful healthcare surveillance tools
            and intelligent patient management features.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 space-y-3 text-left max-w-xs mx-auto">
            {[
              "Real-time outbreak surveillance",
              "3D anatomy visualization",
              "AI-powered health insights",
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                </div>
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right signup form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold font-[family-name:var(--font-outfit)]">
              Vitalix
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white tracking-tight">
              Create account
            </h1>
            <p className="text-sm text-slate-400">
              Get started with Vitalix Healthcare
            </p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <GoogleButton label="Sign up with Google" />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-700/50" />
              <span className="text-xs text-slate-500">
                or continue with email
              </span>
              <div className="h-px flex-1 bg-slate-700/50" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Role selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setForm({ ...form, role: role.id })}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all duration-200 ${
                        form.role === role.id
                          ? "border-teal-500/50 bg-teal-500/10 text-teal-300"
                          : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600/50"
                      }`}
                    >
                      <role.icon className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium">{role.label}</p>
                        <p className="text-[10px] opacity-60">{role.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                    placeholder="Dr. Jane Smith"
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm 
                               rounded-lg pl-10 pr-3 py-2.5 outline-none 
                               focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="doctor@vitalix.health"
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm 
                               rounded-lg pl-10 pr-3 py-2.5 outline-none 
                               focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Min 8 characters"
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm 
                               rounded-lg pl-10 pr-3 py-2.5 outline-none 
                               focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 
                              rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 
                           hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 
                           text-white text-sm font-semibold rounded-lg py-2.5 
                           transition-all duration-300 mt-1 shadow-lg shadow-teal-500/10"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-teal-400 hover:text-teal-300 transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
