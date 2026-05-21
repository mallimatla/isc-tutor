"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getChapterTheme } from "@/lib/chapter-theme";

interface Chapter {
  id: string;
  label: string;
}

interface ClassData {
  label: string;
  chapters: Chapter[];
}

interface SubjectData {
  label: string;
  classes: Record<string, ClassData>;
}

interface SyllabusResponse {
  subjects: Record<string, SubjectData>;
}

export default function TopicPicker() {
  const router = useRouter();
  const [syllabus, setSyllabus] = useState<SyllabusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subject = "mathematics";
  const [classLevel, setClassLevel] = useState<"11" | "12">("11");

  useEffect(() => {
    fetch("/api/syllabus")
      .then((res) => res.json())
      .then((data: SyllabusResponse) => setSyllabus(data))
      .catch(() => setError("Failed to load syllabus."))
      .finally(() => setLoading(false));
  }, []);

  const chapters =
    syllabus?.subjects?.[subject]?.classes?.[classLevel]?.chapters ?? [];

  const handlePick = (chapterId: string) => {
    router.push(
      `/practice?subject=${subject}&class=${classLevel}&chapterId=${chapterId}`
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton-shimmer h-8 w-32 rounded-full" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-shimmer h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-rose-600">{error}</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Pick a chapter
        </h2>
        <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {(["11", "12"] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setClassLevel(cls)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                classLevel === cls
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Class {cls}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {chapters.map((ch, idx) => {
          const theme = getChapterTheme(ch.id);
          return (
            <button
              key={ch.id}
              onClick={() => handlePick(ch.id)}
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition active:scale-[0.98] hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
              style={{ animationDelay: `${idx * 18}ms` }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-1 transition-all group-hover:w-1.5"
                style={{
                  background: `linear-gradient(180deg, ${theme.hex.primary}, ${theme.hex.secondary})`,
                }}
              />
              <span
                aria-hidden
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${theme.hex.primary}, ${theme.hex.secondary})`,
                }}
              >
                {ch.label.charAt(0)}
              </span>
              <span className="flex-1 text-sm font-semibold text-slate-900 group-hover:text-slate-950">
                {ch.label}
              </span>
              <span
                aria-hidden
                className="text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500"
              >
                →
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">
        Computer Science is in development — coming Phase 2.
      </p>
    </div>
  );
}
