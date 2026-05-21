/**
 * lesson-v3.0 prompts: narrative + per-diagram pure-SVG.
 *
 * These prompts are called from the local seed script (scripts/seed-lessons.mjs),
 * NOT from any Vercel runtime. Output is parsed with safeParseClaudeJson.
 */

export const LESSON_V3_VERSION = "lesson-v3.0";

interface NarrativePromptParams {
  chapterId: string;
  chapterLabel: string;
  classLevel: "11" | "12";
  chapterDescription: string;
  subtopics: string[];
  suggestedDiagrams: string[];
}

export function buildLessonNarrativePrompt(params: NarrativePromptParams): {
  system: string;
  user: string;
  promptVersion: string;
} {
  const system = `You are writing a 'Learn this chapter' page for an AI maths tutor used by ISC Class 11 and 12 Science students in India. Imagine the very best one-to-one tutor — the kind who builds intuition before procedure, anchors every idea in a concrete example, and warns students about the exact mistakes they make in board exams.

You will receive:
- chapterId, chapterLabel, classLevel
- chapterDescription (one paragraph from the syllabus)
- subtopics: the actual ISC subtopics for this chapter (8–12 items)
- suggestedDiagrams: 2–3 visual suggestions you may use or improve on

Output ONLY a single valid JSON object — no markdown fences, no commentary before or after. Schema:

{
  "syllabusCoverage": ["<echo the chapter's 8–12 ISC subtopics; tweak wording if needed>"],
  "hook": "<1–2 sentence opening that makes a 16-year-old Indian student care. MUST reference a CURRENT real-world thing — Instagram algorithm, FIFA / IPL stats, JEE rank distributions, Spotify recommendations, ChatGPT, gaming RNG, UPI transactions, Netflix recs, cricket DLS method, etc. PICK something that genuinely fits THIS chapter — do not reuse Instagram for every chapter.>",
  "narrative": {
    "beats": [
      {
        "title": "<punchy 4–6 word heading>",
        "content": "<2–4 sentences of teaching. At least one concrete worked example with REAL numbers. LaTeX inline with $...$, display with $$...$$. Build intuition before the formula. Cover 1–2 of the listed subtopics in this beat.>"
      }
      // ... 9 to 11 beats total. Together they MUST cover at least 50% of the listed subtopics.
    ],
    "commonMistakes": [
      { "mistake": "<the specific thing students get wrong>", "why": "<one sentence>", "fix": "<one sentence, actionable>" }
      // ... 4 to 5 items
    ],
    "quickReferenceCard": [
      "<4–6 of the most important formulas / definitions, each terse enough to fit on a flashcard. LaTeX with $...$.>"
    ],
    "keyTakeaway": "<the ONE sentence that summarises the whole chapter>"
  },
  "diagramPlan": [
    { "title": "<short diagram title>", "description": "<concrete description of what the diagram should show — what shapes, what labels, what relationships>", "afterBeat": <integer 0..(beats.length-1) — which beat this diagram visually supports> }
    // ... 2 to 4 diagrams total. Prefer ideas from suggestedDiagrams but you may improve on them.
  ]
}

HARD STYLE RULES:
- Teach REAL substance, not a vague overview. Concrete > abstract every time.
- Never start a beat with the formula — start with the idea.
- Never write 'In this chapter, we will learn about…' or any meta filler.
- Vary the hook theme by chapter — do NOT reuse Instagram or IPL for unrelated chapters.
- All formulas inline as $...$ (never bare text like "x^2 + y^2 = r^2").
- The diagramPlan's afterBeat indices MUST be valid (0-based, less than beats.length).
- Output ONLY the JSON object — no \`\`\`json fences, no prose.`;

  const user = `chapterId: ${params.chapterId}
chapterLabel: ${params.chapterLabel}
classLevel: ${params.classLevel}
chapterDescription: ${params.chapterDescription}

ISC syllabus subtopics for this chapter:
${params.subtopics.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Suggested diagrams (use or improve):
${params.suggestedDiagrams.map((d, i) => `${i + 1}. ${d}`).join("\n")}

Output the JSON object now.`;

  return { system, user, promptVersion: LESSON_V3_VERSION };
}

interface DiagramPromptParams {
  chapterLabel: string;
  classLevel: "11" | "12";
  diagramTitle: string;
  diagramDescription: string;
  primaryHex: string;
  secondaryHex: string;
}

export function buildLessonDiagramPrompt(params: DiagramPromptParams): {
  system: string;
  user: string;
  promptVersion: string;
} {
  const system = `You are an expert at creating beautiful, mathematically ACCURATE SVG diagrams for high-school maths. Output ONLY a single <svg>...</svg> element — no markdown fences, no commentary, no <html> wrapper.

HARD CONSTRAINTS:
- NO JavaScript, NO <script>, NO event handlers (on*), NO <foreignObject>.
- Pure SVG only: <rect>, <circle>, <ellipse>, <line>, <polyline>, <polygon>, <path>, <text>, <g>, <defs>, <linearGradient>, <radialGradient>, <stop>, <filter>, <feGaussianBlur>, <feDropShadow>, <feMerge>, <marker>.
- viewBox="0 0 600 400", preserveAspectRatio="xMidYMid meet".
- White background (draw a <rect width="600" height="400" fill="white"/> as the first element, or omit if a coloured background is intentional).
- Use the provided primary and secondary hex colours for strokes/fills, with neutrals (#1f2937 for dark text, #6b7280 for secondary text, #e5e7eb for guide lines).
- Compute all coordinates and angles correctly — this is a MATH diagram, geometric accuracy is the entire point. If you are showing a 30° angle, the angle MUST actually be 30°. If you are graphing y = sin x, the curve points MUST satisfy that equation.
- Labels: readable font sizes (14–18px), font-family="system-ui, -apple-system, sans-serif". Position labels so they don't overlap shapes.
- Use one subtle linear gradient, soft shadow via filter, and rounded line caps (stroke-linecap="round") to make it visually polished — but never at the expense of mathematical accuracy.
- The SVG MUST be self-contained and renderable directly in a browser via dangerouslySetInnerHTML. No external references, no <image href="…">.`;

  const user = `Create the SVG diagram now.

Chapter: ${params.chapterLabel} (ISC Class ${params.classLevel})
Diagram title: ${params.diagramTitle}
What it should show: ${params.diagramDescription}

Colour palette:
- primary: ${params.primaryHex}
- secondary: ${params.secondaryHex}

Output ONLY the <svg>...</svg> element.`;

  return { system, user, promptVersion: LESSON_V3_VERSION };
}
