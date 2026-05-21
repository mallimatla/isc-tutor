import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";
import { getChapter } from "@/lib/syllabus";
import { buildGenerateQuestionPrompt } from "@/lib/prompts/generate-question";
import {
  callClaude,
  ClaudeRateLimitError,
  ClaudeMalformedOutputError,
  ClaudeTimeoutError,
} from "@/lib/anthropic";
import {
  QuestionGenerationOutputSchema,
  type QuestionGenerationOutput,
} from "@/lib/schemas/question";

const RequestBodySchema = z.object({
  chapterId: z.string(),
  class: z.enum(["11", "12"]),
  subject: z.literal("mathematics"),
});

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

// Cap servedBankIds array growth — keep the most recent N. A user who has
// burned through more questions than that gets older bank items eligible again,
// which is fine.
const SERVED_IDS_CAP = 300;

interface BankDocShape {
  chapterId: string;
  classLevel: string;
  difficulty: number;
  type: string;
  subSkills: string[];
  questionText: string;
  options: string[] | null;
  correctAnswer: string;
  conciseSolution: string;
  verified: boolean;
  source: string;
}

function composeLatexWithOptions(bank: BankDocShape): string {
  if (!bank.options || bank.options.length === 0) return bank.questionText;
  return `${bank.questionText}\n\n${bank.options.join("\n")}`;
}

async function pickFromBank({
  chapterId,
  classLevel,
  targetDifficulty,
  servedBankIds,
}: {
  chapterId: string;
  classLevel: "11" | "12";
  targetDifficulty: number;
  servedBankIds: string[];
}): Promise<{ id: string; data: BankDocShape } | null> {
  const servedSet = new Set(servedBankIds);

  // Read pool at the exact target difficulty first.
  const exactSnap = await adminDb
    .collection(col("question_bank"))
    .where("chapterId", "==", chapterId)
    .where("classLevel", "==", classLevel)
    .where("difficulty", "==", targetDifficulty)
    .where("verified", "==", true)
    .get();

  let candidates = exactSnap.docs.filter((d) => !servedSet.has(d.id));

  // If no unseen at the exact target, try adjacent difficulties (±1) before
  // falling back to runtime generation. Keeps practice flowing.
  if (candidates.length === 0) {
    const adjacent: number[] = [];
    if (targetDifficulty > 1) adjacent.push(targetDifficulty - 1);
    if (targetDifficulty < 5) adjacent.push(targetDifficulty + 1);
    for (const d of adjacent) {
      const snap = await adminDb
        .collection(col("question_bank"))
        .where("chapterId", "==", chapterId)
        .where("classLevel", "==", classLevel)
        .where("difficulty", "==", d)
        .where("verified", "==", true)
        .get();
      candidates = snap.docs.filter((doc) => !servedSet.has(doc.id));
      if (candidates.length > 0) break;
    }
  }

  if (candidates.length === 0) return null;

  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return { id: picked.id, data: picked.data() as BankDocShape };
}

export async function POST(req: NextRequest) {
  let uid = "";
  try {
    const user = await verifyRequest(req);
    uid = user.uid;

    const body = await req.json();
    const parsed = RequestBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { chapterId, class: classLevel, subject } = parsed.data;

    const chapter = getChapter(subject, classLevel, chapterId);
    if (!chapter) {
      return NextResponse.json(
        { error: "SYLLABUS_NOT_FOUND", retryable: false },
        { status: 404 }
      );
    }

    // Load or create session
    const sessionRef = adminDb.collection(col("sessions")).doc(uid);
    const sessionSnap = await sessionRef.get();
    let currentDifficulty = 2;
    let servedBankIds: string[] = [];

    if (sessionSnap.exists) {
      const data = sessionSnap.data();
      currentDifficulty = data?.currentDifficulty ?? 2;
      servedBankIds = Array.isArray(data?.servedBankIds) ? data!.servedBankIds : [];
    } else {
      await sessionRef.set({
        sessionId: uid,
        createdAt: FieldValue.serverTimestamp(),
        lastActiveAt: FieldValue.serverTimestamp(),
        currentSubject: "mathematics",
        currentClass: classLevel,
        currentChapterId: chapterId,
        currentDifficulty: 2,
        rollingWindow: [],
        servedBankIds: [],
        totalQuestionsServed: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        preferences: { explanationLanguage: "en" },
      });
    }

    // ---------- BANK-FIRST PATH ----------
    const bankStart = Date.now();
    const bankHit = await pickFromBank({
      chapterId,
      classLevel,
      targetDifficulty: currentDifficulty,
      servedBankIds,
    });

    if (bankHit) {
      const { id: bankId, data: bank } = bankHit;
      const questionRef = adminDb.collection(col("questions")).doc();
      const composed = composeLatexWithOptions(bank);

      await questionRef.set({
        questionId: questionRef.id,
        sessionId: uid,
        generatedAt: FieldValue.serverTimestamp(),
        subject,
        class: classLevel,
        chapterId,
        difficultyRequested: currentDifficulty,
        difficultyActual: bank.difficulty,
        inSyllabus: true,
        syllabusReasoning: "served from verified question bank",
        questionLatex: composed,
        expectedSolutionSteps: [bank.conciseSolution],
        llmModel: bank.source,
        promptVersion: "bank-v1",
        generationTokens: { input: 0, output: 0 },
        generationLatencyMs: Date.now() - bankStart,
        // Bank-specific fields for downstream evaluators and analytics.
        sourceQuestionBankId: bankId,
        bankQuestionType: bank.type,
        bankOptions: bank.options ?? null,
        bankCorrectAnswer: bank.correctAnswer,
        bankSubSkills: Array.isArray(bank.subSkills) ? bank.subSkills : [],
      });

      const trimmedServed = [...servedBankIds, bankId].slice(-SERVED_IDS_CAP);
      await sessionRef.update({
        lastActiveAt: FieldValue.serverTimestamp(),
        currentChapterId: chapterId,
        currentClass: classLevel,
        totalQuestionsServed: FieldValue.increment(1),
        servedBankIds: trimmedServed,
      });

      return NextResponse.json({
        questionId: questionRef.id,
        questionLatex: composed,
        difficultyServed: bank.difficulty,
        metadata: {
          inSyllabus: true,
          generationLatencyMs: Date.now() - bankStart,
          source: "bank",
          bankQuestionType: bank.type,
        },
      });
    }

    // ---------- RUNTIME FALLBACK (existing path, unchanged) ----------

    // Load recent question contexts for variety (optional — missing index is OK)
    let recentContexts: string[] = [];
    try {
      const recentQSnap = await adminDb
        .collection(col("questions"))
        .where("sessionId", "==", uid)
        .orderBy("generatedAt", "desc")
        .limit(3)
        .get();
      recentContexts = recentQSnap.docs.map((d) =>
        (d.data().questionLatex as string).slice(0, 60)
      );
    } catch (err) {
      console.warn("[/api/question] recent-contexts query failed (missing index?), proceeding without:", err instanceof Error ? err.message : String(err));
    }

    // Generate question with in_syllabus retry logic
    const maxSyllabusRetries = 3;
    let result: {
      data: QuestionGenerationOutput;
      usage: { input: number; output: number };
      latencyMs: number;
    } | null = null;
    let syllabusWarning = false;

    for (let attempt = 0; attempt < maxSyllabusRetries; attempt++) {
      const prompt = buildGenerateQuestionPrompt({
        subject,
        classLevel,
        chapterLabel: chapter.label,
        difficulty: currentDifficulty as 1 | 2 | 3 | 4 | 5,
        recentContexts,
      });

      result = await callClaude({
        system: prompt.system,
        user: prompt.user,
        schema: QuestionGenerationOutputSchema,
        promptVersion: prompt.promptVersion,
      });

      if (result.data.in_syllabus) break;
      if (attempt === maxSyllabusRetries - 1) {
        syllabusWarning = true;
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "INTERNAL", retryable: true },
        { status: 500 }
      );
    }

    const promptVersion =
      process.env.PROMPT_VERSION_QGEN || "qgen-v1.2";

    // Persist question
    const questionRef = adminDb.collection(col("questions")).doc();
    await questionRef.set({
      questionId: questionRef.id,
      sessionId: uid,
      generatedAt: FieldValue.serverTimestamp(),
      subject,
      class: classLevel,
      chapterId,
      difficultyRequested: currentDifficulty,
      difficultyActual: result.data.difficulty_actual,
      inSyllabus: result.data.in_syllabus,
      syllabusReasoning: result.data.syllabus_reasoning,
      questionLatex: result.data.question_latex,
      expectedSolutionSteps: result.data.expected_solution_steps,
      llmModel: MODEL,
      promptVersion,
      generationTokens: result.usage,
      generationLatencyMs: result.latencyMs,
    });

    // Update session
    await sessionRef.update({
      lastActiveAt: FieldValue.serverTimestamp(),
      currentChapterId: chapterId,
      currentClass: classLevel,
      totalQuestionsServed: FieldValue.increment(1),
    });

    return NextResponse.json({
      questionId: questionRef.id,
      questionLatex: result.data.question_latex,
      difficultyServed: currentDifficulty,
      metadata: {
        inSyllabus: result.data.in_syllabus,
        generationLatencyMs: result.latencyMs,
        source: "runtime",
        ...(syllabusWarning && { syllabusWarning: true }),
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (err instanceof ClaudeRateLimitError) {
      console.error({
        route: "POST /api/question",
        uid,
        errorName: err.name,
        errorMessage: err.message,
      });
      return NextResponse.json(
        { error: "RATE_LIMITED", retryable: true, retryAfterMs: 1500 },
        { status: 429 }
      );
    }
    if (err instanceof ClaudeMalformedOutputError) {
      console.error({
        route: "POST /api/question",
        uid,
        errorName: err.name,
        errorMessage: err.message,
      });
      return NextResponse.json(
        { error: "MALFORMED_LLM_OUTPUT", retryable: true, retryAfterMs: 1000 },
        { status: 502 }
      );
    }
    if (err instanceof ClaudeTimeoutError) {
      console.error({
        route: "POST /api/question",
        uid,
        errorName: err.name,
        errorMessage: err.message,
      });
      return NextResponse.json(
        { error: "TIMEOUT", retryable: true, retryAfterMs: 2000 },
        { status: 504 }
      );
    }
    console.error({
      route: "POST /api/question",
      uid,
      errorName: err instanceof Error ? err.name : "Unknown",
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "INTERNAL", retryable: true },
      { status: 500 }
    );
  }
}
