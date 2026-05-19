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

    if (sessionSnap.exists) {
      const data = sessionSnap.data();
      currentDifficulty = data?.currentDifficulty ?? 2;
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
        totalQuestionsServed: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        preferences: { explanationLanguage: "en" },
      });
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
