"use client";

import AuthGate from "@/components/AuthGate";
import PersonalizedGreeting from "@/components/PersonalizedGreeting";
import MasteryMap from "@/components/MasteryMap";

export default function HomePage() {
  return (
    <AuthGate>
      <div className="flex flex-1 flex-col px-4 py-6 sm:py-8">
        <div className="mx-auto w-full max-w-3xl space-y-6 sm:space-y-7">
          <section className="animate-fade-up">
            <PersonalizedGreeting />
          </section>
          <section className="animate-fade-up-delay-1">
            <MasteryMap />
          </section>
        </div>
      </div>
    </AuthGate>
  );
}
