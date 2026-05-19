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
        // Fallback: show picker directly
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
      <div className="flex flex-col gap-3">
        <div className="h-6 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-6 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
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
    <div className="flex flex-col gap-6">
      {data && (
        <p className="text-xl leading-relaxed text-zinc-800 dark:text-zinc-200">
          {data.greeting}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {data?.recommendedAction.chapterId && (
          <button
            onClick={handleRecommendedAction}
            className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {ctaLabel}
          </button>
        )}

        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          {showPicker ? "Hide chapter picker" : "Pick a different chapter"}
        </button>
      </div>

      {showPicker && (
        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <TopicPicker />
        </div>
      )}
    </div>
  );
}
