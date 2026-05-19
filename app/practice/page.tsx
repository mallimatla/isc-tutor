"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import QuestionCard from "@/components/QuestionCard";
import AnswerInput from "@/components/AnswerInput";
import Verdict from "@/components/Verdict";
import FlagButton from "@/components/FlagButton";
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

interface EvaluationResponse {
  evaluationId: string;
  verdict: "correct" | "partial" | "incorrect";
  whereWentWrong: string | null;
  fullSolutionSteps: string[];
  confidence: number;
  difficultyForNext: number;
  metadata: { evaluationLatencyMs: number };
}

function PracticeContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject") || "mathematics";
  const classLevel = searchParams.get("class") || "11";
  const chapterId = searchParams.get("chapterId") || "";
  const chapterLabel = searchParams.get("chapterLabel") || chapterId;

  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syllabusWarning, setSyllabusWarning] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const fetchQuestion = useCallback(async () => {
    setIsLoadingQuestion(true);
    setError(null);
    setEvaluation(null);
    setSyllabusWarning(false);

    try {
      const res = await apiFetch<QuestionResponse>("/api/question", {
        method: "POST",
        body: JSON.stringify({ subject, class: classLevel, chapterId }),
      });
      setQuestion(res);
      setQuestionCount((c) => c + 1);
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
    if (chapterId && !authLoading && user) fetchQuestion();
  }, [chapterId, authLoading, user, fetchQuestion]);

  const handleSubmitAnswer = async (answer: string) => {
    if (!question) return;
    setIsLoadingEvaluation(true);
    setError(null);

    try {
      const res = await apiFetch<EvaluationResponse>("/api/evaluate", {
        method: "POST",
        body: JSON.stringify({
          questionId: question.questionId,
          studentAnswer: answer || "(skipped)",
        }),
      });
      setEvaluation(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to evaluate answer."
      );
    } finally {
      setIsLoadingEvaluation(false);
    }
  };

  const handleNext = () => {
    fetchQuestion();
  };

  const handleFlag = () => {
    // FlagButton handles its own modal — this is a no-op trigger
  };

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
        {/* Header area */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm text-zinc-500">
            Question {questionCount} of session
          </span>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Change Chapter
          </Link>
        </div>

        {/* Syllabus warning */}
        {syllabusWarning && (
          <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
            This question may be slightly off-syllabus.
          </div>
        )}

        {/* Loading question */}
        {isLoadingQuestion && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-zinc-500">Generating question...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoadingQuestion && (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchQuestion}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Question + Answer + Verdict */}
        {question && !isLoadingQuestion && (
          <div className="flex flex-col gap-6">
            <QuestionCard
              question={question}
              chapterLabel={chapterLabel}
            />

            {/* Flag question (before evaluation) */}
            {!evaluation && (
              <FlagButton
                questionId={question.questionId}
                evaluationId={null}
              />
            )}

            {/* Answer input — hidden after evaluation */}
            {!evaluation && (
              <AnswerInput
                onSubmit={handleSubmitAnswer}
                disabled={isLoadingEvaluation}
              />
            )}

            {/* Loading evaluation */}
            {isLoadingEvaluation && (
              <p className="text-center text-sm text-zinc-500">
                Checking your answer...
              </p>
            )}

            {/* Verdict */}
            {evaluation && (
              <>
                <Verdict
                  verdict={evaluation.verdict}
                  whereWentWrong={evaluation.whereWentWrong}
                  fullSolutionSteps={evaluation.fullSolutionSteps}
                  onNext={handleNext}
                  onFlag={handleFlag}
                />
                <FlagButton
                  questionId={question.questionId}
                  evaluationId={evaluation.evaluationId}
                />
              </>
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
