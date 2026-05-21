import { NextRequest, NextResponse } from "next/server";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, assertAdmin, UnauthorizedError } from "@/lib/verify-token";
import { getAllChapters } from "@/lib/syllabus";

const ACTIVE_PROMPT_VERSION = "lesson-v3.0";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyRequest(req);
    assertAdmin(user);

    const syllabus = [
      ...getAllChapters("mathematics", "11").map((c) => ({
        ...c,
        classLevel: "11" as const,
      })),
      ...getAllChapters("mathematics", "12").map((c) => ({
        ...c,
        classLevel: "12" as const,
      })),
    ];

    const lessonsSnap = await adminDb
      .collection(col("chapter_lessons"))
      .get();

    const lessonMap = new Map<string, Record<string, unknown>>();
    for (const doc of lessonsSnap.docs) {
      lessonMap.set(doc.id, doc.data());
    }

    const chapters = syllabus.map((ch) => {
      const lessonId = `${ch.classLevel}-${ch.id}`;
      const lesson = lessonMap.get(lessonId);

      const promptVersion = (lesson?.promptVersion as string) ?? null;
      const isCurrent = promptVersion === ACTIVE_PROMPT_VERSION;
      const status: "current" | "stale" | "not-seeded" = !lesson
        ? "not-seeded"
        : isCurrent
          ? "current"
          : "stale";

      const narrative = lesson?.narrative as
        | { beats?: unknown[] }
        | undefined;
      const beatCount = Array.isArray(narrative?.beats)
        ? (narrative!.beats as unknown[]).length
        : 0;
      const diagrams = lesson?.diagrams as unknown[] | undefined;
      const diagramCount = Array.isArray(diagrams) ? diagrams.length : 0;
      const hasHeroImage =
        typeof lesson?.heroImageBase64 === "string" &&
        (lesson.heroImageBase64 as string).length > 100;

      const generatedAt = lesson?.generatedAt;
      const genTimestamp =
        generatedAt &&
        typeof generatedAt === "object" &&
        "toDate" in (generatedAt as object)
          ? (generatedAt as { toDate: () => Date }).toDate().toISOString()
          : null;

      return {
        chapterId: ch.id,
        chapterLabel: ch.label,
        classLevel: ch.classLevel,
        lessonId,
        status,
        promptVersion,
        generatedAt: genTimestamp,
        beatCount,
        diagramCount,
        hasHeroImage,
        sizeBytes: lesson ? JSON.stringify(lesson).length : null,
      };
    });

    const summary = {
      total: chapters.length,
      current: chapters.filter((c) => c.status === "current").length,
      stale: chapters.filter((c) => c.status === "stale").length,
      notSeeded: chapters.filter((c) => c.status === "not-seeded").length,
      activeVersion: ACTIVE_PROMPT_VERSION,
    };

    return NextResponse.json({ chapters, summary });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error({
      route: "GET /api/admin/lessons",
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "INTERNAL" }, { status: 500 });
  }
}
