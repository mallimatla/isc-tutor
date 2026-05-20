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

  // Check sessionStorage for prior learn completion
  const storageKey = `isctutor:hasLearnedChapter:${classLevel}-${chapterId}`;
  const [mode, setMode] = useState<"learn" | "practice">(() => {
    if (skipToMode === "practice") return "practice";
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey) === "true") return "practice";
    return "learn";
  });
  const [practiceUnlocked, setPracticeUnlocked] = useState(() => {
    if (skipToMode === "practice") return true;
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey) === "true") return true;
    return false;
  });
  const [learnStartTime] = useState(Date.now());

  // Unlock practice after 30 seconds on Learn tab
  useEffect(() => {
    if (practiceUnlocked) return;
    const timer = setTimeout(() => {
      setPracticeUnlocked(true);
    }, 30_000);
    return () => clearTimeout(timer);
  }, [practiceUnlocked]);

  const handleGotIt = useCallback(() => {
    setPracticeUnlocked(true);
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

  // Fetch first question when switching to practice mode
  useEffect(() => {
    if (mode === "practice" && chapterId && !authLoading && user && !question) {
      fetchQuestion();
    }
  }, [mode, chapterId, authLoading, user, question, fetchQuestion]);

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!chapterId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">
          No chapter selected.{" "}
          <Link href="/" className="underline">
            Go back
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-6">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {chapterLabel}
          </span>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Change Chapter
          </Link>
        </div>

        {/* Learn / Practice tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setMode("learn")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "learn"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => {
              if (practiceUnlocked) {
                setMode("practice");
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(storageKey, "true");
                }
              }
            }}
            disabled={!practiceUnlocked}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "practice"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                : practiceUnlocked
                  ? "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  : "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
            }`}
          >
            Practice
          </button>
        </div>

        {/* Learn mode */}
        {mode === "learn" && (
          <ChapterLesson
            chapterId={chapterId}
            classLevel={classLevel}
            onGotIt={handleGotIt}
          />
        )}

        {/* Practice mode */}
        {mode === "practice" && (
          <>
            {/* Question counter */}
            {questionCount > 0 && (
              <div className="mb-4 text-sm text-zinc-500">
                Question {questionCount} of session
              </div>
            )}

            {/* Syllabus warning */}
            {syllabusWarning && (
              <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
                This question may be slightly off-syllabus.
              </div>
            )}

            {/* Loading question */}
            {isLoadingQuestion && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">
                    {chapterLabel}
                  </span>
                  <DifficultyIndicator level={2} />
                </div>
                <SkeletonLoader variant="question" />
              </div>
            )}

            {/* Error */}
            {error && !isLoadingQuestion && (
              <div className="flex flex-col items-center gap-3 py-16">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
                <button
                  onClick={fetchQuestion}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Question + Socratic Dialogue */}
            {question && !isLoadingQuestion && (
              <div className="flex flex-col gap-6">
                <QuestionCard
                  question={question}
                  chapterLabel={chapterLabel}
                />
                <SocraticDialogue
                  key={dialogueKey}
                  questionId={question.questionId}
                  question={question}
                  onNext={fetchQuestion}
                />
              </div>
            )}
          </>
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
