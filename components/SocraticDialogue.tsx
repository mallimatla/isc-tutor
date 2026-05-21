"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import StreamingMessage from "@/components/StreamingMessage";
import LatexRenderer from "@/components/LatexRenderer";
import SkeletonLoader from "@/components/SkeletonLoader";
import SpeakButton from "@/components/SpeakButton";
import FlagButton from "@/components/FlagButton";
import { auth } from "@/lib/firebase";

interface DialogueTurn {
  role: "student" | "tutor";
  message: string;
  isStreaming?: boolean;
}

interface SocraticDonePayload {
  decision: "ASK" | "AFFIRM_AND_REVEAL" | "REVEAL";
  tutorMessage: string;
  turnNumber: number;
  isFinal: boolean;
  fullSolutionSteps: string[] | null;
  reflectionQuestion: string | null;
  difficultyForNext: number | null;
}

interface SocraticDialogueProps {
  questionId: string;
  question: {
    questionLatex: string;
    difficultyServed: number;
  };
  onNext: () => void;
}

function TutorAvatar() {
  return (
    <span
      aria-hidden
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-bold text-white shadow-sm"
    >
      AI
    </span>
  );
}

export default function SocraticDialogue({
  questionId,
  question,
  onNext,
}: SocraticDialogueProps) {
  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [input, setInput] = useState("");
  const [turnNumber, setTurnNumber] = useState(1);
  const [isWaiting, setIsWaiting] = useState(false);
  const [hasFirstToken, setHasFirstToken] = useState(false);
  const [isFinal, setIsFinal] = useState(false);
  const [fullSolutionSteps, setFullSolutionSteps] = useState<string[] | null>(
    null
  );
  const [reflectionQuestion, setReflectionQuestion] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, isWaiting, hasFirstToken]);

  const submitTurn = useCallback(
    async (message: string) => {
      setError(null);
      setTurns((prev) => [...prev, { role: "student", message }]);
      setInput("");
      setIsWaiting(true);
      setHasFirstToken(false);

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Not authenticated");
        const token = await currentUser.getIdToken();

        const res = await fetch("/api/socratic", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            questionId,
            studentTurn: message,
            turnNumber,
          }),
        });

        if (!res.ok || !res.body) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(
            (errBody as Record<string, string>).error || `HTTP ${res.status}`
          );
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamedTutorMessage = "";
        let tutorTurnAdded = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let eventType = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7);
            } else if (line.startsWith("data: ")) {
              const data = line.slice(6);

              if (eventType === "delta") {
                const { text } = JSON.parse(data) as { text: string };
                streamedTutorMessage += text;

                if (!tutorTurnAdded) {
                  tutorTurnAdded = true;
                  setHasFirstToken(true);
                  setTurns((prev) => [
                    ...prev,
                    {
                      role: "tutor",
                      message: streamedTutorMessage,
                      isStreaming: true,
                    },
                  ]);
                } else {
                  setTurns((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "tutor",
                      message: streamedTutorMessage,
                      isStreaming: true,
                    };
                    return updated;
                  });
                }
              } else if (eventType === "done") {
                const payload = JSON.parse(data) as SocraticDonePayload;

                setTurns((prev) => {
                  const updated = [...prev];
                  if (
                    updated.length > 0 &&
                    updated[updated.length - 1].role === "tutor"
                  ) {
                    updated[updated.length - 1] = {
                      role: "tutor",
                      message: payload.tutorMessage,
                      isStreaming: false,
                    };
                  }
                  return updated;
                });

                if (payload.isFinal) {
                  setIsFinal(true);
                  setFullSolutionSteps(payload.fullSolutionSteps);
                  setReflectionQuestion(payload.reflectionQuestion);
                } else {
                  setTurnNumber(
                    (n) => (n + 1) as 1 | 2 | 3 | 4 | 5
                  );
                }
              } else if (eventType === "error") {
                const errPayload = JSON.parse(data) as {
                  error: string;
                  message?: string;
                };
                throw new Error(errPayload.message || errPayload.error);
              }
              eventType = "";
            }
          }
        }
      } catch (err) {
        setTurns((prev) => {
          const lastStudentIdx = prev.findLastIndex(
            (t) => t.role === "student"
          );
          if (lastStudentIdx >= 0) return prev.slice(0, lastStudentIdx);
          return prev;
        });
        setError(
          err instanceof Error ? err.message : "Failed to get tutor response."
        );
      } finally {
        setIsWaiting(false);
        setHasFirstToken(false);
      }
    },
    [questionId, turnNumber]
  );

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isWaiting || isFinal) return;
    submitTurn(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleShowAnswer = () => {
    submitTurn("I'd like to see the solution please.");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Dialogue thread */}
      <div className="flex flex-col gap-4">
        {turns.length === 0 && !isWaiting && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-6 text-center">
            <p className="text-sm text-slate-500">
              Type your first attempt below — the tutor responds when you do.
            </p>
          </div>
        )}

        {turns.map((turn, idx) => (
          <div
            key={idx}
            className={`flex w-full animate-fade-up gap-2 ${
              turn.role === "student" ? "justify-end" : "justify-start"
            }`}
          >
            {turn.role === "tutor" && <TutorAvatar />}
            <div
              className={`max-w-[88%] px-4 py-3 text-[15px] leading-relaxed shadow-sm transition ${
                turn.role === "student"
                  ? "rounded-2xl rounded-tr-md bg-indigo-600 text-white"
                  : "rounded-2xl rounded-tl-md border border-slate-100 bg-white text-slate-800"
              }`}
            >
              {turn.role === "tutor" ? (
                <div className="flex flex-col gap-2">
                  <StreamingMessage
                    text={turn.message}
                    isStreaming={!!turn.isStreaming}
                  />
                  {!turn.isStreaming && turn.message && (
                    <div className="-mb-1">
                      <SpeakButton text={turn.message} />
                    </div>
                  )}
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{turn.message}</span>
              )}
            </div>
          </div>
        ))}

        {/* Skeleton: only before first token arrives */}
        {isWaiting && !hasFirstToken && (
          <div className="flex animate-fade-up gap-2">
            <TutorAvatar />
            <SkeletonLoader variant="tutor-thinking" />
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-center">
          <p className="text-sm text-rose-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-xs font-medium text-rose-600 underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input area */}
      {!isFinal && !isWaiting && (
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={5000}
            rows={3}
            placeholder={
              turnNumber === 1
                ? "Type your answer…"
                : "Reply to the tutor…"
            }
            className="block w-full resize-y rounded-xl border-0 bg-transparent px-2 py-2 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
            <span className="text-xs text-slate-400">
              {input.length} / 5000
              {turnNumber > 1 && (
                <span className="ml-2">Turn {turnNumber} of 5</span>
              )}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {turnNumber >= 2 && (
                <button
                  onClick={handleShowAnswer}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition active:scale-95 hover:border-slate-300 hover:bg-slate-50"
                >
                  Just show me the answer
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:active:scale-100"
              >
                Submit
                <span aria-hidden>↵</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final solution + reflection */}
      {isFinal && fullSolutionSteps && (
        <div className="animate-fade-up rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                Full solution
              </h3>
            </div>
            <SpeakButton
              text={fullSolutionSteps.join(". ")}
              label="Listen"
            />
          </div>
          <ol className="flex flex-col gap-3 pl-1 text-[15px] text-slate-700">
            {fullSolutionSteps.map((step, idx) => (
              <li key={idx} className="flex gap-3 leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                  {idx + 1}
                </span>
                <span className="flex-1">
                  <LatexRenderer text={step} />
                </span>
              </li>
            ))}
          </ol>

          {reflectionQuestion && (
            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Reflect
                </p>
                <SpeakButton text={reflectionQuestion} />
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                <LatexRenderer text={reflectionQuestion} />
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <FlagButton questionId={questionId} evaluationId={null} />
            <button
              onClick={onNext}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:bg-indigo-500"
            >
              Next question
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
