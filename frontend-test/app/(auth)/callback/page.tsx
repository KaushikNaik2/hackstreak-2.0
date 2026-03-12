"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";
import { Suspense } from "react";

function CallbackContent() {
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
    <div className="text-center space-y-3">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent 
                      rounded-full animate-spin mx-auto" />
      <p className="text-sm text-zinc-400">Completing sign in…</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950">
      <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
         <CallbackContent />
      </Suspense>
    </main>
  );
}
