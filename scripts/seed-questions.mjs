/**
 * Local question-bank seeder for ISC Tutor.
 *
 * Generates a pre-verified pool of practice questions per chapter via
 * Anthropic Claude and writes them to Firestore at `${PREFIX}question_bank/{auto-id}`.
 * The runtime API reads from this pool first; only on a miss does it fall
 * back to runtime Claude generation. This script lives OUTSIDE Vercel —
 * run it locally.
 *
 * For each (chapterId, difficulty, type) slot it does:
 *   1. Generate a question + concise solution + proposed answer with Claude.
 *   2. INDEPENDENTLY re-solve the same question with Claude (no access to
 *      the proposed answer / solution) and compare.
 *   3. Only if both agree, write `verified: true` to Firestore. Otherwise
 *      discard and try again — never serve unverified.
 *
 * Run:
 *     node scripts/seed-questions.mjs                          # all chapters
 *     node scripts/seed-questions.mjs --only=sets              # one chapter
 *     node scripts/seed-questions.mjs --force                  # regen even if full
 *     node scripts/seed-questions.mjs --target=25              # override per-chapter target
 *     node scripts/seed-questions.mjs --list                   # show per-chapter counts and exit
 *     node scripts/seed-questions.mjs --only=sets --max-attempts=3
 *
 * Requires (.env.local):
 *     ANTHROPIC_API_KEY
 *     ANTHROPIC_QGEN_MODEL           (default: claude-sonnet-4-20250514)
 *     FIREBASE_PROJECT_ID
 *     FIREBASE_CLIENT_EMAIL
 *     FIREBASE_PRIVATE_KEY
 *     FIRESTORE_COLLECTION_PREFIX    (e.g. isctutor_)
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ---------------- config ----------------

// Use a current Claude model for seeding regardless of the runtime
// ANTHROPIC_MODEL setting (which the app may keep pinned to a specific
// snapshot). Override with ANTHROPIC_QGEN_MODEL if you want a different
// seed model.
const MODEL = process.env.ANTHROPIC_QGEN_MODEL || "claude-sonnet-4-6";
const SOURCE_TAG = `seed-anthropic-${MODEL}`;
const TARGET_DEFAULT = 35;

// Difficulty distribution: 7 + 8 + 8 + 7 + 5 = 35 (sums to TARGET_DEFAULT).
// We scale proportionally if user passes --target.
// Weighted toward d1-d3 because that's where most board-exam practice sits;
// d4-d5 (JEE Main/Advanced) is the stretch range for top students.
const DIFFICULTY_BASE = { 1: 7, 2: 8, 3: 8, 4: 7, 5: 5 };

// Type weights by difficulty tier. Each entry is { type: weight }.
const TYPE_MIX = {
  1: { "single-correct": 3, numerical: 1 },
  2: { "single-correct": 3, numerical: 2 },
  3: { "single-correct": 2, numerical: 2, "multiple-correct": 1 },
  4: { numerical: 2, "single-correct": 1, "multiple-correct": 1, "assertion-reason": 1 },
  5: { "multiple-correct": 2, numerical: 1, "assertion-reason": 1 },
};

const TYPES = ["single-correct", "numerical", "multiple-correct", "assertion-reason"];

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
function loadJSON(rel) {
  return JSON.parse(readFileSync(resolve(ROOT, rel), "utf-8"));
}

const ISC_SYLLABUS_JSON = loadJSON("data/isc-syllabus.json");
const CHAPTER_SYLLABUS_JSON = loadJSON("data/isc-chapter-syllabus.json");

// ---------------- CLI args ----------------

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const arg = (n) => {
  const p = `--${n}=`;
  const f = args.find((a) => a.startsWith(p));
  return f ? f.slice(p.length) : null;
};
const ONLY = arg("only");
const FORCE = flag("force");
const LIST = flag("list");
const TARGET = Number(arg("target") || TARGET_DEFAULT);
const MAX_ATTEMPTS_PER_SLOT = Number(arg("max-attempts") || 2);

// Scale base distribution to TARGET.
const scale = TARGET / TARGET_DEFAULT;
const DIFFICULTY_TARGETS = Object.fromEntries(
  Object.entries(DIFFICULTY_BASE).map(([d, n]) => [d, Math.max(1, Math.round(n * scale))])
);

// ---------------- env + firebase ----------------

function requireEnv(name) {
  if (!process.env[name]) {
    console.error(`Missing env var ${name}. Set it in .env.local.`);
    process.exit(1);
  }
}
requireEnv("ANTHROPIC_API_KEY");
requireEnv("FIREBASE_PROJECT_ID");
requireEnv("FIREBASE_CLIENT_EMAIL");
requireEnv("FIREBASE_PRIVATE_KEY");

function parsePrivateKey() {
  let key = process.env.FIREBASE_PRIVATE_KEY.replace(/^["']|["']$/g, "");
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
const PREFIX = process.env.FIRESTORE_COLLECTION_PREFIX || "";
const COLLECTION = `${PREFIX}question_bank`;
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------- helpers ----------------

function listAllChapters() {
  const out = [];
  const classes = ISC_SYLLABUS_JSON.subjects.mathematics.classes;
  for (const classLevel of ["11", "12"]) {
    for (const ch of classes[classLevel].chapters) out.push({ ...ch, classLevel });
  }
  return out;
}

function pickType(difficulty) {
  const mix = TYPE_MIX[difficulty];
  const entries = Object.entries(mix);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [t, w] of entries) {
    r -= w;
    if (r <= 0) return t;
  }
  return entries[0][0];
}

// Extract the first top-level JSON object/array even if the model wrapped
// it in markdown fences or added explanatory prose before/after. Walks the
// string brace-by-brace so trailing prose can't break us.
function safeParseJSON(raw) {
  let text = String(raw).trim();
  text = text.replace(/^```(?:json|JSON)?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();

  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  let start = -1;
  if (firstBrace >= 0 && (firstBracket < 0 || firstBrace < firstBracket)) start = firstBrace;
  else if (firstBracket >= 0) start = firstBracket;
  if (start < 0) throw new Error(`No JSON object/array found in response (got: ${text.slice(0, 120)}…)`);

  const open = text[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') { inString = true; continue; }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end < 0) throw new Error(`Unbalanced JSON braces (raw start: ${text.slice(start, start + 120)}…)`);
  return JSON.parse(text.slice(start, end + 1));
}

const DIFFICULTY_LABELS = {
  1: "Difficulty 1 (SIMPLE) — direct formula, single step. The kind of warm-up question that opens an ISC/CBSE board paper. Must be the type of question that's appeared (with variations) on past board papers. 1-2 marks.",
  2: "Difficulty 2 (MEDIUM) — two-step board question, recognise the right formula, then apply. Standard mid-paper board question. The kind that shows up in Section A / B of ISC and CBSE Maths papers. 3 marks.",
  3: "Difficulty 3 (COMPLEX) — full board-exam Section B / C question that an above-average student should solve. Multi-step but each step is standard. The hardest board question a typical student will see. 4-6 marks.",
  4: "Difficulty 4 (MORE COMPLEX) — JEE Main level. Multi-concept, requires connecting two ideas from this chapter or a small twist on a standard technique. Often numerical-answer type. Above board difficulty but below IIT.",
  5: "Difficulty 5 (IIT RANGE) — JEE Advanced level. Non-obvious approach; rewards a student who really understands the chapter. Multi-correct or assertion-reason format is common. Reserved for the top-tier student.",
};

const TYPE_INSTRUCTIONS = {
  "single-correct": `Produce a single-correct MCQ with EXACTLY 4 options labelled A, B, C, D. Exactly one option is correct.
"options" must be an array of 4 strings, EACH starting with "A) ", "B) ", "C) ", or "D) ".
"correctAnswer" is the single letter "A" / "B" / "C" / "D".`,
  "numerical": `Produce a numerical-answer (integer or decimal) question in the JEE-Main / JEE-Advanced numerical style.
"options" must be omitted (or null).
"correctAnswer" is the numeric answer as a STRING (e.g. "42", "-3.5", "0.25"). If the natural answer is a small fraction, write it as a decimal rounded to 4 d.p. Do NOT include units inside correctAnswer.`,
  "multiple-correct": `Produce a JEE-Advanced style multiple-correct MCQ with EXACTLY 4 options labelled A, B, C, D. ONE OR MORE options are correct.
"options" must be an array of 4 strings, EACH starting with "A) ", "B) " etc.
"correctAnswer" is a comma-separated string of the correct letters in alphabetical order (e.g. "A,C" or "B,C,D"). Do NOT include spaces around the commas.`,
  "assertion-reason": `Produce a JEE-Main style Assertion–Reason question.
"questionText" must contain "Assertion (A): ..." and "Reason (R): ..." (use those exact labels).
"options" must be exactly:
[
  "A) Both A and R are true, and R is the correct explanation of A.",
  "B) Both A and R are true, but R is NOT the correct explanation of A.",
  "C) A is true but R is false.",
  "D) A is false but R is true."
]
"correctAnswer" is the single letter "A" / "B" / "C" / "D".`,
};

function buildGenerationPrompt({ chapter, classLevel, difficulty, type, subtopics, recentStems }) {
  const subtopicsList = subtopics.map((s, i) => `  ${i + 1}. ${s}`).join("\n");
  const recents = recentStems.length > 0
    ? `\nRecent question stems already generated for this chapter (avoid duplicating their idea):\n${recentStems.slice(-8).map((s, i) => `  ${i + 1}. ${s}`).join("\n")}\n`
    : "";

  const system = `You are an expert question writer for ISC (Class ${classLevel}) Mathematics — and you also write JEE Main / Advanced practice for the same students. Your job is to produce ORIGINAL questions that are HIGH-YIELD for the BOARD EXAM first, with JEE-tier stretch material at the upper end.

CRITICAL: Difficulty 1, 2, and 3 are BOARD EXAM TARGETED. Mirror the style, vocabulary, and step-pattern of actual ISC ${classLevel} Mathematics papers (and CBSE Class ${classLevel} papers where they overlap). These should be the questions a student MUST be able to solve to score well on their board.

Difficulty 4 is stretch — JEE Main level. Difficulty 5 is the top — JEE Advanced level for IIT aspirants.

Every question must be MATHEMATICALLY CORRECT and unambiguously phrased.

Output ONLY a single JSON object. No markdown fences, no prose around it. Schema:

{
  "questionText": "<the question, LaTeX inline as $...$ and display as $$...$$. ${type === "assertion-reason" ? "MUST include 'Assertion (A):' and 'Reason (R):' lines." : "No final answer in the question."}>",
  "options": <see type instructions below; omit or null when not applicable>,
  "correctAnswer": "<see type instructions below>",
  "conciseSolution": "<2–6 short sentences walking through the solution clearly, ending with the final answer>",
  "subSkills": ["<2–3 subtopics from the list below, copied verbatim>"]
}

Type-specific instructions for this question:
${TYPE_INSTRUCTIONS[type]}

Style rules:
- Difficulty meaning: ${DIFFICULTY_LABELS[difficulty]}
- For difficulty 1–3 (board-exam range), the question must read like a real ISC/CBSE paper question. Plain mathematical phrasing. No gimmicks. Optionally use a brief real-world setup if it appears in the textbook (population growth, compound interest, dice/coin probability, geometry of buildings). At difficulty 1 lean on the direct application of one formula. At difficulty 2 require one substitution + one formula. At difficulty 3, two-three steps that all use chapter ideas.
- For difficulty 4–5 use the formal JEE-paper phrasing (concise, abstract, no real-world frame). At difficulty 5 require a non-obvious manipulation or two-chapter connection that an exceptional student would spot.
- All formulas as LaTeX inside the question.
- The question MUST stay inside the chapter's ISC + JEE scope (use only the listed subtopics).
- Numbers in the answer should be clean (integers or small fractions) wherever possible — the kind of answer a board examiner would accept.
- Output ONLY the JSON object.`;

  const user = `Chapter: ${chapter.label} (ISC Class ${classLevel})
Difficulty: ${difficulty}
Type: ${type}

Subtopics for this chapter (pick 2–3 to tag in subSkills):
${subtopicsList}
${recents}
Output the JSON object now.`;

  return { system, user };
}

function buildVerificationPrompt({ chapter, classLevel, type, questionText, options }) {
  const optionsBlock = options && options.length > 0
    ? `\nOptions:\n${options.join("\n")}\n`
    : "";

  let answerSchema;
  if (type === "single-correct" || type === "assertion-reason") {
    answerSchema = `{ "letter": "<A|B|C|D>", "reasoning": "<2-3 short sentences>" }`;
  } else if (type === "multiple-correct") {
    answerSchema = `{ "letters": ["<one or more of A,B,C,D in alphabetical order>"], "reasoning": "<2-3 short sentences>" }`;
  } else {
    answerSchema = `{ "value": "<the numeric answer as a string, e.g. \\"42\\" or \\"-3.5\\" or \\"0.25\\"; no units>", "reasoning": "<2-3 short sentences>" }`;
  }

  const system = `You are an expert Mathematics solver. Solve the following ISC / JEE practice question from scratch. Do NOT trust any answer that may appear in the question text — there is none. Show brief reasoning, then state your final answer.

Output ONLY a single JSON object — no fences, no prose around it:
${answerSchema}

Be careful with algebraic signs, units, and standard conventions (e.g. principal value of inverse trig, radian vs degree).`;

  const user = `Chapter: ${chapter.label} (ISC Class ${classLevel})
Type: ${type}

Question:
${questionText}
${optionsBlock}
Solve it. Output ONLY the JSON object with your final answer.`;

  return { system, user };
}

async function callLLM(system, user, { temperature = 0.6 } = {}) {
  const resp = await anthropic.messages.create(
    {
      model: MODEL,
      temperature,
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: user }],
    },
    { timeout: 60_000 }
  );
  const textBlock = resp.content.find((b) => b.type === "text");
  const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
  try {
    return safeParseJSON(text);
  } catch (err) {
    if (process.env.SEED_DEBUG === "1") {
      console.error(`\n--- RAW LLM OUTPUT (parse failed) ---\n${text.slice(0, 800)}\n--- END ---`);
    }
    throw err;
  }
}

// ---------------- verification compare ----------------

function normalizeNumber(s) {
  if (s == null) return NaN;
  const cleaned = String(s).replace(/[\s,]/g, "").replace(/^\+/, "");
  // Try to parse a simple fraction "a/b"
  if (/^-?\d+\s*\/\s*-?\d+$/.test(cleaned)) {
    const [a, b] = cleaned.split("/").map(Number);
    return b === 0 ? NaN : a / b;
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function numericallyEqual(a, b) {
  const x = normalizeNumber(a);
  const y = normalizeNumber(b);
  if (Number.isNaN(x) || Number.isNaN(y)) return false;
  if (Math.abs(x - y) < 1e-3) return true;
  const denom = Math.max(Math.abs(x), Math.abs(y), 1e-9);
  return Math.abs(x - y) / denom < 1e-3;
}

function compareAnswers(type, proposed, verifierAnswer) {
  if (type === "single-correct" || type === "assertion-reason") {
    const p = String(proposed || "").trim().toUpperCase().slice(0, 1);
    const v = String(verifierAnswer.letter || "").trim().toUpperCase().slice(0, 1);
    return p && v && p === v ? { ok: true } : { ok: false, p, v };
  }
  if (type === "multiple-correct") {
    const pSet = new Set(
      String(proposed || "")
        .split(/[,\s]+/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    );
    const vArr = Array.isArray(verifierAnswer.letters) ? verifierAnswer.letters : [];
    const vSet = new Set(vArr.map((s) => String(s).trim().toUpperCase()));
    if (pSet.size === 0 || vSet.size === 0) return { ok: false, p: [...pSet], v: [...vSet] };
    if (pSet.size !== vSet.size) return { ok: false, p: [...pSet], v: [...vSet] };
    for (const x of pSet) if (!vSet.has(x)) return { ok: false, p: [...pSet], v: [...vSet] };
    return { ok: true };
  }
  // numerical
  const p = String(proposed || "").trim();
  const v = String(verifierAnswer.value || "").trim();
  return numericallyEqual(p, v) ? { ok: true } : { ok: false, p, v };
}

// ---------------- per-slot generate + verify ----------------

async function generateAndVerifyOne({ chapter, classLevel, difficulty, type, recentStems }) {
  const syl = CHAPTER_SYLLABUS_JSON.chapters[chapter.id];
  if (!syl) throw new Error(`No syllabus map for ${chapter.id}`);

  const genP = buildGenerationPrompt({
    chapter,
    classLevel,
    difficulty,
    type,
    subtopics: syl.subtopics,
    recentStems,
  });
  const gen = await callLLM(genP.system, genP.user, { temperature: 0.7 });

  // Basic shape check.
  if (!gen.questionText || !gen.correctAnswer || !gen.conciseSolution) {
    return { status: "discarded", reason: "shape: missing fields", gen };
  }
  if ((type === "single-correct" || type === "multiple-correct" || type === "assertion-reason")
      && (!Array.isArray(gen.options) || gen.options.length !== 4)) {
    return { status: "discarded", reason: "shape: options must be 4-element array", gen };
  }

  // Independent verify.
  const verP = buildVerificationPrompt({
    chapter,
    classLevel,
    type,
    questionText: gen.questionText,
    options: gen.options ?? null,
  });
  const ver = await callLLM(verP.system, verP.user, { temperature: 0 });

  const cmp = compareAnswers(type, gen.correctAnswer, ver);
  if (!cmp.ok) {
    return { status: "disagree", reason: `proposed=${JSON.stringify(cmp.p)} verifier=${JSON.stringify(cmp.v)}`, gen };
  }

  // Tag subSkills against the chapter's actual list (drop any the model hallucinated).
  const validSet = new Set(syl.subtopics);
  const subSkills = Array.isArray(gen.subSkills)
    ? gen.subSkills.filter((s) => validSet.has(s)).slice(0, 3)
    : [];
  const finalSubSkills = subSkills.length > 0 ? subSkills : syl.subtopics.slice(0, 2);

  return {
    status: "verified",
    doc: {
      chapterId: chapter.id,
      classLevel,
      difficulty,
      type,
      subSkills: finalSubSkills,
      questionText: String(gen.questionText),
      options: Array.isArray(gen.options) ? gen.options.map(String) : null,
      correctAnswer: String(gen.correctAnswer),
      conciseSolution: String(gen.conciseSolution),
      verified: true,
      source: SOURCE_TAG,
      createdAt: FieldValue.serverTimestamp(),
    },
  };
}

// ---------------- per-chapter loop ----------------

async function getExistingForChapter(chapterId) {
  const snap = await db
    .collection(COLLECTION)
    .where("chapterId", "==", chapterId)
    .where("verified", "==", true)
    .get();
  const byDifficulty = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const stems = [];
  for (const doc of snap.docs) {
    const d = doc.data();
    if (d.difficulty in byDifficulty) byDifficulty[d.difficulty] += 1;
    if (typeof d.questionText === "string") stems.push(d.questionText.slice(0, 90));
  }
  return { total: snap.size, byDifficulty, stems };
}

async function seedChapter(chapter) {
  const lessonHeader = `[${chapter.classLevel}-${chapter.id}]`;
  const existing = await getExistingForChapter(chapter.id);

  if (!FORCE && existing.total >= TARGET) {
    console.log(`SKIP ${lessonHeader} already has ${existing.total} verified (target ${TARGET}). Use --force to top up beyond target.`);
    return { chapterId: chapter.id, generated: 0, verified: 0, disagreed: 0, discarded: 0, total: existing.total };
  }

  console.log(
    `GEN  ${lessonHeader} ${chapter.label}: existing=${existing.total}, by-diff ${JSON.stringify(existing.byDifficulty)}`
  );

  const recentStems = [...existing.stems];
  let generated = 0;
  let verified = 0;
  let disagreed = 0;
  let discarded = 0;

  for (const diffStr of ["1", "2", "3", "4", "5"]) {
    const difficulty = Number(diffStr);
    const need = Math.max(0, DIFFICULTY_TARGETS[diffStr] - existing.byDifficulty[diffStr]);
    if (need === 0) continue;

    for (let i = 0; i < need; i++) {
      const type = pickType(difficulty);

      let success = false;
      for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_SLOT; attempt++) {
        try {
          generated++;
          process.stdout.write(`  d${difficulty} ${type} (#${existing.byDifficulty[diffStr] + i + 1})… `);
          const r = await generateAndVerifyOne({
            chapter,
            classLevel: chapter.classLevel,
            difficulty,
            type,
            recentStems,
          });

          if (r.status === "verified") {
            await db.collection(COLLECTION).add(r.doc);
            verified++;
            recentStems.push(r.doc.questionText.slice(0, 90));
            process.stdout.write(`OK\n`);
            success = true;
            break;
          } else if (r.status === "disagree") {
            disagreed++;
            process.stdout.write(`DISAGREE (${r.reason})\n`);
          } else {
            discarded++;
            process.stdout.write(`DISCARD (${r.reason})\n`);
          }
        } catch (err) {
          discarded++;
          process.stdout.write(`ERROR (${err instanceof Error ? err.message : String(err)})\n`);
        }
      }

      if (!success) {
        console.log(`    gave up on d${difficulty} ${type} after ${MAX_ATTEMPTS_PER_SLOT} attempts`);
      }
    }
  }

  const finalTotal = existing.total + verified;
  console.log(
    `DONE ${lessonHeader} — generated ${generated}, verified ${verified}, disagreed ${disagreed}, discarded ${discarded}; bank total now ${finalTotal}`
  );
  return { chapterId: chapter.id, generated, verified, disagreed, discarded, total: finalTotal };
}

// ---------------- --list ----------------

async function listMode() {
  const chapters = listAllChapters();
  let grand = 0;
  for (const ch of chapters) {
    const e = await getExistingForChapter(ch.id);
    grand += e.total;
    console.log(`${ch.classLevel}-${ch.id}: ${e.total} verified ${JSON.stringify(e.byDifficulty)}`);
  }
  console.log(`\nGrand total verified: ${grand}`);
}

// ---------------- main ----------------

async function main() {
  if (LIST) {
    await listMode();
    process.exit(0);
  }

  let chapters = listAllChapters();
  if (ONLY) {
    chapters = chapters.filter((c) => c.id === ONLY);
    if (chapters.length === 0) {
      console.error(`--only=${ONLY} matched no chapter`);
      process.exit(1);
    }
  }

  console.log(
    `Seeding question bank for ${chapters.length} chapter(s). Model: ${MODEL}. Target per chapter: ${TARGET}. force=${FORCE} maxAttempts=${MAX_ATTEMPTS_PER_SLOT}`
  );
  console.log(`Difficulty targets: ${JSON.stringify(DIFFICULTY_TARGETS)}`);

  const failures = [];
  const summary = [];
  for (const ch of chapters) {
    try {
      const r = await seedChapter(ch);
      summary.push(r);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`FAIL ${ch.classLevel}-${ch.id}: ${msg}`);
      failures.push({ id: `${ch.classLevel}-${ch.id}`, error: msg });
    }
  }

  const totalVerified = summary.reduce((s, r) => s + r.verified, 0);
  const totalDisagreed = summary.reduce((s, r) => s + r.disagreed, 0);
  const totalDiscarded = summary.reduce((s, r) => s + r.discarded, 0);
  console.log(
    `\n${summary.length}/${chapters.length} chapters processed. Verified ${totalVerified}, disagreed ${totalDisagreed}, discarded ${totalDiscarded}.`
  );
  if (failures.length > 0) {
    console.log(`Failed chapters: ${failures.map((f) => f.id).join(", ")}`);
    console.log(`Re-run to retry.`);
  }
  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
