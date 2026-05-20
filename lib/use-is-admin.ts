"use client";

import { useAuth } from "@/lib/use-auth";

const DEFAULT_ADMIN_EMAILS = "mallimatla@gmail.com";

function getAdminEmails(): Set<string> {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS;
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  if (!user?.email) return false;
  return getAdminEmails().has(user.email.toLowerCase());
}
