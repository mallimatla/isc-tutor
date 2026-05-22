import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";

const RequestBodySchema = z.object({
  chapterId: z.string().min(1),
  classLevel: z.enum(["11", "12"]),
});

export const maxDuration = 10;

// Records that the student has opened the Learn lesson for a chapter. This is
// a lightweight engagement signal — it does NOT participate in the practice-
// based mastery calculation in lib/mastery.ts. The mastery map layers it on
// top to surface a "learning" state for chapters the student has touched but
// not yet answered any questions on.
//
// Idempotent: writes a single field at sessions/{uid}.learningOpened.{lessonKey}
// using a server timestamp; the same chapter being opened repeatedly is a
// no-op except for refreshing the timestamp.
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
    const lessonKey = `${classLevel}-${chapterId}`;

    const sessionRef = adminDb.collection(col("sessions")).doc(uid);
    await sessionRef.set(
      {
        sessionId: uid,
        lastActiveAt: FieldValue.serverTimestamp(),
        learningOpened: {
          [lessonKey]: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, lessonKey });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error({
      route: "POST /api/progress/lesson-opened",
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
