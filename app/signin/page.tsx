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
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-3">
        <Logo size={56} showText={false} />
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          ISC Tutor
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Practice ISC Class 11 &amp; 12 Mathematics. Adaptive, AI-powered.
        </p>
      </div>

      <button
        onClick={signIn}
        className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Sign in with Google
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
}
