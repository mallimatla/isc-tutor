"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

interface ChapterMastery {
  chapterId: string;
  chapterLabel: string;
  classLevel: "11" | "12";
  status: "mastered" | "practicing" | "untouched";
  questionsAttempted: number;
  accuracy: number;
  lastPracticed: string | null;
}

interface MasteryData {
  chapters: ChapterMastery[];
  totalMastered: number;
  totalPracticing: number;
  totalChapters: number;
}

const statusStyles = {
  mastered:
    "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
  practicing:
    "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
  untouched:
    "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900",
};

const statusDot = {
  mastered: "bg-green-500",
  practicing: "bg-amber-500",
  untouched: "bg-zinc-300 dark:bg-zinc-600",
};

export default function MasteryMap() {
  const router = useRouter();
  const [data, setData] = useState<MasteryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<MasteryData>("/api/mastery")
      .then(setData)
      .catch(() => {
        // Silently fail — mastery map is secondary
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-12 w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700"
          />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const class11 = data.chapters.filter((c) => c.classLevel === "11");
  const class12 = data.chapters.filter((c) => c.classLevel === "12");

  const handleClick = (ch: ChapterMastery) => {
    router.push(
      `/practice?subject=mathematics&class=${ch.classLevel}&chapterId=${ch.chapterId}`
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Your Progress
        </h2>
        <span className="text-xs text-zinc-500">
          {data.totalMastered} of {data.totalChapters} mastered
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Class 11 */}
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Class 11
          </h3>
          <div className="flex flex-col gap-1.5">
            {class11.map((ch) => (
              <button
                key={ch.chapterId}
                onClick={() => handleClick(ch)}
                className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors hover:shadow-sm ${statusStyles[ch.status]}`}
              >
                <span
                  className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${statusDot[ch.status]}`}
                />
                <span className="flex-1 text-xs text-zinc-800 dark:text-zinc-200">
                  {ch.chapterLabel}
                </span>
                {ch.questionsAttempted > 0 && (
                  <span className="text-[10px] text-zinc-400">
                    {ch.questionsAttempted}q · {ch.accuracy}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Class 12 */}
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Class 12
          </h3>
          <div className="flex flex-col gap-1.5">
            {class12.map((ch) => (
              <button
                key={ch.chapterId}
                onClick={() => handleClick(ch)}
                className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors hover:shadow-sm ${statusStyles[ch.status]}`}
              >
                <span
                  className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${statusDot[ch.status]}`}
                />
                <span className="flex-1 text-xs text-zinc-800 dark:text-zinc-200">
                  {ch.chapterLabel}
                </span>
                {ch.questionsAttempted > 0 && (
                  <span className="text-[10px] text-zinc-400">
                    {ch.questionsAttempted}q · {ch.accuracy}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
