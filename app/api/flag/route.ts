import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";

const RequestBodySchema = z.object({
  questionId: z.string().min(1),
  evaluationId: z.string().nullable(),
  flagType: z.enum(["off_syllabus", "wrong_question", "disputed_evaluation"]),
  studentNote: z.string().max(200).nullable(),
});

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

    const { questionId, evaluationId, flagType, studentNote } = parsed.data;

    // Verify question belongs to this user
    const questionSnap = await adminDb
      .collection(col("questions"))
      .doc(questionId)
      .get();

    if (!questionSnap.exists) {
      return NextResponse.json(
        { error: "QUESTION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const questionData = questionSnap.data()!;
    if (questionData.sessionId !== uid) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // Persist flag
    const flagRef = adminDb.collection(col("flags")).doc();
    await flagRef.set({
      flagId: flagRef.id,
      sessionId: uid,
      questionId,
      evaluationId,
      flagType,
      flaggedAt: FieldValue.serverTimestamp(),
      studentNote,
      resolved: false,
      resolution: null,
    });

    return NextResponse.json({ flagId: flagRef.id, thanks: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error({
      route: "POST /api/flag",
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
