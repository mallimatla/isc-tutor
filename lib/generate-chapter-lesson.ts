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

/**
 * Check if a cached lesson doc has complete, usable content.
 * Does NOT check promptVersion — that's for admin invalidation only.
 */
function isCacheHit(data: Record<string, unknown>): {
  hit: boolean;
  reason: string;
  hasNarrative: boolean;
  hasVisualization: boolean;
} {
  const narrative = data.narrative as Record<string, unknown> | undefined;
  const visualization = data.visualization as Record<string, unknown> | undefined;

  const hasNarrative = !!(
    narrative &&
    narrative.hook &&
    Array.isArray(narrative.narrativeBeats) &&
    (narrative.narrativeBeats as unknown[]).length > 0 &&
    narrative.keyTakeaway
  );

  const vizHtml = visualization?.html as string | undefined;
  const hasVisualization = !!(
    visualization &&
    vizHtml &&
    vizHtml.length > 100
  );

  if (!hasNarrative && !hasVisualization) {
    return { hit: false, reason: "missing both narrative and visualization", hasNarrative, hasVisualization };
  }
  if (!hasNarrative) {
    return { hit: false, reason: "missing narrative", hasNarrative, hasVisualization };
  }
  if (!hasVisualization) {
    return { hit: false, reason: "missing visualization (html too short or absent)", hasNarrative, hasVisualization };
  }

  return { hit: true, reason: "complete", hasNarrative, hasVisualization };
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

    // Check cache (skip if force=true)
    if (!options.force) {
      const snap = await lessonRef.get();
      if (snap.exists) {
        const data = snap.data()!;
        const check = isCacheHit(data);

        console.log("[chapter-lesson] cache check", {
          lessonId,
          exists: true,
          hasNarrative: check.hasNarrative,
          hasVisualization: check.hasVisualization,
          storedPromptVersion: data.promptVersion,
          willHit: check.hit,
        });

        if (check.hit) {
          console.log("[chapter-lesson] CACHE HIT", { lessonId });
          return {
            status: "cached",
            lesson: data,
            error: null,
            durationMs: Date.now() - start,
          };
        }

        // Partial cache: has narrative but no viz → only regenerate viz
        if (check.hasNarrative && !check.hasVisualization) {
          console.log("[chapter-lesson] CACHE MISS (partial — regenerating viz only)", { lessonId, reason: check.reason });
          const narrative = data.narrative as Record<string, unknown>;
          const chapter = getChapter("mathematics", classLevel, chapterId);
          if (chapter) {
            const vizResult = await generateVisualization(
              chapterId,
              chapter.label,
              classLevel,
              chapter.description || chapter.label,
              narrative.keyTakeaway as string
            );
            const updatedLesson = {
              ...data,
              visualization: vizResult,
              promptVersion: PROMPT_VERSION,
              generatedAt: FieldValue.serverTimestamp(),
            };
            await lessonRef.update({
              visualization: vizResult,
              promptVersion: PROMPT_VERSION,
              generatedAt: FieldValue.serverTimestamp(),
            });
            return {
              status: "seeded",
              lesson: updatedLesson,
              error: null,
              durationMs: Date.now() - start,
            };
          }
        }

        console.log("[chapter-lesson] CACHE MISS", { lessonId, reason: check.reason });
      } else {
        console.log("[chapter-lesson] CACHE MISS", { lessonId, reason: "document does not exist" });
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
    const vizData = await generateVisualization(
      chapterId,
      chapter.label,
      classLevel,
      chapterDescription,
      narrativeResult.data.keyTakeaway
    );

    const lesson = {
      lessonId,
      chapterId,
      classLevel,
      promptVersion: PROMPT_VERSION,
      narrative: narrativeResult.data,
      visualization: vizData,
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

async function generateVisualization(
  chapterId: string,
  chapterLabel: string,
  classLevel: "11" | "12",
  chapterDescription: string,
  keyTakeaway: string
): Promise<{
  title: string;
  interactionHint: string;
  html: string;
  sanitizationWarnings: string[];
}> {
  const vizPrompt = buildChapterVisualizationPrompt({
    chapterId,
    chapterLabel,
    classLevel,
    chapterDescription,
    keyTakeaway,
  });

  try {
    const vizResult = await callClaude({
      system: vizPrompt.system,
      user: vizPrompt.user,
      schema: ChapterVisualizationSchema,
      promptVersion: vizPrompt.promptVersion,
    });

    const sanitized = sanitizeVizHtml(vizResult.data.html);

    if (sanitized.safe) {
      return {
        title: vizResult.data.title,
        interactionHint: vizResult.data.interactionHint,
        html: sanitized.safe,
        sanitizationWarnings: sanitized.warnings,
      };
    }

    return {
      title: chapterLabel,
      interactionHint: "Interactive visualization unavailable",
      html: fallbackVizHtml(chapterLabel, keyTakeaway),
      sanitizationWarnings: [...sanitized.warnings, "Fell back to static visualization"],
    };
  } catch {
    return {
      title: chapterLabel,
      interactionHint: "Interactive visualization unavailable",
      html: fallbackVizHtml(chapterLabel, keyTakeaway),
      sanitizationWarnings: ["Visualization generation failed, using fallback"],
    };
  }
}
