import { NextRequest } from "next/server";
import { z } from "zod";
import { verifyRequest, assertAdmin, UnauthorizedError } from "@/lib/verify-token";
import { getAllChapters } from "@/lib/syllabus";
import { adminDb, col } from "@/lib/firebase-admin";
import { generateChapterLesson } from "@/lib/generate-chapter-lesson";

const RequestBodySchema = z.object({
  force: z.boolean().optional().default(false),
  classLevel: z.enum(["11", "12"]).nullable().optional().default(null),
});

const CONCURRENCY = 3;

export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequest(req);
    assertAdmin(user);

    const body = await req.json();
    const parsed = RequestBodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "INVALID_INPUT" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { force, classLevel } = parsed.data;

    // Build chapter list
    let chapters = [
      ...getAllChapters("mathematics", "11").map((c) => ({
        ...c,
        classLevel: "11" as const,
      })),
      ...getAllChapters("mathematics", "12").map((c) => ({
        ...c,
        classLevel: "12" as const,
      })),
    ];
    if (classLevel) {
      chapters = chapters.filter((c) => c.classLevel === classLevel);
    }

    // Check which are already seeded
    const PROMPT_VERSION = process.env.PROMPT_VERSION_LESSON || "lesson-v1.0";
    let toGenerate = chapters;
    if (!force) {
      const lessonsSnap = await adminDb
        .collection(col("chapter_lessons"))
        .get();
      const seeded = new Set<string>();
      for (const doc of lessonsSnap.docs) {
        if (doc.data().promptVersion === PROMPT_VERSION) {
          seeded.add(doc.id);
        }
      }
      toGenerate = chapters.filter(
        (c) => !seeded.has(`${c.classLevel}-${c.id}`)
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function send(data: Record<string, unknown>) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        }

        send({
          type: "start",
          totalChapters: chapters.length,
          willGenerate: toGenerate.length,
        });

        let done = 0;
        let failed = 0;

        // Process in batches
        for (let i = 0; i < toGenerate.length; i += CONCURRENCY) {
          const batch = toGenerate.slice(i, i + CONCURRENCY);

          const results = await Promise.allSettled(
            batch.map(async (ch) => {
              send({
                type: "chapter-progress",
                chapterId: ch.id,
                classLevel: ch.classLevel,
                status: "generating",
              });

              const result = await generateChapterLesson(
                ch.id,
                ch.classLevel,
                { force }
              );

              if (result.status === "failed") {
                failed++;
                send({
                  type: "chapter-failed",
                  chapterId: ch.id,
                  classLevel: ch.classLevel,
                  error: result.error,
                  durationMs: result.durationMs,
                });
              } else {
                done++;
                send({
                  type: "chapter-done",
                  chapterId: ch.id,
                  classLevel: ch.classLevel,
                  durationMs: result.durationMs,
                  sizeBytes: result.lesson
                    ? JSON.stringify(result.lesson).length
                    : 0,
                });
              }
            })
          );

          // Log any unhandled rejections
          for (const r of results) {
            if (r.status === "rejected") {
              failed++;
              console.error("[generate-all] batch error:", r.reason);
            }
          }
        }

        send({
          type: "all-done",
          summary: {
            total: chapters.length,
            generated: done,
            failed,
            skipped: chapters.length - toGenerate.length,
          },
        });

        controller.close();
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
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "INTERNAL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
