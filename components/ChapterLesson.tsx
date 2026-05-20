"use client";

import { useState, useEffect } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import SpeakButton from "@/components/SpeakButton";
import { apiFetch } from "@/lib/api-client";

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
}

interface ChapterLessonProps {
  chapterId: string;
  classLevel: string;
  onGotIt: () => void;
}

export default function ChapterLesson({
  chapterId,
  classLevel,
  onGotIt,
}: ChapterLessonProps) {
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          <span
            className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
        <p className="text-sm text-zinc-500">
          Preparing your visual lesson...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={onGotIt}
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          Skip to practice
        </button>
      </div>
    );
  }

  if (!lesson) return null;

  const { narrative, visualization } = lesson;

  return (
    <div className="flex flex-col gap-8">
      {/* Hook */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-xl leading-relaxed text-zinc-800 dark:text-zinc-200">
          {narrative.hook}
        </p>
        <SpeakButton text={narrative.hook} />
      </div>

      {/* Interactive visualization */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {visualization.title}
        </h3>
        <iframe
          sandbox="allow-scripts"
          srcDoc={visualization.html}
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700"
          style={{ minHeight: 400 }}
          title={visualization.title}
        />
        <p className="text-xs text-zinc-500">{visualization.interactionHint}</p>
      </div>

      {/* Narrative beats */}
      <div className="flex flex-col gap-5">
        {narrative.narrativeBeats.map((beat, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {beat.title}
              </h4>
              <SpeakButton text={beat.body} />
            </div>
            <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              <LatexRenderer text={beat.body} />
            </div>
          </div>
        ))}
      </div>

      {/* Common mistakes */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950">
        <h4 className="mb-3 text-sm font-semibold text-amber-800 dark:text-amber-300">
          Common Mistakes
        </h4>
        <div className="flex flex-col gap-3">
          {narrative.commonMistakes.map((m, idx) => (
            <div key={idx} className="text-sm text-amber-900 dark:text-amber-200">
              <p className="font-medium">{m.mistake}</p>
              <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                Why: {m.whyItHappens}
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                Fix: {m.howToAvoid}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key takeaway */}
      <div className="flex items-start justify-between gap-3 border-l-4 border-blue-500 pl-4">
        <p className="text-lg font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
          <LatexRenderer text={narrative.keyTakeaway} />
        </p>
        <SpeakButton text={narrative.keyTakeaway} />
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          onClick={onGotIt}
          className="rounded-lg bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Got it, let me practice
        </button>
        <button
          onClick={onGotIt}
          className="text-xs text-zinc-400 hover:text-zinc-600"
        >
          Skip to practice without learning
        </button>
      </div>
    </div>
  );
}
