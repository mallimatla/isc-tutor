"use client";

import { usePathname } from "next/navigation";
import UserMenu from "@/components/UserMenu";

export default function Header() {
  const pathname = usePathname();
  const isSignIn = pathname === "/signin";

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
      <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        ISC Tutor
      </span>
      {!isSignIn && <UserMenu />}
    </header>
  );
}
