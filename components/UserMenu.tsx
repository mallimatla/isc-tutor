"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";
import { useIsAdmin } from "@/lib/use-is-admin";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const isAdminUser = useIsAdmin();
  const router = useRouter();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.replace("/signin");
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {isAdminUser && (
        <Link
          href="/admin"
          className="hidden text-sm font-medium text-slate-500 transition hover:text-slate-900 sm:inline"
        >
          Admin
        </Link>
      )}
      <button
        onClick={handleSignOut}
        className="hidden text-sm font-medium text-slate-500 transition hover:text-slate-900 sm:inline"
      >
        Sign out
      </button>
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-1 py-1 shadow-sm">
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt=""
            width={28}
            height={28}
            className="rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {(user.displayName ?? "U").slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="pr-2 text-sm font-medium text-slate-700">
          {(user.displayName ?? "").split(" ")[0]}
        </span>
      </div>
    </div>
  );
}
