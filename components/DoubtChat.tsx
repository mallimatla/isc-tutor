"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import LatexRenderer from "@/components/LatexRenderer";
import SkeletonLoader from "@/components/SkeletonLoader";
import SpeakButton from "@/components/SpeakButton";
import { auth } from "@/lib/firebase";

interface DoubtTurn {
  role: "student" | "tutor";
  content: string;
  isStreaming?: boolean;
}

interface DoubtChatProps {
  chapterId: string;
  classLevel: string;
  chapterLabel: string;
  subject?: string;
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

export default function DoubtChat({
  chapterId,
  classLevel,
  chapterLabel,
  subject,
}: DoubtChatProps) {
  const [turns, setTurns] = useState<DoubtTurn[]>([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [hasFirstToken, setHasFirstToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, isWaiting, hasFirstToken]);

  const submitDoubt = useCallback(
    async (message: string) => {
      // Snapshot the thread we send as history BEFORE adding the new message.
      const history = turns.map((t) => ({ role: t.role, content: t.content }));

      setError(null);
      setTurns((prev) => [...prev, { role: "student", content: message }]);
      setInput("");
      setIsWaiting(true);
      setHasFirstToken(false);

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Not authenticated");
        const token = await currentUser.getIdToken();

        const res = await fetch("/api/doubt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chapterId,
            classLevel,
            subject,
            chapterLabel,
            message,
            history,
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
        let streamed = "";
        let tutorAdded = false;

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
                streamed += text;
                if (!tutorAdded) {
                  tutorAdded = true;
                  setHasFirstToken(true);
                  setTurns((prev) => [
                    ...prev,
                    { role: "tutor", content: streamed, isStreaming: true },
                  ]);
                } else {
                  setTurns((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "tutor",
                      content: streamed,
                      isStreaming: true,
                    };
                    return updated;
                  });
                }
              } else if (eventType === "done") {
                const payload = JSON.parse(data) as { answer: string };
                setTurns((prev) => {
                  const updated = [...prev];
                  if (
                    updated.length > 0 &&
                    updated[updated.length - 1].role === "tutor"
                  ) {
                    updated[updated.length - 1] = {
                      role: "tutor",
                      content: payload.answer,
                      isStreaming: false,
                    };
                  }
                  return updated;
                });
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

        // Stream ended without a tutor bubble (nothing came back).
        if (!tutorAdded) {
          throw new Error("The tutor didn't respond. Please try again.");
        }
      } catch (err) {
        // Drop the optimistic student bubble (and any half-streamed tutor
        // bubble) so the student can retry cleanly.
        setTurns((prev) => {
          const lastStudentIdx = prev.findLastIndex(
            (t) => t.role === "student"
          );
          if (lastStudentIdx >= 0) return prev.slice(0, lastStudentIdx);
          return prev;
        });
        setInput(message);
        setError(
          err instanceof Error ? err.message : "Failed to get a reply."
        );
      } finally {
        setIsWaiting(false);
        setHasFirstToken(false);
      }
    },
    [turns, chapterId, classLevel, chapterLabel, subject]
  );

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isWaiting) return;
    submitDoubt(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const starters = [
    `Explain the main idea of ${chapterLabel} in the simplest way`,
    `What are the key formulas in ${chapterLabel}?`,
    "I'm stuck on a problem — can I paste it and you walk me through it?",
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TutorAvatar />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Ask a doubt
            </p>
            <p className="text-xs text-slate-500">
              Stuck on anything in {chapterLabel}? Ask and I&apos;ll break it
              down.
            </p>
          </div>
        </div>
        {turns.length > 0 && !isWaiting && (
          <button
            onClick={() => {
              setTurns([]);
              setError(null);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition active:scale-95 hover:border-slate-300 hover:bg-slate-50"
          >
            New doubt
          </button>
        )}
      </div>

      {/* Thread */}
      <div className="flex flex-col gap-4">
        {turns.length === 0 && !isWaiting && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-6">
            <p className="text-center text-sm text-slate-500">
              Type your question below — paste a problem you&apos;re stuck on, or
              ask about any concept. I&apos;ll explain it step by step.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => submitDoubt(s)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-sm text-slate-700 transition active:scale-[0.99] hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"
                >
                  {s}
                </button>
              ))}
            </div>
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
                  <div className="whitespace-pre-wrap break-words">
                    <LatexRenderer text={turn.content} />
                    {turn.isStreaming && (
                      <span
                        className="ml-0.5 inline-block h-4 w-0.5 bg-zinc-500 align-middle"
                        style={{
                          animation: "cursor-blink 0.6s step-end infinite",
                        }}
                      />
                    )}
                  </div>
                  {!turn.isStreaming && turn.content && (
                    <div className="-mb-1">
                      <SpeakButton text={turn.content} />
                    </div>
                  )}
                </div>
              ) : (
                <span className="whitespace-pre-wrap break-words">
                  {turn.content}
                </span>
              )}
            </div>
          </div>
        ))}

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

      {/* Input */}
      {!isWaiting && (
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={5000}
            rows={3}
            placeholder="Ask your doubt, or paste a problem you're stuck on…"
            className="block w-full resize-y rounded-xl border-0 bg-transparent px-2 py-2 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
            <span className="text-xs text-slate-400">{input.length} / 5000</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:active:scale-100"
            >
              Ask
              <span aria-hidden>↵</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
