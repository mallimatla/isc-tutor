"use client";

import LatexRenderer from "@/components/LatexRenderer";

interface VerdictProps {
  verdict: "correct" | "partial" | "incorrect";
  whereWentWrong: string | null;
  fullSolutionSteps: string[];
  onNext: () => void;
  onFlag: () => void;
}

const bannerStyles = {
  correct: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300",
  partial: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300",
  incorrect: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300",
};

const bannerLabels = {
  correct: "\u2713 Correct",
  partial: "\u25D0 Partial",
  incorrect: "\u2717 Incorrect",
};

export default function Verdict({
  verdict,
  whereWentWrong,
  fullSolutionSteps,
  onNext,
  onFlag,
}: VerdictProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Banner */}
      <div
        className={`rounded-md border px-4 py-3 text-sm font-semibold ${bannerStyles[verdict]}`}
      >
        {bannerLabels[verdict]}
      </div>

      {/* Where went wrong */}
      {whereWentWrong && (
        <div className="text-sm text-zinc-700 dark:text-zinc-300">
          <p className="mb-1 font-medium">Where you went wrong:</p>
          <p>
            <LatexRenderer text={whereWentWrong} />
          </p>
        </div>
      )}

      {/* Full solution */}
      <div className="text-sm text-zinc-700 dark:text-zinc-300">
        <p className="mb-2 font-medium">Full solution:</p>
        <ol className="flex flex-col gap-2 pl-5">
          {fullSolutionSteps.map((step, idx) => (
            <li key={idx} className="list-decimal leading-relaxed">
              <LatexRenderer text={step} />
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onFlag}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Flag this evaluation
        </button>
        <button
          onClick={onNext}
          className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Next Question
        </button>
      </div>
    </div>
  );
}
