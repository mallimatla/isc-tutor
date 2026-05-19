"use client";

import AuthGate from "@/components/AuthGate";
import { useAuth } from "@/lib/use-auth";

function HomeContent() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Welcome, {user?.displayName}.
      </h1>
      <p className="text-sm italic text-zinc-500">
        Topic picker coming in the next phase.
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGate>
      <HomeContent />
    </AuthGate>
  );
}
