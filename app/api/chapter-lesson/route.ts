import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";
import { adminDb, col } from "@/lib/firebase-admin";

// Read-only Firestore fetch. Lessons are seeded locally via
// `npm run seed:lessons`; the Vercel runtime never generates them. This route
// stays well under any function-duration ceiling.
export const maxDuration = 30;

const RequestBodySchema = z.object({
  chapterId: z.string().min(1),
  classLevel: z.enum(["11", "12"]),
});

export async function POST(req: NextRequest) {
  try {
    await verifyRequest(req);

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

    const snap = await adminDb
      .collection(col("chapter_lessons"))
      .doc(lessonId)
      .get();

    if (!snap.exists) {
      return NextResponse.json({ lesson: null, status: "not_generated" });
    }

    const data = snap.data()!;
    return NextResponse.json({ lesson: data, status: "ok" });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error({
      route: "POST /api/chapter-lesson",
      errorName: err instanceof Error ? err.name : "Unknown",
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "INTERNAL", retryable: true },
      { status: 500 }
    );
  }
}
