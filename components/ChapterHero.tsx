"use client";
import { useState, useEffect } from "react";
import SpeakButton from "@/components/SpeakButton";
import LatexRenderer from "@/components/LatexRenderer";
import { getChapterHook } from "@/lib/chapter-hooks";

interface Props {
  chapterId: string;
  label: string;
  hookText: string;
  syllabusCoverage: string[];
  themeGradient: string;
  heroImageBase64: string | null;
  heroImageMimeType: string | null;
}

export default function ChapterHero({ chapterId, label, hookText, syllabusCoverage, themeGradient, heroImageBase64, heroImageMimeType }: Props) {
  const hook = getChapterHook(chapterId);
  const [statShown, setStatShown] = useState(false);
  const [storyIdx, setStoryIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setStatShown(true), 250);
    return () => clearTimeout(t);
  }, []);

  const heroSrc = heroImageBase64 && heroImageMimeType ? `data:${heroImageMimeType};base64,${heroImageBase64}` : null;

  return (
    <div className="flex flex-col gap-4">
      {/* === ATTENTION-GRAB HERO === */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${themeGradient} p-6 sm:p-8`}>
        {heroSrc ? (
          <>
            <div className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${heroSrc})` }} />
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${themeGradient} opacity-75`} />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/15 blur-3xl" />
          </>
        )}

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          {hook && (
            <div className="flex h-28 w-full max-w-[180px] flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 p-2 backdrop-blur-sm">
              {hook.miniViz}
            </div>
          )}
          <div className="flex-1">
            <div className="mb-1.5 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <span>{hook?.icon ?? "📘"}</span>
              <span>Chapter</span>
            </div>
            <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">{label}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
              <LatexRenderer text={hookText} />
            </p>
            <div className="mt-2">
              <SpeakButton text={hookText} label="Listen" />
            </div>
          </div>
        </div>
      </div>

      {/* === MIND-BLOW STAT === */}
      {hook && (
        <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🤯</div>
            <div className="flex-1">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">Did you know?</div>
              <div className={`font-mono text-2xl font-bold text-amber-700 transition-all duration-700 sm:text-3xl ${statShown ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}>
                {hook.mindBlow.stat}
              </div>
              <div className="mt-1 text-sm leading-relaxed text-amber-900">{hook.mindBlow.label}</div>
            </div>
          </div>
        </div>
      )}

      {/* === STORY STRIP — Tap-through cards === */}
      {hook && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">The Big Idea — tap through</div>
            <div className="flex gap-1">
              {hook.storyStrip.map((_, i) => (
                <button key={i} onClick={() => setStoryIdx(i)} className={"h-1.5 rounded-full transition-all " + (i === storyIdx ? "w-6 bg-slate-800" : "w-2 bg-zinc-300")} aria-label={`Slide ${i + 1}`} />
              ))}
            </div>
          </div>
          <button
            onClick={() => setStoryIdx((i) => (i + 1) % hook.storyStrip.length)}
            className="w-full rounded-xl bg-gradient-to-br from-slate-50 to-zinc-50 p-5 text-left transition active:scale-[0.98] dark:from-zinc-800 dark:to-zinc-900"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-3xl">{hook.storyStrip[storyIdx].emoji}</span>
              <span className="text-lg font-bold text-slate-800 dark:text-zinc-100">{hook.storyStrip[storyIdx].title}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-zinc-300">{hook.storyStrip[storyIdx].text}</p>
            <div className="mt-3 text-right text-xs text-slate-400">tap → next</div>
          </button>
        </div>
      )}

      {/* === WHERE YOU SEE IT — real-world chips === */}
      {hook && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{"Where you'll spot this in real life"}</div>
          <div className="flex flex-wrap gap-2">
            {hook.realWorld.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-blue-50 to-violet-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:scale-105 dark:from-blue-900/30 dark:to-violet-900/30 dark:text-zinc-200">
                <span className="text-base">{r.emoji}</span>
                <span>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === SYLLABUS COVERAGE === */}
      {syllabusCoverage && syllabusCoverage.length > 0 && (
        <details className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <summary className="cursor-pointer list-none p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {"What you'll learn ▾"}
          </summary>
          <div className="flex flex-wrap gap-1.5 border-t border-zinc-100 p-4 dark:border-zinc-800">
            {syllabusCoverage.map((s, i) => (
              <span key={i} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {s}
              </span>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
