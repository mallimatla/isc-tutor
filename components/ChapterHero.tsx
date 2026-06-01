"use client";
import { useState, useEffect } from "react";
import SpeakButton from "@/components/SpeakButton";
import LatexRenderer from "@/components/LatexRenderer";
import { getChapterHook } from "@/lib/chapter-hooks";
import { latexToUnicode } from "@/lib/latex-to-unicode";

interface Props {
  chapterId: string;
  label: string;
  hookText: string;
  syllabusCoverage: string[];
  themeGradient: string;
  heroImageBase64: string | null;
  heroImageMimeType: string | null;
  quickReferenceCard?: string[];
}

function buildShareMessage(label: string, items: string[]): string {
  const plain = items.map((s, i) => `${i + 1}. ${latexToUnicode(s)}`).join("\n");
  return `📘 *${label} — Quick Reference Card*\n\n${plain}\n\nFrom my ISC Tutor 💡`;
}

export default function ChapterHero({ chapterId, label, hookText, syllabusCoverage, themeGradient, heroImageBase64, heroImageMimeType, quickReferenceCard }: Props) {
  const hook = getChapterHook(chapterId);
  const [statShown, setStatShown] = useState(false);
  const [storyIdx, setStoryIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStatShown(true), 250);
    return () => clearTimeout(t);
  }, []);

  const heroSrc = heroImageBase64 && heroImageMimeType ? `data:${heroImageMimeType};base64,${heroImageBase64}` : null;

  const qrcItems = quickReferenceCard ?? [];
  const hasQRC = qrcItems.length > 0;
  const shareText = hasQRC ? buildShareMessage(label, qrcItems) : "";
  const whatsappHref = hasQRC ? `https://wa.me/?text=${encodeURIComponent(shareText)}` : "#";

  const handleCopy = async () => {
    if (!shareText) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore — share button still works */
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* === ATTENTION-GRAB HERO === */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${themeGradient} p-6 shadow-2xl ring-1 ring-black/5 sm:p-8`}>
        {heroSrc ? (
          <>
            <div className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${heroSrc})` }} />
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${themeGradient} opacity-75`} />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/20 blur-3xl" />
          </>
        )}

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          {hook && (
            <div className="flex h-36 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-xl ring-2 ring-white/40 sm:h-40 sm:w-48">
              {hook.miniViz}
            </div>
          )}
          <div className="flex-1">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-md">
              <span className="text-base">{hook?.icon ?? "📘"}</span>
              <span>Chapter</span>
            </div>
            <h2 className="text-3xl font-bold leading-tight text-white drop-shadow-md sm:text-4xl">{label}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/95 drop-shadow sm:text-base">
              <LatexRenderer text={hookText} />
            </p>
            <div className="mt-3">
              <SpeakButton text={hookText} label="Listen" />
            </div>
          </div>
        </div>
      </div>

      {/* === MIND-BLOW STAT === */}
      {hook && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 p-5 shadow-xl ring-1 ring-amber-400/30">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-300/30 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="text-4xl drop-shadow-sm">🤯</div>
            <div className="flex-1">
              <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-800">Did you know?</div>
              <div className={`font-mono text-3xl font-extrabold tracking-tight text-amber-700 transition-all duration-700 sm:text-4xl ${statShown ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
                {hook.mindBlow.stat}
              </div>
              <div className="mt-2 text-sm font-medium leading-relaxed text-amber-950">{hook.mindBlow.label}</div>
            </div>
          </div>
        </div>
      )}

      {/* === STORY STRIP — Tap-through cards === */}
      {hook && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-zinc-300">The Big Idea — tap through</div>
            <div className="flex gap-1.5">
              {hook.storyStrip.map((_, i) => (
                <button key={i} onClick={() => setStoryIdx(i)} className={"h-2 rounded-full transition-all " + (i === storyIdx ? "w-8 bg-slate-900 dark:bg-white" : "w-2 bg-zinc-300 dark:bg-zinc-600")} aria-label={`Slide ${i + 1}`} />
              ))}
            </div>
          </div>
          <button
            onClick={() => setStoryIdx((i) => (i + 1) % hook.storyStrip.length)}
            className={`relative w-full overflow-hidden rounded-xl bg-gradient-to-br ${themeGradient} p-5 text-left shadow-lg transition active:scale-[0.98]`}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
            <div className="relative mb-2 flex items-center gap-3">
              <span className="text-4xl drop-shadow-md">{hook.storyStrip[storyIdx].emoji}</span>
              <span className="text-lg font-extrabold text-white drop-shadow-md sm:text-xl">{hook.storyStrip[storyIdx].title}</span>
            </div>
            <p className="relative text-sm font-medium leading-relaxed text-white/95 drop-shadow sm:text-base">{hook.storyStrip[storyIdx].text}</p>
            <div className="relative mt-3 text-right text-xs font-semibold text-white/80">tap → next</div>
          </button>
        </div>
      )}

      {/* === QUICK REFERENCE CARD — under Big Idea === */}
      {hasQRC && (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${themeGradient} p-5 shadow-xl ring-1 ring-black/10`}>
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="relative mb-3 flex items-center justify-between gap-2">
            <h4 className="text-base font-extrabold text-white drop-shadow sm:text-lg">📋 Quick Reference Card</h4>
            <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">Shareable</span>
          </div>
          <div className="relative flex flex-col gap-2">
            {qrcItems.map((item, idx) => (
              <div key={idx} className="rounded-xl bg-white/25 px-4 py-2.5 font-mono text-sm text-white shadow-sm backdrop-blur-sm">
                <LatexRenderer text={item} />
              </div>
            ))}
          </div>
          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white shadow-md transition active:scale-95 hover:shadow-lg"
              aria-label="Share on WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Share on WhatsApp
            </a>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-md transition active:scale-95 hover:shadow-lg"
            >
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
          </div>
        </div>
      )}

      {/* === WHERE YOU SEE IT — real-world chips === */}
      {hook && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-zinc-300">{"Where you'll spot this in real life"}</div>
          <div className="flex flex-wrap gap-2">
            {hook.realWorld.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md transition hover:scale-105 hover:shadow-lg dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-200">
                <span className="text-base">{r.emoji}</span>
                <span>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === SYLLABUS COVERAGE === */}
      {syllabusCoverage && syllabusCoverage.length > 0 && (
        <details className="rounded-2xl border border-zinc-200 bg-white shadow-md ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-900">
          <summary className="cursor-pointer list-none p-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-zinc-300">
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
