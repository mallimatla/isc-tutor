"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";

interface FlagButtonProps {
  questionId: string;
  evaluationId: string | null;
  onFlagged?: () => void;
}

type FlagType = "off_syllabus" | "wrong_question" | "disputed_evaluation";

export default function FlagButton({
  questionId,
  evaluationId,
  onFlagged,
}: FlagButtonProps) {
  const [open, setOpen] = useState(false);
  const [flagType, setFlagType] = useState<FlagType>("off_syllabus");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await apiFetch("/api/flag", {
        method: "POST",
        body: JSON.stringify({
          questionId,
          evaluationId,
          flagType,
          studentNote: note || null,
        }),
      });
      setSubmitted(true);
      onFlagged?.();
      setTimeout(() => setOpen(false), 1000);
    } catch {
      // Silently close — flag is best-effort
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        Flag this question
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        {submitted ? (
          <p className="text-sm text-green-600 dark:text-green-400">
            Thanks for the feedback.
          </p>
        ) : (
          <>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Flag this question
            </h3>
            <fieldset className="mb-4 flex flex-col gap-2">
              {(
                [
                  ["off_syllabus", "Off syllabus"],
                  ["wrong_question", "Wrong question"],
                  ["disputed_evaluation", "I think I was right"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="flagType"
                    value={value}
                    checked={flagType === value}
                    onChange={() => setFlagType(value)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="Add a note (optional)"
              rows={2}
              className="mb-4 w-full resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {submitting ? "Sending..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
