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
    <div className="flex items-center gap-3">
      {user.photoURL && (
        <Image
          src={user.photoURL}
          alt=""
          width={32}
          height={32}
          className="rounded-full"
          referrerPolicy="no-referrer"
        />
      )}
      <span className="text-sm text-zinc-700 dark:text-zinc-300">
        {user.displayName}
      </span>
      {isAdminUser && (
        <Link
          href="/admin"
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Admin
        </Link>
      )}
      <button
        onClick={handleSignOut}
        className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        Sign out
      </button>
    </div>
  );
}
