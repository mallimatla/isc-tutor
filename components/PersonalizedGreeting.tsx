"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

interface GreetingData {
  greeting: string;
  recommendedAction: {
    type: "revisit_weakness" | "continue_chapter" | "new_chapter" | "first_visit";
    chapterId: string | null;
    reasoning: string;
  };
}

/**
 * Trim a long greeting to a single short sentence for the compact header line.
 * The full greeting is still available via the underlying `title` attribute,
 * so screen readers and curious users can hover/inspect it.
 */
function firstSentence(text: string, maxChars = 140): string {
  if (!text) return "";
  const trimmed = text.trim();
  // Split on the first sentence-end (., !, ?). If none found, fall back to a
  // soft length cap.
  const match = trimmed.match(/^[\s\S]+?[.!?](?=\s|$)/);
  let out = match ? match[0] : trimmed;
  if (out.length > maxChars) {
    out = out.slice(0, maxChars).trimEnd() + "…";
  }
  return out;
}

export default function PersonalizedGreeting() {
  const router = useRouter();
  const [data, setData] = useState<GreetingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<GreetingData>("/api/greeting", { method: "POST" })
      .then(setData)
      .catch(() => {
        // Silent: the chapter grid below the greeting is the real entry point.
        // A failed greeting just means we render nothing here.
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="skeleton-shimmer h-6 w-16 rounded-full" />
        <div className="skeleton-shimmer h-5 flex-1 max-w-xl rounded" />
      </div>
    );
  }

  if (!data) return null;

  const handleResume = () => {
    if (!data.recommendedAction.chapterId) return;
    router.push(
      `/practice?subject=mathematics&class=11&chapterId=${data.recommendedAction.chapterId}`
    );
  };

  const compactGreeting = firstSentence(data.greeting);
  const ctaLabel =
    data.recommendedAction.type === "revisit_weakness"
      ? "Revisit"
      : data.recommendedAction.type === "continue_chapter"
        ? "Continue"
        : data.recommendedAction.type === "new_chapter"
          ? "Open"
          : "Pick";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span
        aria-hidden
        className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-700"
      >
        <span className="text-sm leading-none">👋</span>
        Today
      </span>
      <p
        title={data.greeting}
        className="line-clamp-1 flex-1 min-w-0 text-sm text-slate-600 sm:text-base"
      >
        {compactGreeting}
      </p>
      {data.recommendedAction.chapterId && (
        <button
          onClick={handleResume}
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition active:scale-95 hover:bg-indigo-500 hover:shadow"
        >
          {ctaLabel}
          <span aria-hidden>→</span>
        </button>
      )}
    </div>
  );
}
