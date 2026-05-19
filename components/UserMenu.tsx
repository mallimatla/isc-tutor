"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";

export default function UserMenu() {
  const { user, signOut } = useAuth();
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
      <button
        onClick={handleSignOut}
        className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        Sign out
      </button>
    </div>
  );
}
