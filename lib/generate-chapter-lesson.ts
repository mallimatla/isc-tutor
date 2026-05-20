import { FieldValue } from "firebase-admin/firestore";
import { adminDb, col } from "@/lib/firebase-admin";
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

export interface GenerateResult {
  status: "seeded" | "cached" | "failed";
  lesson: Record<string, unknown> | null;
  error: string | null;
  durationMs: number;
}

export async function generateChapterLesson(
  chapterId: string,
  classLevel: "11" | "12",
  options: { force?: boolean } = {}
): Promise<GenerateResult> {
  const start = Date.now();
  const lessonId = `${classLevel}-${chapterId}`;

  try {
    const lessonRef = adminDb.collection(col("chapter_lessons")).doc(lessonId);

    // Check cache
    if (!options.force) {
      const snap = await lessonRef.get();
      if (snap.exists && snap.data()?.promptVersion === PROMPT_VERSION) {
        return {
          status: "cached",
          lesson: snap.data()!,
          error: null,
          durationMs: Date.now() - start,
        };
      }
    }

    const chapter = getChapter("mathematics", classLevel, chapterId);
    if (!chapter) {
      return {
        status: "failed",
        lesson: null,
        error: `Chapter not found: ${chapterId}`,
        durationMs: Date.now() - start,
      };
    }

    const chapterDescription =
      chapter.description ||
      `ISC ${classLevel === "11" ? "Class 11" : "Class 12"} chapter: ${chapter.label}`;

    // Generate narrative
    const narPrompt = buildChapterNarrativePrompt({
      chapterId,
      chapterLabel: chapter.label,
      classLevel,
      chapterDescription,
    });
    const narrativeResult = await callClaude({
      system: narPrompt.system,
      user: narPrompt.user,
      schema: ChapterNarrativeSchema,
      promptVersion: narPrompt.promptVersion,
    });

    // Generate visualization
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
          html: fallbackVizHtml(chapter.label, narrativeResult.data.keyTakeaway),
        };
        sanitizationWarnings.push("Fell back to static visualization");
      }
    } catch {
      vizData = {
        title: chapter.label,
        interactionHint: "Interactive visualization unavailable",
        html: fallbackVizHtml(chapter.label, narrativeResult.data.keyTakeaway),
      };
      sanitizationWarnings.push("Visualization generation failed, using fallback");
    }

    const lesson = {
      lessonId,
      chapterId,
      classLevel,
      promptVersion: PROMPT_VERSION,
      narrative: narrativeResult.data,
      visualization: { ...vizData, sanitizationWarnings },
      generatedAt: FieldValue.serverTimestamp(),
    };

    await lessonRef.set(lesson);

    return {
      status: "seeded",
      lesson,
      error: null,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      status: "failed",
      lesson: null,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
