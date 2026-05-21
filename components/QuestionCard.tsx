"use client";

import LatexRenderer from "@/components/LatexRenderer";
import DifficultyIndicator from "@/components/DifficultyIndicator";

interface QuestionCardProps {
  question: {
    questionId: string;
    questionLatex: string;
    difficultyServed: number;
  };
  chapterLabel?: string;
}

export default function QuestionCard({
  question,
  chapterLabel,
}: QuestionCardProps) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
      <header className="mb-5 flex items-center justify-between gap-3">
        {chapterLabel && (
          <span className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
            {chapterLabel}
          </span>
        )}
        <DifficultyIndicator
          level={question.difficultyServed as 1 | 2 | 3 | 4 | 5}
        />
      </header>
      <div className="prose-question text-[15px] leading-relaxed text-slate-800 sm:text-base">
        <LatexRenderer text={question.questionLatex} />
      </div>
    </article>
  );
}
