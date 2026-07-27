import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, assertAdmin, UnauthorizedError } from "@/lib/verify-token";
import { getChapter } from "@/lib/syllabus";
import { getChapterSyllabus } from "@/lib/isc-syllabus";
import { getChapterTheme } from "@/lib/chapter-theme";
import {
  buildLessonNarrativePrompt,
  buildLessonDiagramPrompt,
  LESSON_V3_VERSION,
} from "@/lib/prompts/lesson";
import { callClaudeText, safeParseClaudeJson } from "@/lib/anthropic";
import { sanitizeSvg } from "@/lib/sanitize-svg";

// Lesson generation makes one narrative call plus a few diagram calls. Allow a
// long execution window (Vercel Pro honours up to 300s; on Hobby it is capped
// at the plan limit). Diagrams are generated in parallel to keep within it.
export const maxDuration = 300;

const RequestBodySchema = z.object({
  subject: z.enum(["mathematics", "physics", "chemistry"]),
  classLevel: z.enum(["11", "12"]),
  chapterId: z.string().min(1).max(120),
  force: z.boolean().optional(),
});

interface DiagramPlanItem {
  title: string;
  description: string;
  afterBeat: number;
}

interface NarrativeOutput {
  syllabusCoverage: string[];
  hook: string;
  narrative: {
    beats: Array<{ title: string; content: string }>;
    commonMistakes: Array<{ mistake: string; why: string; fix: string }>;
    quickReferenceCard: string[];
    keyTakeaway: string;
  };
  diagramPlan: DiagramPlanItem[];
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequest(req);
    assertAdmin(user);

    const parsed = RequestBodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { subject, classLevel, chapterId, force } = parsed.data;

    const chapter = getChapter(subject, classLevel, chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "CHAPTER_NOT_FOUND" }, { status: 404 });
    }
    const syllabus = getChapterSyllabus(chapterId);
    if (!syllabus) {
      return NextResponse.json(
        { error: "NO_SYLLABUS", message: `No subtopics for ${chapterId}` },
        { status: 400 }
      );
    }

    const lessonId = `${classLevel}-${chapterId}`;
    const ref = adminDb.collection(col("chapter_lessons")).doc(lessonId);

    if (!force) {
      const snap = await ref.get();
      if (snap.exists && snap.data()?.promptVersion === LESSON_V3_VERSION) {
        return NextResponse.json({ status: "skipped", lessonId });
      }
    }

    // 1. Narrative + diagram plan.
    const narrativePrompt = buildLessonNarrativePrompt({
      subject,
      chapterId,
      chapterLabel: chapter.label,
      classLevel,
      chapterDescription: chapter.description ?? chapter.label,
      subtopics: syllabus.subtopics,
      suggestedDiagrams: syllabus.suggestedDiagrams,
    });

    const narrativeRaw = await callClaudeText({
      system: narrativePrompt.system,
      user: narrativePrompt.user,
      promptVersion: narrativePrompt.promptVersion,
      maxTokens: 6000,
    });

    let narrative: NarrativeOutput;
    try {
      narrative = safeParseClaudeJson(narrativeRaw.text) as NarrativeOutput;
    } catch {
      return NextResponse.json(
        { error: "BAD_NARRATIVE", message: "Model returned invalid narrative JSON." },
        { status: 502 }
      );
    }
    if (!narrative?.narrative || !Array.isArray(narrative.narrative.beats)) {
      return NextResponse.json(
        { error: "BAD_NARRATIVE", message: "Narrative is missing beats." },
        { status: 502 }
      );
    }
    const beatsLen = narrative.narrative.beats.length;
    const plan = Array.isArray(narrative.diagramPlan) ? narrative.diagramPlan : [];
    for (const d of plan) {
      if (typeof d.afterBeat !== "number" || d.afterBeat < 0 || d.afterBeat >= beatsLen) {
        d.afterBeat = Math.min(Math.max(0, Math.floor(d.afterBeat ?? 0)), beatsLen - 1);
      }
    }

    // 2. Diagrams — generated in parallel; a failed diagram is dropped, not fatal.
    const { primary, secondary } = getChapterTheme(chapterId).hex;
    const diagramResults = await Promise.all(
      plan.map(async (item, i) => {
        try {
          const dp = buildLessonDiagramPrompt({
            subject,
            chapterLabel: chapter.label,
            classLevel,
            diagramTitle: item.title,
            diagramDescription: item.description,
            primaryHex: primary,
            secondaryHex: secondary,
          });
          const svgRaw = await callClaudeText({
            system: dp.system,
            user: dp.user,
            promptVersion: dp.promptVersion,
            maxTokens: 4096,
          });
          return {
            id: `${lessonId}-d${i}`,
            title: item.title,
            svg: sanitizeSvg(svgRaw.text),
            caption: item.description,
            afterBeat: item.afterBeat,
          };
        } catch {
          return null;
        }
      })
    );
    const diagrams = diagramResults.filter((d) => d !== null);

    // 3. Assemble + write (same shape as scripts/seed-lessons.mjs; no hero image).
    const doc = {
      chapterId,
      classLevel,
      subject,
      lessonId,
      promptVersion: LESSON_V3_VERSION,
      generatedAt: FieldValue.serverTimestamp(),
      syllabusCoverage: narrative.syllabusCoverage ?? syllabus.subtopics,
      hook: narrative.hook ?? "",
      heroImageBase64: null,
      heroImageMimeType: null,
      diagrams,
      narrative: {
        beats: narrative.narrative.beats,
        commonMistakes: narrative.narrative.commonMistakes ?? [],
        quickReferenceCard: narrative.narrative.quickReferenceCard ?? [],
        keyTakeaway: narrative.narrative.keyTakeaway ?? "",
      },
    };
    await ref.set(doc);

    return NextResponse.json({
      status: "current",
      lessonId,
      beatCount: beatsLen,
      diagramCount: diagrams.length,
      diagramsPlanned: plan.length,
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error({
      route: "POST /api/admin/lessons/generate",
      errorName: err instanceof Error ? err.name : "Unknown",
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      {
        error: "INTERNAL",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
