"use client";

import { useState, useEffect } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import SpeakButton from "@/components/SpeakButton";
import ShareableCard from "@/components/ShareableCard";
import ChapterHero from "@/components/ChapterHero";
import { apiFetch } from "@/lib/api-client";
import { getPremiumViz } from "@/lib/premium-visualizations";
import { getChapterTheme } from "@/lib/chapter-theme";

interface NarrativeBeat {
  title: string;
  content: string;
}

interface CommonMistake {
  mistake: string;
  why: string;
  fix: string;
}

interface Diagram {
  id: string;
  title: string;
  svg: string;
  caption: string;
  afterBeat: number;
}

interface LessonData {
  chapterId: string;
  classLevel: string;
  lessonId: string;
  promptVersion: string;
  syllabusCoverage: string[];
  hook: string;
  heroImageBase64: string | null;
  heroImageMimeType: string | null;
  diagrams: Diagram[];
  narrative: {
    beats: NarrativeBeat[];
    commonMistakes: CommonMistake[];
    quickReferenceCard: string[];
    keyTakeaway: string;
  };
}

interface LessonResponse {
  lesson: LessonData | null;
  status: "ok" | "not_generated";
}

interface ChapterLessonProps {
  chapterId: string;
  classLevel: string;
  chapterLabel?: string;
  onGotIt: () => void;
}

const BEAT_ICONS = ["💡", "🎯", "📐", "⚡", "🧠", "🔑", "✨", "🚀", "🎓", "🔭", "🧮"];

export default function ChapterLesson({
  chapterId,
  classLevel,
  chapterLabel,
  onGotIt,
}: ChapterLessonProps) {
  const [response, setResponse] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = getChapterTheme(chapterId);
  const PremiumViz = getPremiumViz(chapterId);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch<LessonResponse>("/api/chapter-lesson", {
      method: "POST",
      body: JSON.stringify({ chapterId, classLevel }),
    })
      .then(setResponse)
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
        <p className="text-sm text-zinc-500">Loading your lesson...</p>
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

  const label = chapterLabel || chapterId;

  // Friendly "not generated yet" state — never an error.
  if (!response || !response.lesson || response.status === "not_generated") {
    return (
      <div className="flex flex-col gap-6">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} p-8 sm:p-10`}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/15 blur-3xl" />
          <div className="relative">
            <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">{label}</h2>
            <p className="max-w-lg text-base leading-relaxed text-white/90">
              The illustrated lesson for this chapter is on its way. In the meantime, you can jump straight into practice — the AI tutor will guide you through the concepts as you go.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onGotIt}
            className={`rounded-full bg-gradient-to-r ${theme.gradient} px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl`}
          >
            Start practicing
          </button>
        </div>
      </div>
    );
  }

  const lesson = response.lesson;
  const { narrative, diagrams, hook, syllabusCoverage, heroImageBase64, heroImageMimeType } = lesson;

  // Group diagrams by afterBeat for interleaved rendering.
  const diagramsByBeat = new Map<number, Diagram[]>();
  for (const d of diagrams) {
    const list = diagramsByBeat.get(d.afterBeat) ?? [];
    list.push(d);
    diagramsByBeat.set(d.afterBeat, list);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* PREMIUM INTERACTIVE WIDGET (if registered) — leads the chapter */}
      {PremiumViz && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Try it</h3>
            <span className="text-xs text-slate-500">Interactive demo</span>
          </div>
          <PremiumViz />
        </div>
      )}

      {/* HERO — multi-layer attention-grab */}
      <ChapterHero
        chapterId={chapterId}
        label={label}
        hookText={hook}
        syllabusCoverage={syllabusCoverage}
        themeGradient={theme.gradient}
        heroImageBase64={heroImageBase64}
        heroImageMimeType={heroImageMimeType}
      />

      {/* NARRATIVE BEATS with INTERLEAVED DIAGRAMS */}
      <div className="flex flex-col gap-5">
        {narrative.beats.map((beat, idx) => {
          const diagramsHere = diagramsByBeat.get(idx) ?? [];
          return (
            <div key={idx} className="flex flex-col gap-4">
              <div className={`rounded-2xl border border-${theme.accent} bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/70`}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                    <span className="mr-2">{BEAT_ICONS[idx % BEAT_ICONS.length]}</span>
                    {beat.title}
                  </h4>
                  <SpeakButton text={beat.content} />
                </div>
                <div className="text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
                  <LatexRenderer text={beat.content} />
                </div>
              </div>

              {diagramsHere.map((d) => (
                <div
                  key={d.id}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
                    <h5 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                      {d.title}
                    </h5>
                  </div>
                  <div
                    className="flex w-full items-center justify-center bg-white p-4 dark:bg-zinc-900"
                    dangerouslySetInnerHTML={{ __html: d.svg }}
                  />
                  {d.caption && (
                    <div className="border-t border-zinc-100 px-5 py-3 text-xs leading-relaxed text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                      {d.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
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
              <p className="text-xs text-amber-700 dark:text-amber-400">Why: {m.why}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">✅ {m.fix}</p>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK REFERENCE CARD */}
      {narrative.quickReferenceCard && narrative.quickReferenceCard.length > 0 && (
        <div className={`rounded-2xl bg-gradient-to-br ${theme.gradient} p-6`}>
          <h4 className="mb-4 text-base font-bold text-white">
            Quick Reference Card
          </h4>
          <div className="flex flex-col gap-2">
            {narrative.quickReferenceCard.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-white/20 px-4 py-2.5 font-mono text-sm text-white backdrop-blur-sm"
              >
                <LatexRenderer text={item} />
              </div>
            ))}
          </div>
        </div>
      )}

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
