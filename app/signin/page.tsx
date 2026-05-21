"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";
import Logo from "@/components/Logo";

export default function SignInPage() {
  const { user, loading, signIn, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up rounded-3xl border border-slate-100 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm">
            <Logo size={32} showText={false} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              ISC Tutor
            </h1>
            <p className="text-sm leading-relaxed text-slate-500">
              Adaptive, AI-powered practice for ISC Class 11 &amp; 12 Mathematics.
            </p>
          </div>
        </div>

        <button
          onClick={signIn}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:bg-indigo-500 hover:shadow"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path
              fill="currentColor"
              d="M21.35 11.1H12v2.8h5.35c-.25 1.6-1.85 4.7-5.35 4.7-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.85 0 3.05.8 3.75 1.45L18 6c-1.2-1.1-2.75-1.85-5.65-1.85C7 4.15 3 8 3 12.7s4 8.55 9.35 8.55c5.4 0 8.95-3.8 8.95-9.15 0-.6-.05-1.05-.15-1.5z"
            />
          </svg>
          Continue with Google
        </button>

        {error && (
          <p className="mt-4 text-center text-sm text-rose-600">
            {error.message}
          </p>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          By signing in, your practice history is saved privately to your account.
        </p>
      </div>
    </div>
  );
}
