/**
 * @deprecated Use POST /api/socratic instead. This endpoint is kept as a
 * fallback for question docs without Socratic dialogues. The new Socratic
 * flow replaces single-shot evaluation with multi-turn diagnosis.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";
import { buildEvaluateAnswerPrompt } from "@/lib/prompts/evaluate-answer";
import {
  callClaude,
  ClaudeRateLimitError,
  ClaudeMalformedOutputError,
  ClaudeTimeoutError,
} from "@/lib/anthropic";
import { AnswerEvaluationOutputSchema } from "@/lib/schemas/evaluation";
import { updateDifficulty, type Verdict } from "@/lib/difficulty";

const RequestBodySchema = z.object({
  questionId: z.string().min(1),
  studentAnswer: z.string().min(1).max(5000),
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

    const { questionId, studentAnswer } = parsed.data;

    // Load question and verify ownership
    const questionSnap = await adminDb
      .collection(col("questions"))
      .doc(questionId)
      .get();

    if (!questionSnap.exists) {
      return NextResponse.json(
        { error: "QUESTION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const questionData = questionSnap.data()!;
    if (questionData.sessionId !== uid) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // Evaluate answer
    const prompt = buildEvaluateAnswerPrompt({
      questionLatex: questionData.questionLatex,
      expectedSolutionSteps: questionData.expectedSolutionSteps,
      studentAnswer,
    });

    const result = await callClaude({
      system: prompt.system,
      user: prompt.user,
      schema: AnswerEvaluationOutputSchema,
      promptVersion: prompt.promptVersion,
    });

    const verdict = result.data.verdict as Verdict;

    // Update difficulty
    const sessionRef = adminDb.collection(col("sessions")).doc(uid);
    const sessionSnap = await sessionRef.get();
    const sessionData = sessionSnap.data();

    const currentState = {
      currentDifficulty: sessionData?.currentDifficulty ?? 2,
      rollingWindow: (sessionData?.rollingWindow ?? []) as Verdict[],
    };

    const newState = updateDifficulty(currentState, verdict);

    // Persist evaluation
    const promptVersion =
      process.env.PROMPT_VERSION_EVAL || "eval-v1.1";
    const evalRef = adminDb.collection(col("evaluations")).doc();
    await evalRef.set({
      evaluationId: evalRef.id,
      questionId,
      sessionId: uid,
      evaluatedAt: FieldValue.serverTimestamp(),
      studentAnswer,
      verdict,
      whereWentWrong: result.data.where_went_wrong,
      fullSolutionSteps: result.data.full_solution_steps,
      confidence: result.data.confidence,
      llmModel: MODEL,
      promptVersion,
      evaluationTokens: result.usage,
      evaluationLatencyMs: result.latencyMs,
    });

    // Update session
    const sessionUpdate: Record<string, unknown> = {
      lastActiveAt: FieldValue.serverTimestamp(),
      currentDifficulty: newState.currentDifficulty,
      rollingWindow: newState.rollingWindow,
      totalAnswered: FieldValue.increment(1),
    };
    if (verdict === "correct") {
      sessionUpdate.totalCorrect = FieldValue.increment(1);
    }
    await sessionRef.update(sessionUpdate);

    return NextResponse.json({
      evaluationId: evalRef.id,
      verdict,
      whereWentWrong: result.data.where_went_wrong,
      fullSolutionSteps: result.data.full_solution_steps,
      confidence: result.data.confidence,
      difficultyForNext: newState.currentDifficulty,
      metadata: {
        evaluationLatencyMs: result.latencyMs,
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (err instanceof ClaudeRateLimitError) {
      console.error({
        route: "POST /api/evaluate",
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
        route: "POST /api/evaluate",
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
        route: "POST /api/evaluate",
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
      route: "POST /api/evaluate",
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
