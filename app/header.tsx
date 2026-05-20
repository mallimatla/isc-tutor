"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";

export default function Header() {
  const pathname = usePathname();
  const isSignIn = pathname === "/signin";

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-2.5 dark:border-zinc-800">
      <Link href="/">
        <Logo size={28} />
      </Link>
      {!isSignIn && <UserMenu />}
    </header>
  );
}
