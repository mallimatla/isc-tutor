"use client";

import { useState } from "react";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled: boolean;
}

export default function AnswerInput({ onSubmit, disabled }: AnswerInputProps) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    if (answer.trim()) onSubmit(answer);
  };

  const handleSkip = () => {
    onSubmit("");
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Your answer
      </label>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        maxLength={5000}
        disabled={disabled}
        rows={5}
        placeholder="Type your answer here..."
        className="resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          {answer.length} / 5000
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            disabled={disabled}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={disabled || !answer.trim()}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Check My Answer
          </button>
        </div>
      </div>
    </div>
  );
}
