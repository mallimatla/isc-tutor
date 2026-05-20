/**
 * Pre-generates chapter lessons for all 29 ISC Math chapters.
 * Run: npx tsx scripts/pregenerate-lessons.ts
 *
 * Requires env vars: ANTHROPIC_API_KEY, FIREBASE_PROJECT_ID,
 * FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIRESTORE_COLLECTION_PREFIX
 *
 * Cost: ~$2-3 total in Claude API calls.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

// Force env check before imports
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in .env.local");
  process.exit(1);
}

async function main() {
  // Dynamic imports after env is loaded
  const { adminDb, col } = await import("../lib/firebase-admin");
  const { getAllChapters } = await import("../lib/syllabus");
  const { callClaude } = await import("../lib/anthropic");
  const {
    buildChapterNarrativePrompt,
    buildChapterVisualizationPrompt,
  } = await import("../lib/prompts/chapter-lesson");
  const {
    ChapterNarrativeSchema,
    ChapterVisualizationSchema,
  } = await import("../lib/schemas/chapter-lesson");
  const { sanitizeVizHtml } = await import("../lib/sanitize-viz-html");
  const { FieldValue } = await import("firebase-admin/firestore");

  const PROMPT_VERSION = process.env.PROMPT_VERSION_LESSON || "lesson-v1.0";

  const chapters = [
    ...getAllChapters("mathematics", "11").map((c) => ({
      ...c,
      classLevel: "11" as const,
    })),
    ...getAllChapters("mathematics", "12").map((c) => ({
      ...c,
      classLevel: "12" as const,
    })),
  ];

  console.log(`Pre-generating lessons for ${chapters.length} chapters...\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const ch of chapters) {
    const lessonId = `${ch.classLevel}-${ch.id}`;
    const lessonRef = adminDb.collection(col("chapter_lessons")).doc(lessonId);
    const snap = await lessonRef.get();

    if (snap.exists && snap.data()?.promptVersion === PROMPT_VERSION) {
      console.log(`  [skip] ${lessonId} — already cached`);
      skipped++;
      continue;
    }

    console.log(`  [gen]  ${lessonId} — ${ch.label}...`);

    try {
      const desc =
        ch.description ||
        `ISC ${ch.classLevel === "11" ? "Class 11" : "Class 12"} chapter: ${ch.label}`;

      // Generate narrative
      const narPrompt = buildChapterNarrativePrompt({
        chapterId: ch.id,
        chapterLabel: ch.label,
        classLevel: ch.classLevel,
        chapterDescription: desc,
      });
      const narResult = await callClaude({
        system: narPrompt.system,
        user: narPrompt.user,
        schema: ChapterNarrativeSchema,
        promptVersion: narPrompt.promptVersion,
      });

      // Generate visualization
      const vizPrompt = buildChapterVisualizationPrompt({
        chapterId: ch.id,
        chapterLabel: ch.label,
        classLevel: ch.classLevel,
        chapterDescription: desc,
        keyTakeaway: narResult.data.keyTakeaway,
      });
      const vizResult = await callClaude({
        system: vizPrompt.system,
        user: vizPrompt.user,
        schema: ChapterVisualizationSchema,
        promptVersion: vizPrompt.promptVersion,
      });

      const sanitized = sanitizeVizHtml(vizResult.data.html);

      const lesson = {
        lessonId,
        chapterId: ch.id,
        classLevel: ch.classLevel,
        promptVersion: PROMPT_VERSION,
        narrative: narResult.data,
        visualization: {
          title: vizResult.data.title,
          interactionHint: vizResult.data.interactionHint,
          html: sanitized.safe || `<!DOCTYPE html><html><body><p>${ch.label}</p></body></html>`,
          sanitizationWarnings: sanitized.warnings,
        },
        generatedAt: FieldValue.serverTimestamp(),
      };

      await lessonRef.set(lesson);
      generated++;
      console.log(`         done (${narResult.latencyMs + vizResult.latencyMs}ms total)`);
    } catch (err) {
      failed++;
      console.error(`         FAILED: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`\nDone. Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`);
  process.exit(0);
}

main();
