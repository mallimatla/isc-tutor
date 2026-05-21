"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { getChapterTheme } from "@/lib/chapter-theme";

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

function ChapterTile({
  ch,
  onClick,
}: {
  ch: ChapterMastery;
  onClick: () => void;
}) {
  const theme = getChapterTheme(ch.chapterId);
  const mastered = ch.status === "mastered";
  const practicing = ch.status === "practicing";
  const untouched = ch.status === "untouched";

  // Progress bar fill. For mastered chapters, render full. For practicing,
  // use the recorded accuracy. For untouched, leave empty.
  const progress = mastered ? 100 : practicing ? Math.min(100, ch.accuracy) : 0;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.98] hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
    >
      {mastered && (
        <span
          aria-hidden
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}

      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
          style={{
            background: untouched
              ? "linear-gradient(135deg, #e2e8f0, #cbd5e1)"
              : `linear-gradient(135deg, ${theme.hex.primary}, ${theme.hex.secondary})`,
            opacity: untouched ? 0.85 : 1,
          }}
        >
          {ch.chapterLabel.charAt(0)}
        </span>
        <div className="flex-1 pr-2">
          <p className="text-sm font-semibold leading-tight text-slate-900">
            {ch.chapterLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {untouched
              ? "Not started"
              : `${ch.questionsAttempted} ${ch.questionsAttempted === 1 ? "question" : "questions"} · ${ch.accuracy}%`}
          </p>
        </div>
      </div>

      <div
        aria-hidden
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            background: mastered
              ? "linear-gradient(90deg, #10b981, #34d399)"
              : `linear-gradient(90deg, ${theme.hex.primary}, ${theme.hex.secondary})`,
          }}
        />
      </div>
    </button>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
      <span className="font-bold text-slate-900">{value}</span>{" "}
      <span className="text-slate-500">{label}</span>
    </div>
  );
}

export default function MasteryMap() {
  const router = useRouter();
  const [data, setData] = useState<MasteryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<MasteryData>("/api/mastery")
      .then(setData)
      .catch(() => {
        // Mastery map is secondary; silent failure is OK.
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton-shimmer h-6 w-40 rounded" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="skeleton-shimmer h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const class11 = data.chapters.filter((c) => c.classLevel === "11");
  const class12 = data.chapters.filter((c) => c.classLevel === "12");
  const started = data.totalMastered + data.totalPracticing;

  const handleClick = (ch: ChapterMastery) => {
    router.push(
      `/practice?subject=mathematics&class=${ch.classLevel}&chapterId=${ch.chapterId}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Your progress
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tap a chapter to jump in.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatChip label="started" value={started} />
          <StatChip label="mastered" value={data.totalMastered} />
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Class 11
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {class11.map((ch) => (
              <ChapterTile key={ch.chapterId} ch={ch} onClick={() => handleClick(ch)} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Class 12
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {class12.map((ch) => (
              <ChapterTile key={ch.chapterId} ch={ch} onClick={() => handleClick(ch)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
