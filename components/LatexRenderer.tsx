"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface LatexRendererProps {
  text: string;
}

interface Segment {
  type: "text" | "inline" | "display";
  content: string;
}

function parseLatex(input: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;

  while (i < input.length) {
    // Escaped dollar sign
    if (input[i] === "\\" && input[i + 1] === "$") {
      segments.push({ type: "text", content: "$" });
      i += 2;
      continue;
    }

    // Display math $$...$$
    if (input[i] === "$" && input[i + 1] === "$") {
      const start = i + 2;
      const end = input.indexOf("$$", start);
      if (end === -1) {
        segments.push({ type: "text", content: input.slice(i) });
        break;
      }
      segments.push({ type: "display", content: input.slice(start, end) });
      i = end + 2;
      continue;
    }

    // Inline math $...$
    if (input[i] === "$") {
      const start = i + 1;
      const end = input.indexOf("$", start);
      if (end === -1) {
        segments.push({ type: "text", content: input.slice(i) });
        break;
      }
      segments.push({ type: "inline", content: input.slice(start, end) });
      i = end + 1;
      continue;
    }

    // Plain text — accumulate until next $ or end
    const nextDollar = input.indexOf("$", i);
    const nextEscape = input.indexOf("\\$", i);
    let textEnd: number;

    if (nextDollar === -1) {
      textEnd = input.length;
    } else if (nextEscape !== -1 && nextEscape < nextDollar) {
      textEnd = nextEscape;
    } else {
      textEnd = nextDollar;
    }

    if (textEnd > i) {
      segments.push({ type: "text", content: input.slice(i, textEnd) });
    }
    i = textEnd;
  }

  return segments;
}

export default function LatexRenderer({ text }: LatexRendererProps) {
  const segments = parseLatex(text);

  return (
    <span>
      {segments.map((seg, idx) => {
        if (seg.type === "display") {
          return <BlockMath key={idx} math={seg.content} />;
        }
        if (seg.type === "inline") {
          return <InlineMath key={idx} math={seg.content} />;
        }
        return <span key={idx}>{seg.content}</span>;
      })}
    </span>
  );
}
