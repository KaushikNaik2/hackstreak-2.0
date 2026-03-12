"use client";
import { triggerGoogleLogin } from "@/lib/api";

export default function GoogleButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  return (
    <button
      onClick={triggerGoogleLogin}
      className="w-full flex items-center justify-center gap-3 border border-slate-700/50 
                 bg-slate-800/30 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 
                 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-200"
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path
          fill="#4285F4"
          d="M44.5 20H24v8.5h11.7C34.2 33.6 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l6-6C34.3 6.5 29.4 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c11 0 20.5-8 20.5-20.5 0-1.4-.1-2.7-.5-5z"
        />
        <path
          fill="#34A853"
          d="M6.3 15.6l7 5.1C15 17 19.2 14.5 24 14.5c3 0 5.7 1.1 7.8 2.9l6-6C34.3 6.5 29.4 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 11.1z"
        />
        <path
          fill="#FBBC05"
          d="M24 45.5c5.3 0 10.1-1.9 13.8-5l-6.4-5.3C29.4 37 26.8 38 24 38c-5.6 0-10.3-3.8-11.9-8.9l-6.9 5.3C8.8 41.5 15.9 45.5 24 45.5z"
        />
        <path
          fill="#EA4335"
          d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.3-4.3 5.7l6.4 5.3c3.8-3.5 6.2-8.7 6.2-14.5 0-1.4-.1-2.7-.5-5z"
        />
      </svg>
      {label}
    </button>
  );
}
