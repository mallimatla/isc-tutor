"use client";

import { useRef, useCallback } from "react";

interface ShareableCardProps {
  chapterLabel: string;
  keyTakeaway: string;
  commonMistakes: Array<{ mistake: string }>;
  themeGradient: string;
}

export default function ShareableCard({
  chapterLabel,
  keyTakeaway,
  commonMistakes,
  themeGradient,
}: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `${chapterLabel}.png`, {
            type: "image/png",
          });
          const shareData = { files: [file], title: `ISC Tutor — ${chapterLabel}` };
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
          }
        }

        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ISC-Tutor-${chapterLabel.replace(/\s+/g, "-")}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch {
      // Silently fail — sharing is best-effort
    }
  }, [chapterLabel]);

  return (
    <div>
      {/* Hidden card for capture */}
      <div
        ref={cardRef}
        className="pointer-events-none absolute -left-[9999px]"
        style={{ width: 360, height: 640 }}
      >
        <div
          className={`flex h-full flex-col justify-between rounded-3xl bg-gradient-to-br ${themeGradient} p-8`}
        >
          <div>
            <div className="mb-2 text-sm font-medium text-white/70">
              ISC Mathematics
            </div>
            <h2 className="text-2xl font-bold text-white">{chapterLabel}</h2>
          </div>

          <div className="rounded-2xl bg-white/20 p-5 backdrop-blur-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/80">
              Key Takeaway
            </div>
            <p className="text-base leading-relaxed text-white">
              {keyTakeaway}
            </p>
          </div>

          {commonMistakes.length > 0 && (
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/70">
                Watch out for
              </div>
              {commonMistakes.slice(0, 2).map((m, i) => (
                <p key={i} className="text-sm text-white/90">
                  {m.mistake}
                </p>
              ))}
            </div>
          )}

          <div className="text-center text-xs text-white/50">
            ISC Tutor — isc-tutor.vercel.app
          </div>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        Share this chapter
      </button>
    </div>
  );
}
