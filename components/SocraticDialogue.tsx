"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import SkeletonLoader from "@/components/SkeletonLoader";
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

        // Read SSE stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamedTutorMessage = "";
        let tutorTurnAdded = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from buffer
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
                  // Update last turn in place
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

                // Finalize the tutor message (remove streaming flag)
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
        // Remove the student turn we optimistically added (and any partial tutor turn)
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
    <div className="flex flex-col gap-4">
      {/* Dialogue thread */}
      <div className="flex flex-col gap-3">
        {turns.length === 0 && !isWaiting && (
          <p className="py-4 text-center text-sm text-zinc-400">
            Type your first attempt below
          </p>
        )}

        {turns.map((turn, idx) => (
          <div
            key={idx}
            className={`flex ${
              turn.role === "student" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                turn.role === "student"
                  ? "bg-blue-50 text-zinc-900 dark:bg-blue-950 dark:text-zinc-100"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {turn.role === "tutor" ? (
                <>
                  <LatexRenderer text={turn.message} />
                  {turn.isStreaming && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-zinc-500" />
                  )}
                </>
              ) : (
                <span className="whitespace-pre-wrap">{turn.message}</span>
              )}
            </div>
          </div>
        ))}

        {/* Skeleton: only before first token arrives */}
        {isWaiting && !hasFirstToken && (
          <SkeletonLoader variant="tutor-message" />
        )}

        <div ref={threadEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-sm text-zinc-500 underline hover:text-zinc-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input area */}
      {!isFinal && !isWaiting && (
        <div className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={5000}
            rows={3}
            placeholder={
              turnNumber === 1
                ? "Type your answer..."
                : "Reply to the tutor..."
            }
            className="resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {input.length} / 5000
              {turnNumber > 1 && (
                <span className="ml-2">Turn {turnNumber} of 5</span>
              )}
            </span>
            <div className="flex gap-2">
              {turnNumber >= 2 && (
                <button
                  onClick={handleShowAnswer}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Just show me the answer
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final solution + reflection */}
      {isFinal && fullSolutionSteps && (
        <div className="mt-2 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Full solution
          </h3>
          <ol className="flex flex-col gap-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            {fullSolutionSteps.map((step, idx) => (
              <li key={idx} className="list-decimal leading-relaxed">
                <LatexRenderer text={step} />
              </li>
            ))}
          </ol>

          {reflectionQuestion && (
            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Reflection
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <LatexRenderer text={reflectionQuestion} />
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <FlagButton questionId={questionId} evaluationId={null} />
            <button
              onClick={onNext}
              className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Next Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
