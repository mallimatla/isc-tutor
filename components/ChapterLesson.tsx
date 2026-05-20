"use client";

import { useState, useEffect } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import SpeakButton from "@/components/SpeakButton";
import ShareableCard from "@/components/ShareableCard";
import { apiFetch } from "@/lib/api-client";
import { getPremiumViz } from "@/lib/premium-visualizations";
import { getChapterTheme } from "@/lib/chapter-theme";

interface NarrativeBeat {
  title: string;
  body: string;
  diagramHint: string | null;
}

interface CommonMistake {
  mistake: string;
  whyItHappens: string;
  howToAvoid: string;
}

interface LessonData {
  narrative: {
    hook: string;
    narrativeBeats: NarrativeBeat[];
    commonMistakes: CommonMistake[];
    keyTakeaway: string;
  };
  visualization: {
    title: string;
    interactionHint: string;
    html: string;
  };
  heroImageBase64?: string;
  heroImageMimeType?: string;
}

interface ChapterLessonProps {
  chapterId: string;
  classLevel: string;
  chapterLabel?: string;
  onGotIt: () => void;
}

const BEAT_ICONS = ["💡", "🎯", "📐", "⚡", "🧠", "🔑"];

export default function ChapterLesson({
  chapterId,
  classLevel,
  chapterLabel,
  onGotIt,
}: ChapterLessonProps) {
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = getChapterTheme(chapterId);
  const PremiumViz = getPremiumViz(chapterId);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch<LessonData>("/api/chapter-lesson", {
      method: "POST",
      body: JSON.stringify({ chapterId, classLevel }),
    })
      .then(setLesson)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load lesson.")
      )
      .finally(() => setLoading(false));
  }, [chapterId, classLevel]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-blue-400" />
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-blue-400" style={{ animationDelay: "0.15s" }} />
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-blue-400" style={{ animationDelay: "0.3s" }} />
        </div>
        <p className="text-sm text-zinc-500">Preparing your visual lesson...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button onClick={onGotIt} className="text-sm text-zinc-500 underline hover:text-zinc-700">Skip to practice</button>
      </div>
    );
  }

  if (!lesson) return null;

  const { narrative, visualization } = lesson;
  const label = chapterLabel || chapterId;

  return (
    <div className="flex flex-col gap-8">
      {/* HERO BANNER */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} p-6 sm:p-8`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          {lesson.heroImageBase64 ? (
            <img
              src={`data:${lesson.heroImageMimeType || "image/png"};base64,${lesson.heroImageBase64}`}
              alt={label}
              className="h-40 w-40 rounded-2xl object-cover shadow-lg sm:h-48 sm:w-48"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm sm:h-48 sm:w-48">
              <svg viewBox="0 0 80 80" className="h-20 w-20 opacity-60">
                <circle cx="40" cy="40" r="30" fill="none" stroke="white" strokeWidth="2" />
                <path d="M25 55 L40 25 L55 55" fill="none" stroke="white" strokeWidth="2" />
                <circle cx="40" cy="20" r="3" fill="white" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">{label}</h2>
            <p className="text-base leading-relaxed text-white/90 sm:text-lg">{narrative.hook}</p>
            <div className="mt-3">
              <SpeakButton text={narrative.hook} label="Listen" />
            </div>
          </div>
        </div>
      </div>

      {/* VISUALIZATION */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Try it</h3>
          {visualization.interactionHint && visualization.interactionHint !== "Interactive visualization unavailable" && (
            <span className="text-xs text-slate-500">{visualization.interactionHint}</span>
          )}
        </div>
        {PremiumViz ? (
          <PremiumViz />
        ) : visualization.html && visualization.html.length > 100 ? (
          <iframe
            sandbox="allow-scripts"
            srcDoc={visualization.html}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700"
            style={{ minHeight: 400 }}
            title={visualization.title}
          />
        ) : (
          <div className={`flex items-center justify-center rounded-3xl bg-gradient-to-br ${theme.gradient} p-12`}>
            <div className="text-center">
              <div className="mb-3 text-4xl opacity-30">📐</div>
              <p className="text-sm text-white/70">Interactive demo coming soon</p>
            </div>
          </div>
        )}
      </div>

      {/* NARRATIVE BEATS */}
      <div className="flex flex-col gap-5">
        {narrative.narrativeBeats.map((beat, idx) => (
          <div key={idx} className={`rounded-2xl border border-${theme.accent} bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/70`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                <span className="mr-2">{BEAT_ICONS[idx % BEAT_ICONS.length]}</span>
                {beat.title}
              </h4>
              <SpeakButton text={beat.body} />
            </div>
            <div className="text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
              <LatexRenderer text={beat.body} />
            </div>
          </div>
        ))}
      </div>

      {/* COMMON MISTAKES */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
        <h4 className="mb-4 text-base font-bold text-amber-800 dark:text-amber-300">
          ⚠️ Watch out for these
        </h4>
        <div className="flex flex-col gap-4">
          {narrative.commonMistakes.map((m, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">❌ {m.mistake}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">{m.whyItHappens}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">✅ {m.howToAvoid}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KEY TAKEAWAY */}
      <div className="py-4 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">The one thing to remember</p>
        <p className={`text-xl font-bold leading-relaxed bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent sm:text-2xl`}>
          <LatexRenderer text={narrative.keyTakeaway} />
        </p>
        <div className="mt-2">
          <SpeakButton text={narrative.keyTakeaway} />
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          onClick={onGotIt}
          className={`rounded-full bg-gradient-to-r ${theme.gradient} px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl`}
        >
          Got it, let me practice
        </button>
        <ShareableCard
          chapterLabel={label}
          keyTakeaway={narrative.keyTakeaway}
          commonMistakes={narrative.commonMistakes}
          themeGradient={theme.gradient}
        />
        <button onClick={onGotIt} className="text-xs text-zinc-400 hover:text-zinc-600">
          Skip to practice without learning
        </button>
      </div>
    </div>
  );
}
