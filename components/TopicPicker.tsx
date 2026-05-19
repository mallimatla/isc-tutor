"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  const [subject] = useState("mathematics");
  const [classLevel, setClassLevel] = useState<"11" | "12">("11");
  const [chapterId, setChapterId] = useState("");

  useEffect(() => {
    fetch("/api/syllabus")
      .then((res) => res.json())
      .then((data: SyllabusResponse) => {
        setSyllabus(data);
        const chapters =
          data.subjects?.mathematics?.classes?.["11"]?.chapters ?? [];
        if (chapters.length > 0) setChapterId(chapters[0].id);
      })
      .catch(() => setError("Failed to load syllabus."))
      .finally(() => setLoading(false));
  }, []);

  const chapters =
    syllabus?.subjects?.[subject]?.classes?.[classLevel]?.chapters ?? [];

  // Update chapterId when class changes
  useEffect(() => {
    if (chapters.length > 0 && !chapters.find((c) => c.id === chapterId)) {
      setChapterId(chapters[0].id);
    }
  }, [classLevel, chapters, chapterId]);

  const handleStart = () => {
    router.push(
      `/practice?subject=${subject}&class=${classLevel}&chapterId=${chapterId}`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-zinc-500">Loading syllabus...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Subject */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Subject
        </span>
        <select
          value={subject}
          disabled
          className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="mathematics">Mathematics</option>
        </select>
      </label>

      {/* Class toggle */}
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Class
        </legend>
        <div className="flex gap-2">
          {(["11", "12"] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setClassLevel(cls)}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
                classLevel === cls
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Chapter */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Chapter
        </span>
        <select
          value={chapterId}
          onChange={(e) => setChapterId(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {chapters.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.label}
            </option>
          ))}
        </select>
      </label>

      {/* Start */}
      <button
        onClick={handleStart}
        disabled={!chapterId}
        className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Start Practice
      </button>

      {/* Phase 2 note */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Computer Science is in development — coming Phase 2
      </p>
    </div>
  );
}
