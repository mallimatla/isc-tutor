import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";
import { getChapter } from "@/lib/syllabus";
import {
  buildChapterNarrativePrompt,
  buildChapterVisualizationPrompt,
} from "@/lib/prompts/chapter-lesson";
import { callClaude } from "@/lib/anthropic";
import {
  ChapterNarrativeSchema,
  ChapterVisualizationSchema,
} from "@/lib/schemas/chapter-lesson";
import { sanitizeVizHtml } from "@/lib/sanitize-viz-html";

const RequestBodySchema = z.object({
  chapterId: z.string().min(1),
  classLevel: z.enum(["11", "12"]),
});

const PROMPT_VERSION = process.env.PROMPT_VERSION_LESSON || "lesson-v1.0";

function fallbackVizHtml(chapterLabel: string, keyTakeaway: string): string {
  return `<!DOCTYPE html>
<html><head><style>
body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 300px; font-family: system-ui, sans-serif; background: white; }
.container { text-align: center; padding: 2rem; }
h2 { color: #1f2937; font-size: 18px; margin-bottom: 1rem; }
p { color: #6b7280; font-size: 14px; max-width: 400px; line-height: 1.6; }
</style></head><body>
<div class="container" id="viz-root">
<h2>${chapterLabel}</h2>
<p>${keyTakeaway}</p>
</div>
</body></html>`;
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

    const { chapterId, classLevel } = parsed.data;
    const lessonId = `${classLevel}-${chapterId}`;

    // Check cache
    const lessonRef = adminDb.collection(col("chapter_lessons")).doc(lessonId);
    const lessonSnap = await lessonRef.get();

    if (lessonSnap.exists) {
      const cached = lessonSnap.data()!;
      if (cached.promptVersion === PROMPT_VERSION) {
        return NextResponse.json(cached);
      }
    }

    // Look up chapter
    const chapter = getChapter("mathematics", classLevel, chapterId);
    if (!chapter) {
      return NextResponse.json(
        { error: "CHAPTER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const chapterDescription =
      chapter.description || `ISC ${classLevel === "11" ? "Class 11" : "Class 12"} chapter: ${chapter.label}`;

    // Generate narrative first (we need keyTakeaway for viz prompt)
    const narrativePrompt = buildChapterNarrativePrompt({
      chapterId,
      chapterLabel: chapter.label,
      classLevel,
      chapterDescription,
    });

    const narrativeResult = await callClaude({
      system: narrativePrompt.system,
      user: narrativePrompt.user,
      schema: ChapterNarrativeSchema,
      promptVersion: narrativePrompt.promptVersion,
    });

    // Now generate visualization with keyTakeaway
    const vizPrompt = buildChapterVisualizationPrompt({
      chapterId,
      chapterLabel: chapter.label,
      classLevel,
      chapterDescription,
      keyTakeaway: narrativeResult.data.keyTakeaway,
    });

    let vizData: { title: string; interactionHint: string; html: string };
    let sanitizationWarnings: string[] = [];

    try {
      const vizResult = await callClaude({
        system: vizPrompt.system,
        user: vizPrompt.user,
        schema: ChapterVisualizationSchema,
        promptVersion: vizPrompt.promptVersion,
      });

      const sanitized = sanitizeVizHtml(vizResult.data.html);
      sanitizationWarnings = sanitized.warnings;

      if (sanitized.safe) {
        vizData = {
          title: vizResult.data.title,
          interactionHint: vizResult.data.interactionHint,
          html: sanitized.safe,
        };
      } else {
        vizData = {
          title: chapter.label,
          interactionHint: "Interactive visualization unavailable",
          html: fallbackVizHtml(
            chapter.label,
            narrativeResult.data.keyTakeaway
          ),
        };
        sanitizationWarnings.push("Fell back to static visualization");
      }
    } catch {
      vizData = {
        title: chapter.label,
        interactionHint: "Interactive visualization unavailable",
        html: fallbackVizHtml(
          chapter.label,
          narrativeResult.data.keyTakeaway
        ),
      };
      sanitizationWarnings.push("Visualization generation failed, using fallback");
    }

    const lesson = {
      lessonId,
      chapterId,
      classLevel,
      promptVersion: PROMPT_VERSION,
      narrative: narrativeResult.data,
      visualization: {
        ...vizData,
        sanitizationWarnings,
      },
      generatedAt: FieldValue.serverTimestamp(),
    };

    await lessonRef.set(lesson);

    return NextResponse.json(lesson);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error({
      route: "POST /api/chapter-lesson",
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
