"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import QuestionCard from "@/components/QuestionCard";
import SocraticDialogue from "@/components/SocraticDialogue";
import DifficultyIndicator from "@/components/DifficultyIndicator";
import SkeletonLoader from "@/components/SkeletonLoader";
import ChapterLesson from "@/components/ChapterLesson";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/use-auth";
import { getChapterTheme } from "@/lib/chapter-theme";

interface QuestionResponse {
  questionId: string;
  questionLatex: string;
  difficultyServed: number;
  metadata: {
    inSyllabus: boolean;
    generationLatencyMs: number;
    syllabusWarning?: boolean;
  };
}

function PracticeContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject") || "mathematics";
  const classLevel = searchParams.get("class") || "11";
  const chapterId = searchParams.get("chapterId") || "";
  const chapterLabel = searchParams.get("chapterLabel") || chapterId;
  const skipToMode = searchParams.get("mode");
  const theme = getChapterTheme(chapterId);

  const storageKey = `isctutor:hasLearnedChapter:${classLevel}-${chapterId}`;
  const [mode, setMode] = useState<"learn" | "practice">(() => {
    if (skipToMode === "practice") return "practice";
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey) === "true") return "practice";
    return "learn";
  });

  const handleGotIt = useCallback(() => {
    setMode("practice");
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "true");
    }
  }, [storageKey]);

  const handleSwitchToPractice = useCallback(() => {
    setMode("practice");
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "true");
    }
  }, [storageKey]);

  // Practice mode state
  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syllabusWarning, setSyllabusWarning] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [dialogueKey, setDialogueKey] = useState(0);

  const fetchQuestion = useCallback(async () => {
    setIsLoadingQuestion(true);
    setError(null);
    setSyllabusWarning(false);

    try {
      const res = await apiFetch<QuestionResponse>("/api/question", {
        method: "POST",
        body: JSON.stringify({ subject, class: classLevel, chapterId }),
      });
      setQuestion(res);
      setQuestionCount((c) => c + 1);
      setDialogueKey((k) => k + 1);
      if (res.metadata.syllabusWarning) setSyllabusWarning(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load question."
      );
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [subject, classLevel, chapterId]);

  useEffect(() => {
    if (mode === "practice" && chapterId && !authLoading && user && !question) {
      fetchQuestion();
    }
  }, [mode, chapterId, authLoading, user, question, fetchQuestion]);

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!chapterId) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-slate-500">No chapter selected.</p>
          <Link
            href="/"
            className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition active:scale-95 hover:border-slate-300"
          >
            Go back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* Top context bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span
              aria-hidden
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${theme.hex.primary}, ${theme.hex.secondary})`,
              }}
            >
              {chapterLabel.charAt(0)}
            </span>
            <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
              {chapterLabel}
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            Change
          </Link>
        </div>

        {/* Segmented control — both tabs always clickable */}
        <div className="mb-8 inline-flex w-full items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
          <button
            onClick={() => setMode("learn")}
            className={`flex-1 rounded-full px-6 py-2 text-sm font-semibold transition sm:flex-initial ${
              mode === "learn"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Learn
          </button>
          <button
            onClick={handleSwitchToPractice}
            className={`flex-1 rounded-full px-6 py-2 text-sm font-semibold transition sm:flex-initial ${
              mode === "practice"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Practice
          </button>
        </div>

        {/* Learn mode */}
        {mode === "learn" && (
          <div className="animate-fade-up">
            <ChapterLesson
              chapterId={chapterId}
              classLevel={classLevel}
              chapterLabel={chapterLabel}
              onGotIt={handleGotIt}
            />
          </div>
        )}

        {/* Practice mode */}
        {mode === "practice" && (
          <div className="flex flex-col gap-6 animate-fade-up">
            {questionCount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium uppercase tracking-wider text-slate-400">
                  Question {questionCount}
                </span>
                {question && <DifficultyIndicator level={question.difficultyServed as 1 | 2 | 3 | 4 | 5} />}
              </div>
            )}

            {syllabusWarning && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This question may be slightly off-syllabus.
              </div>
            )}

            {isLoadingQuestion && <SkeletonLoader variant="question" />}

            {error && !isLoadingQuestion && (
              <div className="rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-sm">
                <p className="text-sm text-rose-600">{error}</p>
                <button
                  onClick={fetchQuestion}
                  className="mt-3 inline-flex rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:bg-indigo-500"
                >
                  Retry
                </button>
              </div>
            )}

            {question && !isLoadingQuestion && (
              <div className="flex flex-col gap-6">
                <QuestionCard question={question} chapterLabel={chapterLabel} />
                <SocraticDialogue
                  key={dialogueKey}
                  questionId={question.questionId}
                  question={question}
                  onNext={fetchQuestion}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <AuthGate>
      <PracticeContent />
    </AuthGate>
  );
}
