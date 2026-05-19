"use client";

import AuthGate from "@/components/AuthGate";
import TopicPicker from "@/components/TopicPicker";

export default function HomePage() {
  return (
    <AuthGate>
      <div className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="mb-1 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            ISC Tutor
          </h1>
          <p className="mb-8 text-center text-sm text-zinc-500">
            Pick a chapter to start practicing
          </p>
          <TopicPicker />
        </div>
      </div>
    </AuthGate>
  );
}
