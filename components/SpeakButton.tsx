"use client";

import { useState, useCallback, useEffect } from "react";
import { stripLatexForSpeech } from "@/lib/strip-latex";

interface SpeakButtonProps {
  text: string;
  label?: string;
}

export default function SpeakButton({
  text,
  label = "Listen",
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  // Check for browser support
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return null;
  }

  const handleClick = useCallback(() => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const cleaned = stripLatexForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleaned);

    // Prefer en-IN, fall back to en-US
    const voices = window.speechSynthesis.getVoices();
    const enIN = voices.find((v) => v.lang === "en-IN");
    const enUS = voices.find((v) => v.lang.startsWith("en"));
    utterance.voice = enIN ?? enUS ?? null;
    utterance.lang = enIN ? "en-IN" : "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [text, speaking]);

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (speaking) window.speechSynthesis.cancel();
    };
  }, [speaking]);

  return (
    <button
      onClick={handleClick}
      title={speaking ? "Stop" : label}
      className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={speaking ? "animate-pulse" : ""}
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
      {speaking && (
        <span className="text-[10px]">Speaking...</span>
      )}
    </button>
  );
}
