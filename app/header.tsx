"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";

export default function Header() {
  const pathname = usePathname();
  const isSignIn = pathname === "/signin";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full px-1 py-0.5 transition hover:opacity-80"
        >
          <Logo size={26} />
        </Link>
        {!isSignIn && <UserMenu />}
      </div>
    </header>
  );
}
