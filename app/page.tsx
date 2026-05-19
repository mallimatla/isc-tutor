"use client";

import AuthGate from "@/components/AuthGate";
import PersonalizedGreeting from "@/components/PersonalizedGreeting";
import MasteryMap from "@/components/MasteryMap";

export default function HomePage() {
  return (
    <AuthGate>
      <div className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-10">
            <PersonalizedGreeting />
          </div>
          <MasteryMap />
        </div>
      </div>
    </AuthGate>
  );
}
