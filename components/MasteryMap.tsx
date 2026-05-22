"use client";

import { useState, useEffect, type CSSProperties } from "react";
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
  learningOpened?: Record<string, string>;
}

/**
 * Display-only state, layered on top of the practice-based mastery from
 * lib/mastery.ts. The underlying `status` field is never overwritten — this
 * function only decides what badge/colour/label to show.
 */
type DisplayState = "mastered" | "practicing" | "learning" | "untouched";

interface DisplayInfo {
  state: DisplayState;
  /** 0–100; controls the progress-bar fill. */
  progress: number;
  /** Short status label that appears on the card. */
  label: string;
  /** Short detail string, e.g. "12 questions · 75%". */
  detail: string;
}

const LEARNING_PROGRESS = 15;

function deriveDisplay(
  ch: ChapterMastery,
  learningOpened: Record<string, string>
): DisplayInfo {
  if (ch.status === "mastered") {
    return {
      state: "mastered",
      progress: 100,
      label: "Mastered",
      detail: `${ch.questionsAttempted} questions · ${ch.accuracy}%`,
    };
  }
  if (ch.status === "practicing") {
    return {
      state: "practicing",
      progress: Math.max(8, Math.min(100, ch.accuracy)),
      label: `Practicing · ${ch.accuracy}%`,
      detail: `${ch.questionsAttempted} ${ch.questionsAttempted === 1 ? "question" : "questions"}`,
    };
  }
  // Untouched in practice — check the engagement signal.
  const key = `${ch.classLevel}-${ch.chapterId}`;
  if (learningOpened[key]) {
    return {
      state: "learning",
      progress: LEARNING_PROGRESS,
      label: "Learning",
      detail: "Lesson opened",
    };
  }
  return {
    state: "untouched",
    progress: 0,
    label: "Not started",
    detail: "Tap to begin",
  };
}

function StatusDot({
  state,
  hex,
}: {
  state: DisplayState;
  hex: { primary: string };
}) {
  if (state === "mastered") {
    return (
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: "#10b981" }}
      />
    );
  }
  if (state === "practicing" || state === "learning") {
    return (
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: hex.primary }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 rounded-full bg-slate-300"
    />
  );
}

function ChapterTile({
  ch,
  display,
  index,
  onClick,
}: {
  ch: ChapterMastery;
  display: DisplayInfo;
  index: number;
  onClick: () => void;
}) {
  const theme = getChapterTheme(ch.chapterId);
  const isMastered = display.state === "mastered";
  const isUntouched = display.state === "untouched";

  // Progress bar fill colour: emerald for mastered, the chapter accent gradient
  // for everything else. Empty (untouched) shows just the slate-100 track.
  const fillBackground = isMastered
    ? "linear-gradient(90deg, #10b981, #34d399)"
    : `linear-gradient(90deg, ${theme.hex.primary}, ${theme.hex.secondary})`;

  // Stagger inline custom property — globals.css reads `--i`.
  const style: CSSProperties = {
    ["--i" as keyof CSSProperties as string]: String(index),
  } as CSSProperties;

  return (
    <button
      onClick={onClick}
      style={style}
      className="group relative flex animate-stagger flex-col gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all duration-200 active:scale-[0.99] hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
    >
      {isMastered && (
        <span
          aria-hidden
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white"
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
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm transition-transform group-hover:scale-105"
          style={{
            background: isUntouched
              ? `linear-gradient(135deg, ${theme.hex.primary}, ${theme.hex.secondary})`
              : `linear-gradient(135deg, ${theme.hex.primary}, ${theme.hex.secondary})`,
            opacity: isUntouched ? 0.55 : 1,
          }}
        >
          {ch.chapterLabel.charAt(0)}
        </span>
        <div className="min-w-0 flex-1 pr-2">
          <p className="truncate text-sm font-semibold leading-tight text-slate-900">
            {ch.chapterLabel}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {display.detail}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div
        aria-hidden
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
      >
        {display.progress > 0 && (
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${display.progress}%`,
              background: fillBackground,
            }}
          />
        )}
      </div>

      {/* Status pill — small, never noisy */}
      <div className="flex items-center gap-1.5">
        <StatusDot state={display.state} hex={theme.hex} />
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{
            color:
              display.state === "mastered"
                ? "#047857"
                : display.state === "untouched"
                  ? "#94a3b8"
                  : theme.hex.primary,
          }}
        >
          {display.label}
        </span>
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

function SectionHeading({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </h3>
      <span className="text-xs font-medium text-slate-400">
        · {count} {count === 1 ? "chapter" : "chapters"}
      </span>
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
            <div key={n} className="skeleton-shimmer h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const learningOpened = data.learningOpened ?? {};
  const class11 = data.chapters.filter((c) => c.classLevel === "11");
  const class12 = data.chapters.filter((c) => c.classLevel === "12");
  const started =
    data.totalMastered +
    data.totalPracticing +
    // Chapters with a lesson-opened ping but no practice yet.
    Object.keys(learningOpened).filter((k) => {
      const ch = data.chapters.find(
        (c) => `${c.classLevel}-${c.chapterId}` === k
      );
      return ch && ch.status === "untouched";
    }).length;

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
          <SectionHeading label="Class 11" count={class11.length} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {class11.map((ch, idx) => {
              const display = deriveDisplay(ch, learningOpened);
              return (
                <ChapterTile
                  key={ch.chapterId}
                  ch={ch}
                  display={display}
                  index={idx}
                  onClick={() => handleClick(ch)}
                />
              );
            })}
          </div>
        </div>

        <div>
          <SectionHeading label="Class 12" count={class12.length} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {class12.map((ch, idx) => {
              const display = deriveDisplay(ch, learningOpened);
              return (
                <ChapterTile
                  key={ch.chapterId}
                  ch={ch}
                  display={display}
                  index={idx}
                  onClick={() => handleClick(ch)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
