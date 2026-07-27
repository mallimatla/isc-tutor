import { NextRequest } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";
import { buildDoubtPrompt } from "@/lib/prompts/doubt";
import {
  callClaudeTextStreaming,
  ClaudeRateLimitError,
  ClaudeTimeoutError,
  MODEL,
} from "@/lib/anthropic";
import { getChapterSyllabus } from "@/lib/isc-syllabus";

const TurnSchema = z.object({
  role: z.enum(["student", "tutor"]),
  content: z.string().min(1).max(8000),
});

const RequestBodySchema = z.object({
  chapterId: z.string().min(1).max(120),
  classLevel: z.enum(["11", "12"]),
  chapterLabel: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(5000),
  // Prior turns for multi-turn follow-ups. Bounded so a long thread can't
  // blow up the prompt; we keep the most recent turns below.
  history: z.array(TurnSchema).max(40).optional(),
});

const MAX_HISTORY_TURNS = 12;

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

    const { chapterId, classLevel, chapterLabel, message } = parsed.data;
    const history = (parsed.data.history ?? []).slice(-MAX_HISTORY_TURNS);

    const syllabus = getChapterSyllabus(chapterId);

    const prompt = buildDoubtPrompt({
      chapterLabel: chapterLabel || chapterId,
      classLevel,
      subtopics: syllabus?.subtopics ?? [],
      history,
      message,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(event: string, data: string) {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${data}\n\n`)
          );
        }

        try {
          const result = await callClaudeTextStreaming(
            {
              system: prompt.system,
              user: prompt.user,
              promptVersion: prompt.promptVersion,
              maxTokens: 2048,
            },
            (delta) => {
              sendEvent("delta", JSON.stringify({ text: delta }));
            }
          );

          // Best-effort logging — never let a Firestore hiccup fail the reply.
          try {
            await adminDb.collection(col("doubts")).add({
              sessionId: uid,
              chapterId,
              classLevel,
              question: message,
              answer: result.text,
              historyTurns: history.length,
              llmModel: MODEL,
              promptVersion: prompt.promptVersion,
              tokens: result.usage,
              latencyMs: result.latencyMs,
              createdAt: FieldValue.serverTimestamp(),
            });
          } catch (logErr) {
            console.warn(
              "[/api/doubt] failed to log doubt (non-fatal):",
              logErr instanceof Error ? logErr.message : String(logErr)
            );
          }

          sendEvent(
            "done",
            JSON.stringify({ answer: result.text })
          );
        } catch (err) {
          const retryable =
            err instanceof ClaudeRateLimitError ||
            err instanceof ClaudeTimeoutError;
          console.error({
            route: "POST /api/doubt (stream)",
            uid,
            chapterId,
            errorName: err instanceof Error ? err.name : "Unknown",
            errorMessage: err instanceof Error ? err.message : String(err),
          });
          sendEvent(
            "error",
            JSON.stringify({
              error: "INTERNAL",
              retryable,
              message:
                err instanceof Error ? err.message : "Failed to get a reply.",
            })
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return jsonErrorResponse("UNAUTHORIZED", 401);
    }
    console.error({
      route: "POST /api/doubt",
      uid,
      errorName: err instanceof Error ? err.name : "Unknown",
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return jsonErrorResponse("INTERNAL", 500, { retryable: true });
  }
}
