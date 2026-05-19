"use client";

import LatexRenderer from "@/components/LatexRenderer";

interface StreamingMessageProps {
  text: string;
  isStreaming: boolean;
}

export default function StreamingMessage({
  text,
  isStreaming,
}: StreamingMessageProps) {
  return (
    <span>
      <LatexRenderer text={text} />
      {isStreaming && (
        <span
          className="ml-0.5 inline-block h-4 w-0.5 bg-zinc-500"
          style={{
            animation: "cursor-blink 0.6s step-end infinite",
          }}
        />
      )}
      {isStreaming && (
        <style>{`
          @keyframes cursor-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
      )}
    </span>
  );
}
