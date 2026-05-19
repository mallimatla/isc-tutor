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
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center justify-between">
        {chapterLabel && (
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {chapterLabel}
          </span>
        )}
        <DifficultyIndicator
          level={question.difficultyServed as 1 | 2 | 3 | 4 | 5}
        />
      </div>
      <div className="text-base leading-relaxed text-zinc-900 dark:text-zinc-100">
        <LatexRenderer text={question.questionLatex} />
      </div>
    </div>
  );
}
