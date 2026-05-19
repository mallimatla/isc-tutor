import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";
import { buildSocraticTurnPrompt } from "@/lib/prompts/socratic-turn";
import {
  callClaude,
  ClaudeRateLimitError,
  ClaudeMalformedOutputError,
  ClaudeTimeoutError,
} from "@/lib/anthropic";
import { SocraticTurnOutputSchema } from "@/lib/schemas/socratic";
import { updateDifficulty, type Verdict } from "@/lib/difficulty";

const RequestBodySchema = z.object({
  questionId: z.string().min(1),
  studentTurn: z.string().min(1).max(5000),
  turnNumber: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
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

    const { questionId, studentTurn, turnNumber } = parsed.data;

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

    // Load prior turns for this dialogue
    const dialogueRef = adminDb
      .collection(col("dialogues"))
      .doc(questionId);
    const turnsSnap = await dialogueRef
      .collection("turns")
      .orderBy("turnNumber", "asc")
      .get();

    const dialogueHistory: Array<{
      role: "student" | "tutor";
      message: string;
    }> = [];
    for (const doc of turnsSnap.docs) {
      const turnData = doc.data();
      dialogueHistory.push({ role: "student", message: turnData.studentTurn });
      dialogueHistory.push({ role: "tutor", message: turnData.tutorMessage });
    }

    // Add the current student turn to history for the prompt
    dialogueHistory.push({ role: "student", message: studentTurn });

    // Build and call Socratic prompt
    const prompt = buildSocraticTurnPrompt({
      questionLatex: questionData.questionLatex,
      expectedSolutionSteps: questionData.expectedSolutionSteps,
      dialogueHistory,
      difficulty: questionData.difficultyActual as 1 | 2 | 3 | 4 | 5,
      turnNumber,
      chapterLabel: questionData.chapterId,
    });

    const result = await callClaude({
      system: prompt.system,
      user: prompt.user,
      schema: SocraticTurnOutputSchema,
      promptVersion: prompt.promptVersion,
    });

    const socraticData = result.data;
    const isFinal =
      socraticData.decision === "AFFIRM_AND_REVEAL" ||
      socraticData.decision === "REVEAL";

    // Ensure dialogue parent doc exists
    const dialogueSnap = await dialogueRef.get();
    if (!dialogueSnap.exists) {
      await dialogueRef.set({
        questionId,
        sessionId: uid,
        startedAt: FieldValue.serverTimestamp(),
        completedAt: null,
        totalTurns: 0,
        finalDecision: null,
        subSkillsTested: socraticData.sub_skills_tested,
        subSkillsStruggled: [],
      });
    }

    // Persist this turn
    await dialogueRef.collection("turns").doc(String(turnNumber)).set({
      turnNumber,
      studentTurn,
      tutorMessage: socraticData.tutor_message,
      decision: socraticData.decision,
      reasoningDiagnosis: socraticData.reasoning_diagnosis,
      verdictSoFar: socraticData.verdict_so_far,
      confidence: socraticData.confidence,
      generationLatencyMs: result.latencyMs,
      generationTokens: result.usage,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update dialogue doc
    const dialogueUpdate: Record<string, unknown> = {
      totalTurns: turnNumber,
      subSkillsTested: socraticData.sub_skills_tested,
    };

    // Accumulate struggled sub-skills
    if (socraticData.sub_skills_struggled.length > 0) {
      dialogueUpdate.subSkillsStruggled = FieldValue.arrayUnion(
        ...socraticData.sub_skills_struggled
      );
    }

    if (isFinal) {
      dialogueUpdate.completedAt = FieldValue.serverTimestamp();
      dialogueUpdate.finalDecision = socraticData.decision;

      // Write evaluation doc
      const verdict: Verdict =
        socraticData.decision === "AFFIRM_AND_REVEAL" ? "correct" : "incorrect";

      const evalRef = adminDb.collection(col("evaluations")).doc();
      await evalRef.set({
        evaluationId: evalRef.id,
        questionId,
        sessionId: uid,
        evaluatedAt: FieldValue.serverTimestamp(),
        studentAnswer: `(socratic dialogue, ${turnNumber} turns)`,
        verdict,
        whereWentWrong:
          socraticData.decision === "REVEAL"
            ? socraticData.reasoning_diagnosis
            : null,
        fullSolutionSteps: socraticData.full_solution_steps,
        confidence: socraticData.confidence,
        llmModel: MODEL,
        promptVersion: prompt.promptVersion,
        evaluationTokens: result.usage,
        evaluationLatencyMs: result.latencyMs,
      });

      // Update difficulty
      const sessionRef = adminDb.collection(col("sessions")).doc(uid);
      const sessionSnap = await sessionRef.get();
      const sessionData = sessionSnap.data();

      const currentState = {
        currentDifficulty: sessionData?.currentDifficulty ?? 2,
        rollingWindow: (sessionData?.rollingWindow ?? []) as Verdict[],
      };

      const newState = updateDifficulty(currentState, verdict);

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

      await dialogueRef.update(dialogueUpdate);

      return NextResponse.json({
        decision: socraticData.decision,
        tutorMessage: socraticData.tutor_message,
        turnNumber,
        isFinal: true,
        fullSolutionSteps: socraticData.full_solution_steps,
        reflectionQuestion: socraticData.reflection_question,
        difficultyForNext: newState.currentDifficulty,
      });
    }

    await dialogueRef.update(dialogueUpdate);

    return NextResponse.json({
      decision: socraticData.decision,
      tutorMessage: socraticData.tutor_message,
      turnNumber,
      isFinal: false,
      fullSolutionSteps: null,
      reflectionQuestion: null,
      difficultyForNext: null,
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (err instanceof ClaudeRateLimitError) {
      console.error({
        route: "POST /api/socratic",
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
        route: "POST /api/socratic",
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
        route: "POST /api/socratic",
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
      route: "POST /api/socratic",
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
