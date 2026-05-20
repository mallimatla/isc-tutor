import { NextRequest, NextResponse } from "next/server";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, assertAdmin, UnauthorizedError } from "@/lib/verify-token";
import { getAllChapters } from "@/lib/syllabus";

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

    // Load all cached lessons
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

      let status: "seeded" | "not-seeded" | "failed" = "not-seeded";
      if (lesson) {
        const hasWarnings =
          (lesson.visualization as Record<string, unknown>)?.sanitizationWarnings;
        const warnings = Array.isArray(hasWarnings) ? hasWarnings : [];
        const hasFailed = warnings.some((w: string) =>
          w.includes("Rejected") || w.includes("generation failed")
        );
        status = hasFailed ? "failed" : "seeded";
      }

      const generatedAt = lesson?.generatedAt;
      const genTimestamp =
        generatedAt && typeof generatedAt === "object" && "toDate" in generatedAt
          ? (generatedAt as { toDate: () => Date }).toDate().toISOString()
          : null;

      return {
        chapterId: ch.id,
        chapterLabel: ch.label,
        classLevel: ch.classLevel,
        lessonId: `${ch.classLevel}-${ch.id}`,
        status,
        generatedAt: genTimestamp,
        promptVersion: (lesson?.promptVersion as string) ?? null,
        hasSanitizationWarnings:
          Array.isArray(
            (lesson?.visualization as Record<string, unknown>)
              ?.sanitizationWarnings
          ) &&
          (
            (lesson?.visualization as Record<string, unknown>)
              ?.sanitizationWarnings as string[]
          ).length > 0,
        sizeBytes: lesson ? JSON.stringify(lesson).length : null,
      };
    });

    const summary = {
      total: chapters.length,
      seeded: chapters.filter((c) => c.status === "seeded").length,
      not_seeded: chapters.filter((c) => c.status === "not-seeded").length,
      failed: chapters.filter((c) => c.status === "failed").length,
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
