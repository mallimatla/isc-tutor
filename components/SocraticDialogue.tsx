"use client";

import { useState, useRef, useEffect } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import FlagButton from "@/components/FlagButton";
import { apiFetch } from "@/lib/api-client";

interface DialogueTurn {
  role: "student" | "tutor";
  message: string;
}

interface SocraticResponse {
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
  const [isFinal, setIsFinal] = useState(false);
  const [fullSolutionSteps, setFullSolutionSteps] = useState<string[] | null>(
    null
  );
  const [reflectionQuestion, setReflectionQuestion] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [lastEvaluationId] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, isWaiting]);

  const submitTurn = async (message: string) => {
    setError(null);
    setTurns((prev) => [...prev, { role: "student", message }]);
    setInput("");
    setIsWaiting(true);

    try {
      const res = await apiFetch<SocraticResponse>("/api/socratic", {
        method: "POST",
        body: JSON.stringify({
          questionId,
          studentTurn: message,
          turnNumber,
        }),
      });

      setTurns((prev) => [
        ...prev,
        { role: "tutor", message: res.tutorMessage },
      ]);

      if (res.isFinal) {
        setIsFinal(true);
        setFullSolutionSteps(res.fullSolutionSteps);
        setReflectionQuestion(res.reflectionQuestion);
      } else {
        setTurnNumber((n) => (n + 1) as 1 | 2 | 3 | 4 | 5);
      }
    } catch (err) {
      // Remove the student turn we optimistically added
      setTurns((prev) => prev.slice(0, -1));
      setError(
        err instanceof Error ? err.message : "Failed to get tutor response."
      );
    } finally {
      setIsWaiting(false);
    }
  };

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
                <LatexRenderer text={turn.message} />
              ) : (
                <span className="whitespace-pre-wrap">{turn.message}</span>
              )}
            </div>
          </div>
        ))}

        {/* Waiting indicator */}
        {isWaiting && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-500 dark:bg-zinc-800">
              Thinking...
            </div>
          </div>
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

      {/* Input area — hidden when final */}
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
                <span className="ml-2">
                  Turn {turnNumber} of 5
                </span>
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
            <FlagButton
              questionId={questionId}
              evaluationId={lastEvaluationId}
            />
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
