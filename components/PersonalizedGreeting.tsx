"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import TopicPicker from "@/components/TopicPicker";

interface GreetingData {
  greeting: string;
  recommendedAction: {
    type: "revisit_weakness" | "continue_chapter" | "new_chapter" | "first_visit";
    chapterId: string | null;
    reasoning: string;
  };
}

export default function PersonalizedGreeting() {
  const router = useRouter();
  const [data, setData] = useState<GreetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    apiFetch<GreetingData>("/api/greeting", { method: "POST" })
      .then(setData)
      .catch(() => {
        setShowPicker(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRecommendedAction = () => {
    if (!data?.recommendedAction.chapterId) {
      setShowPicker(true);
      return;
    }
    router.push(
      `/practice?subject=mathematics&class=11&chapterId=${data.recommendedAction.chapterId}`
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton-shimmer h-10 w-2/3 rounded-lg" />
        <div className="skeleton-shimmer h-5 w-full rounded" />
        <div className="skeleton-shimmer h-5 w-3/4 rounded" />
      </div>
    );
  }

  if (showPicker && !data) {
    return <TopicPicker />;
  }

  const ctaLabel =
    data?.recommendedAction.type === "revisit_weakness"
      ? "Revisit this topic"
      : data?.recommendedAction.type === "continue_chapter"
        ? "Continue practicing"
        : data?.recommendedAction.type === "new_chapter"
          ? "Try this chapter"
          : "Pick a chapter";

  return (
    <div className="space-y-8">
      {data && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Today
          </p>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
            {data.greeting}
          </h1>
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
        {data?.recommendedAction.chapterId && (
          <button
            onClick={handleRecommendedAction}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:bg-indigo-500 hover:shadow"
          >
            {ctaLabel}
            <span aria-hidden className="ml-2">→</span>
          </button>
        )}

        <button
          onClick={() => setShowPicker((s) => !s)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition active:scale-95 hover:border-slate-300 hover:bg-slate-50"
        >
          {showPicker ? "Hide chapters" : "Browse all chapters"}
        </button>
      </div>

      {showPicker && (
        <div className="animate-fade-up border-t border-slate-100 pt-8">
          <TopicPicker />
        </div>
      )}
    </div>
  );
}
