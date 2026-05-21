/**
 * Local lesson seeder for ISC Tutor.
 *
 * This script lives OUTSIDE the Vercel runtime — it talks to Claude (narrative
 * + per-diagram SVG) and OpenAI (hero image) from your machine, then writes the
 * finished `isctutor_chapter_lessons/{lessonId}` documents to Firestore via the
 * Admin SDK. The app itself is now read-only for lessons, so the 60s Vercel
 * Hobby timeout no longer matters.
 *
 * Run:
 *     node scripts/seed-lessons.mjs                    # all missing chapters
 *     node scripts/seed-lessons.mjs --only=sets        # one chapter
 *     node scripts/seed-lessons.mjs --force            # regenerate everything
 *     node scripts/seed-lessons.mjs --only=sets --force
 *     node scripts/seed-lessons.mjs --no-image         # skip hero image
 *
 * Requires (.env.local):
 *     ANTHROPIC_API_KEY
 *     OPENAI_API_KEY           (omit if running with --no-image)
 *     FIREBASE_PROJECT_ID
 *     FIREBASE_CLIENT_EMAIL
 *     FIREBASE_PRIVATE_KEY
 *     FIRESTORE_COLLECTION_PREFIX   (e.g. isctutor_)
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ---------------- config ----------------

const PROMPT_VERSION = "lesson-v3.0";
const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadJSON(relPath) {
  return JSON.parse(readFileSync(resolve(ROOT, relPath), "utf-8"));
}

const ISC_SYLLABUS_JSON = loadJSON("data/isc-syllabus.json");
const CHAPTER_SYLLABUS_JSON = loadJSON("data/isc-chapter-syllabus.json");

// Theme hex palette mirror of lib/chapter-theme.ts. Used only for the diagram
// prompt — the app's full theme object is read at render time on the client.
const CHAPTER_HEX = {
  "sets":                              { primary: "#3b82f6", secondary: "#a855f7" },
  "relations-functions":               { primary: "#10b981", secondary: "#14b8a6" },
  "trigonometric-functions":           { primary: "#f59e0b", secondary: "#f97316" },
  "principle-mathematical-induction":  { primary: "#f43f5e", secondary: "#ec4899" },
  "complex-numbers-quadratic":         { primary: "#6366f1", secondary: "#3b82f6" },
  "linear-inequalities":               { primary: "#14b8a6", secondary: "#06b6d4" },
  "permutations-combinations":         { primary: "#8b5cf6", secondary: "#d946ef" },
  "binomial-theorem":                  { primary: "#0ea5e9", secondary: "#3b82f6" },
  "sequences-series":                  { primary: "#84cc16", secondary: "#22c55e" },
  "straight-lines":                    { primary: "#64748b", secondary: "#52525b" },
  "conic-sections":                    { primary: "#f97316", secondary: "#ef4444" },
  "intro-3d-geometry":                 { primary: "#a855f7", secondary: "#8b5cf6" },
  "limits-derivatives":                { primary: "#ec4899", secondary: "#f43f5e" },
  "mathematical-reasoning":            { primary: "#06b6d4", secondary: "#14b8a6" },
  "statistics":                        { primary: "#3b82f6", secondary: "#6366f1" },
  "probability":                       { primary: "#06b6d4", secondary: "#0ea5e9" },
  "relations-functions-12":            { primary: "#10b981", secondary: "#22c55e" },
  "inverse-trigonometric-functions":   { primary: "#d97706", secondary: "#eab308" },
  "matrices":                          { primary: "#64748b", secondary: "#71717a" },
  "determinants":                      { primary: "#4b5563", secondary: "#64748b" },
  "continuity-differentiability":      { primary: "#6366f1", secondary: "#2563eb" },
  "applications-derivatives":          { primary: "#f43f5e", secondary: "#ef4444" },
  "integrals":                         { primary: "#ef4444", secondary: "#f97316" },
  "applications-integrals":            { primary: "#ec4899", secondary: "#d946ef" },
  "differential-equations":            { primary: "#7c3aed", secondary: "#a855f7" },
  "vectors":                           { primary: "#a855f7", secondary: "#8b5cf6" },
  "3d-geometry":                       { primary: "#d946ef", secondary: "#9333ea" },
  "linear-programming":                { primary: "#22c55e", secondary: "#10b981" },
  "probability-12":                    { primary: "#0ea5e9", secondary: "#06b6d4" },
};

function getHex(chapterId) {
  return CHAPTER_HEX[chapterId] ?? { primary: "#3b82f6", secondary: "#a855f7" };
}

// ---------------- CLI args ----------------

const args = process.argv.slice(2);
function flag(name) {
  return args.includes(`--${name}`);
}
function arg(name) {
  const prefix = `--${name}=`;
  const found = args.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}
const ONLY = arg("only");           // restrict to one chapterId
const FORCE = flag("force");        // regenerate even if v3.0 exists
const NO_IMAGE = flag("no-image");  // skip hero image

// ---------------- env ----------------

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env var ${name}. Set it in .env.local.`);
    process.exit(1);
  }
  return v;
}

requireEnv("ANTHROPIC_API_KEY");
requireEnv("FIREBASE_PROJECT_ID");
requireEnv("FIREBASE_CLIENT_EMAIL");
requireEnv("FIREBASE_PRIVATE_KEY");
if (!NO_IMAGE) requireEnv("OPENAI_API_KEY");

// Mirrors lib/firebase-admin.ts parsePrivateKey logic so the seed script can
// boot with the same env-var conventions as the app.
function parsePrivateKey() {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  let key = raw.replace(/^["']|["']$/g, "");
  key = key.replace(/\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
  if (!key.includes("-----BEGIN PRIVATE KEY-----") || !key.includes("-----END PRIVATE KEY-----")) {
    throw new Error("FIREBASE_PRIVATE_KEY does not look like a PEM key.");
  }
  return key;
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: parsePrivateKey(),
    }),
  });
}
const db = getFirestore();
const COLLECTION_PREFIX = process.env.FIRESTORE_COLLECTION_PREFIX || "";
const CHAPTER_LESSONS_COLLECTION = `${COLLECTION_PREFIX}chapter_lessons`;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = NO_IMAGE
  ? null
  : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---------------- helpers ----------------

function safeParseClaudeJson(raw) {
  let text = raw.trim();
  text = text.replace(/^```(?:json|JSON)?\s*\n?/, "");
  text = text.replace(/\n?```\s*$/, "");
  text = text.trim();
  if (!text.startsWith("{") && !text.startsWith("[")) {
    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");
    const start =
      firstBrace === -1
        ? firstBracket
        : firstBracket === -1
          ? firstBrace
          : Math.min(firstBrace, firstBracket);
    if (start > 0) text = text.slice(start);
  }
  return JSON.parse(text);
}

/**
 * Strip everything dangerous from a Claude-produced SVG before storing.
 * The SVG is rendered client-side via dangerouslySetInnerHTML, so we treat
 * this as the only defence even though we trust the source.
 */
function sanitizeSvg(raw) {
  let svg = raw.trim();
  svg = svg.replace(/^```(?:svg|xml|html)?\s*\n?/i, "").replace(/\n?```\s*$/, "");
  svg = svg.trim();

  // If model returned text before/after the <svg>...</svg>, extract just that.
  const open = svg.indexOf("<svg");
  const close = svg.lastIndexOf("</svg>");
  if (open >= 0 && close > open) {
    svg = svg.slice(open, close + "</svg>".length);
  }

  // Remove <script>...</script> blocks (case-insensitive, multiline).
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
  // Remove <foreignObject>...</foreignObject> blocks.
  svg = svg.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  // Remove any on* event-handler attribute.
  svg = svg.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  svg = svg.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
  // Strip javascript: URLs.
  svg = svg.replace(/javascript\s*:/gi, "");

  if (!svg.startsWith("<svg") || !svg.endsWith("</svg>")) {
    throw new Error("SVG output did not contain a valid <svg>…</svg> root.");
  }
  return svg;
}

// ---------------- prompts (mirror of lib/prompts/lesson.ts) ----------------

function buildLessonNarrativePrompt({
  chapterId,
  chapterLabel,
  classLevel,
  chapterDescription,
  subtopics,
  suggestedDiagrams,
}) {
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

  const user = `chapterId: ${chapterId}
chapterLabel: ${chapterLabel}
classLevel: ${classLevel}
chapterDescription: ${chapterDescription}

ISC syllabus subtopics for this chapter:
${subtopics.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Suggested diagrams (use or improve):
${suggestedDiagrams.map((d, i) => `${i + 1}. ${d}`).join("\n")}

Output the JSON object now.`;

  return { system, user };
}

function buildLessonDiagramPrompt({
  chapterLabel,
  classLevel,
  diagramTitle,
  diagramDescription,
  primaryHex,
  secondaryHex,
}) {
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

Chapter: ${chapterLabel} (ISC Class ${classLevel})
Diagram title: ${diagramTitle}
What it should show: ${diagramDescription}

Colour palette:
- primary: ${primaryHex}
- secondary: ${secondaryHex}

Output ONLY the <svg>...</svg> element.`;

  return { system, user };
}

// ---------------- LLM calls ----------------

async function callClaudeText(system, user, { maxTokens = 4096 } = {}) {
  const response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = response.content.find((b) => b.type === "text");
  if (!block) throw new Error("Claude returned no text block");
  return block.text;
}

async function generateNarrative(chapter) {
  const syl = CHAPTER_SYLLABUS_JSON.chapters[chapter.id];
  if (!syl) throw new Error(`No syllabus map for chapterId ${chapter.id}`);
  const { system, user } = buildLessonNarrativePrompt({
    chapterId: chapter.id,
    chapterLabel: chapter.label,
    classLevel: chapter.classLevel,
    chapterDescription: chapter.description ?? chapter.label,
    subtopics: syl.subtopics,
    suggestedDiagrams: syl.suggestedDiagrams,
  });
  const raw = await callClaudeText(system, user, { maxTokens: 6000 });
  const parsed = safeParseClaudeJson(raw);

  if (!parsed.narrative || !Array.isArray(parsed.narrative.beats)) {
    throw new Error("Narrative output is missing narrative.beats");
  }
  if (!Array.isArray(parsed.diagramPlan)) {
    throw new Error("Narrative output is missing diagramPlan");
  }
  // Coerce/clamp afterBeat indices.
  const beatsLen = parsed.narrative.beats.length;
  for (const d of parsed.diagramPlan) {
    if (typeof d.afterBeat !== "number" || d.afterBeat < 0 || d.afterBeat >= beatsLen) {
      d.afterBeat = Math.min(Math.max(0, Math.floor(d.afterBeat ?? 0)), beatsLen - 1);
    }
  }
  return parsed;
}

async function generateDiagramSvg(chapter, diagramPlanItem) {
  const { primary, secondary } = getHex(chapter.id);
  const { system, user } = buildLessonDiagramPrompt({
    chapterLabel: chapter.label,
    classLevel: chapter.classLevel,
    diagramTitle: diagramPlanItem.title,
    diagramDescription: diagramPlanItem.description,
    primaryHex: primary,
    secondaryHex: secondary,
  });
  const raw = await callClaudeText(system, user, { maxTokens: 4096 });
  return sanitizeSvg(raw);
}

async function generateHeroImage(chapter) {
  if (!openai) return null;
  const { primary } = getHex(chapter.id);
  const prompt = `Create a beautiful, conceptual illustration representing '${chapter.label}' from ISC Class ${chapter.classLevel} Mathematics. Style: vibrant modern abstract geometric shapes, professional educational illustration for high school students aged 16-18. NO TEXT, NO PEOPLE, NO HANDS. Use ${primary} as the dominant accent color with complementary gradients. The composition should feel inspiring and curious — like the moment you first 'get' a concept. Suitable as a hero banner image. Square format.`;

  const response = await openai.images.generate({
    model: OPENAI_IMAGE_MODEL,
    prompt,
    n: 1,
    size: "1024x1024",
    ...(OPENAI_IMAGE_MODEL === "gpt-image-1" ? { quality: "high" } : { quality: "hd" }),
  });

  const imageData = response.data?.[0];
  if (!imageData) throw new Error("OpenAI returned no image data");
  if (imageData.b64_json) {
    return { base64: imageData.b64_json, mimeType: "image/png" };
  }
  if (imageData.url) {
    const r = await fetch(imageData.url);
    const buf = Buffer.from(await r.arrayBuffer());
    return { base64: buf.toString("base64"), mimeType: "image/png" };
  }
  throw new Error("OpenAI response had neither b64_json nor url");
}

// ---------------- main seed loop ----------------

function listAllChapters() {
  const out = [];
  const classes = ISC_SYLLABUS_JSON.subjects.mathematics.classes;
  for (const classLevel of ["11", "12"]) {
    for (const ch of classes[classLevel].chapters) {
      out.push({ ...ch, classLevel });
    }
  }
  return out;
}

async function seedChapter(chapter) {
  const lessonId = `${chapter.classLevel}-${chapter.id}`;
  const ref = db.collection(CHAPTER_LESSONS_COLLECTION).doc(lessonId);
  const start = Date.now();

  if (!FORCE) {
    const snap = await ref.get();
    if (snap.exists && snap.data()?.promptVersion === PROMPT_VERSION) {
      console.log(`SKIP ${lessonId} (already ${PROMPT_VERSION})`);
      return { status: "skipped" };
    }
  }

  process.stdout.write(`GEN  ${lessonId} — narrative... `);
  const narrative = await generateNarrative(chapter);
  process.stdout.write(`${narrative.narrative.beats.length} beats; diagrams... `);

  const diagrams = [];
  for (let i = 0; i < narrative.diagramPlan.length; i++) {
    const item = narrative.diagramPlan[i];
    try {
      const svg = await generateDiagramSvg(chapter, item);
      diagrams.push({
        id: `${lessonId}-d${i}`,
        title: item.title,
        svg,
        caption: item.description,
        afterBeat: item.afterBeat,
      });
      process.stdout.write(`${i + 1} `);
    } catch (err) {
      process.stdout.write(`(d${i} FAILED: ${err instanceof Error ? err.message : String(err)}) `);
    }
  }

  let heroImageBase64 = null;
  let heroImageMimeType = null;
  if (!NO_IMAGE) {
    process.stdout.write(`image... `);
    try {
      const img = await generateHeroImage(chapter);
      if (img) {
        heroImageBase64 = img.base64;
        heroImageMimeType = img.mimeType;
        process.stdout.write(`ok `);
      }
    } catch (err) {
      process.stdout.write(`(image FAILED: ${err instanceof Error ? err.message : String(err)}) `);
    }
  }

  const doc = {
    chapterId: chapter.id,
    classLevel: chapter.classLevel,
    lessonId,
    promptVersion: PROMPT_VERSION,
    generatedAt: FieldValue.serverTimestamp(),
    syllabusCoverage: narrative.syllabusCoverage,
    hook: narrative.hook,
    heroImageBase64,
    heroImageMimeType,
    diagrams,
    narrative: {
      beats: narrative.narrative.beats,
      commonMistakes: narrative.narrative.commonMistakes,
      quickReferenceCard: narrative.narrative.quickReferenceCard,
      keyTakeaway: narrative.narrative.keyTakeaway,
    },
  };

  await ref.set(doc);
  const secs = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `\nDONE ${chapter.id} — ${doc.narrative.beats.length} beats, ${diagrams.length} diagrams, image: ${heroImageBase64 ? "yes" : "no"}, ${secs}s`
  );
  return { status: "seeded" };
}

async function main() {
  let chapters = listAllChapters();
  if (ONLY) {
    chapters = chapters.filter((c) => c.id === ONLY);
    if (chapters.length === 0) {
      console.error(`--only=${ONLY} matched no chapter`);
      process.exit(1);
    }
  }

  console.log(
    `Seeding ${chapters.length} chapter(s). Version: ${PROMPT_VERSION}. force=${FORCE} noImage=${NO_IMAGE}`
  );

  const failures = [];
  let seeded = 0;
  let skipped = 0;

  for (const ch of chapters) {
    try {
      const r = await seedChapter(ch);
      if (r.status === "seeded") seeded++;
      else if (r.status === "skipped") skipped++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`\nFAIL ${ch.classLevel}-${ch.id}: ${msg}`);
      failures.push({ id: `${ch.classLevel}-${ch.id}`, error: msg });
    }
  }

  console.log(
    `\n${seeded}/${chapters.length} seeded${skipped ? `, ${skipped} skipped` : ""}.`
  );
  if (failures.length > 0) {
    console.log(`Failed: ${failures.map((f) => f.id).join(", ")}`);
    console.log(`Re-run to retry.`);
  }
  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
