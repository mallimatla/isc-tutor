import { NextRequest } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";
import { buildSocraticTurnPrompt } from "@/lib/prompts/socratic-turn";
import {
  callClaudeStreaming,
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

function jsonErrorResponse(
  error: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return new Response(JSON.stringify({ error, ...extra }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  let uid = "";
  try {
    const user = await verifyRequest(req);
    uid = user.uid;

    const body = await req.json();
    const parsed = RequestBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonErrorResponse("INVALID_INPUT", 400, {
        details: parsed.error.flatten(),
      });
    }

    const { questionId, studentTurn, turnNumber } = parsed.data;

    // Load question and verify ownership
    const questionSnap = await adminDb
      .collection(col("questions"))
      .doc(questionId)
      .get();

    if (!questionSnap.exists) {
      return jsonErrorResponse("QUESTION_NOT_FOUND", 404);
    }

    const questionData = questionSnap.data()!;
    if (questionData.sessionId !== uid) {
      return jsonErrorResponse("FORBIDDEN", 403);
    }

    // Load prior turns
    const dialogueRef = adminDb.collection(col("dialogues")).doc(questionId);
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
    dialogueHistory.push({ role: "student", message: studentTurn });

    const prompt = buildSocraticTurnPrompt({
      questionLatex: questionData.questionLatex,
      expectedSolutionSteps: questionData.expectedSolutionSteps,
      dialogueHistory,
      difficulty: questionData.difficultyActual as 1 | 2 | 3 | 4 | 5,
      turnNumber,
      chapterLabel: questionData.chapterId,
    });

    // Set up SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(event: string, data: string) {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${data}\n\n`)
          );
        }

        try {
          const result = await callClaudeStreaming(
            {
              system: prompt.system,
              user: prompt.user,
              schema: SocraticTurnOutputSchema,
              promptVersion: prompt.promptVersion,
            },
            (delta) => {
              sendEvent("delta", JSON.stringify({ text: delta }));
            }
          );

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

          // Persist turn
          await dialogueRef
            .collection("turns")
            .doc(String(turnNumber))
            .set({
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
          if (socraticData.sub_skills_struggled.length > 0) {
            dialogueUpdate.subSkillsStruggled = FieldValue.arrayUnion(
              ...socraticData.sub_skills_struggled
            );
          }

          let difficultyForNext: number | null = null;

          if (isFinal) {
            dialogueUpdate.completedAt = FieldValue.serverTimestamp();
            dialogueUpdate.finalDecision = socraticData.decision;

            const verdict: Verdict =
              socraticData.decision === "AFFIRM_AND_REVEAL"
                ? "correct"
                : "incorrect";

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

            const sessionRef = adminDb.collection(col("sessions")).doc(uid);
            const sessionSnap = await sessionRef.get();
            const sessionData = sessionSnap.data();

            const currentState = {
              currentDifficulty: sessionData?.currentDifficulty ?? 2,
              rollingWindow: (sessionData?.rollingWindow ?? []) as Verdict[],
            };
            const newState = updateDifficulty(currentState, verdict);
            difficultyForNext = newState.currentDifficulty;

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
          }

          await dialogueRef.update(dialogueUpdate);

          // Send final structured payload
          sendEvent(
            "done",
            JSON.stringify({
              decision: socraticData.decision,
              tutorMessage: socraticData.tutor_message,
              turnNumber,
              isFinal,
              fullSolutionSteps: isFinal
                ? socraticData.full_solution_steps
                : null,
              reflectionQuestion: isFinal
                ? socraticData.reflection_question
                : null,
              difficultyForNext,
            })
          );
        } catch (err) {
          const errorPayload = {
            error: "INTERNAL",
            retryable: true,
            message: err instanceof Error ? err.message : String(err),
          };

          if (err instanceof ClaudeRateLimitError) {
            errorPayload.error = "RATE_LIMITED";
          } else if (err instanceof ClaudeMalformedOutputError) {
            errorPayload.error = "MALFORMED_LLM_OUTPUT";
          } else if (err instanceof ClaudeTimeoutError) {
            errorPayload.error = "TIMEOUT";
          }

          console.error({
            route: "POST /api/socratic",
            uid,
            errorName: err instanceof Error ? err.name : "Unknown",
            errorMessage: err instanceof Error ? err.message : String(err),
          });

          sendEvent("error", JSON.stringify(errorPayload));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return jsonErrorResponse("UNAUTHORIZED", 401);
    }
    console.error({
      route: "POST /api/socratic",
      uid,
      errorName: err instanceof Error ? err.name : "Unknown",
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return jsonErrorResponse("INTERNAL", 500, { retryable: true });
  }
}
