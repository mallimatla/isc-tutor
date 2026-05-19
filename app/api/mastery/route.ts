import { NextRequest, NextResponse } from "next/server";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";
import { getAllChapters } from "@/lib/syllabus";
import { computeMastery } from "@/lib/mastery";

export async function GET(req: NextRequest) {
  let uid = "";
  try {
    const user = await verifyRequest(req);
    uid = user.uid;

    // Build full syllabus list
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

    // Load all questions for this user
    const questionsSnap = await adminDb
      .collection(col("questions"))
      .where("sessionId", "==", uid)
      .get();

    const questions = questionsSnap.docs.map((doc) => ({
      questionId: doc.id,
      ...doc.data(),
    })) as Array<{
      questionId: string;
      chapterId: string;
      class: string;
      difficultyActual?: number;
    }>;

    // Load all evaluations for this user
    const evalsSnap = await adminDb
      .collection(col("evaluations"))
      .where("sessionId", "==", uid)
      .get();

    const evaluations = evalsSnap.docs.map((doc) => doc.data()) as Array<{
      questionId: string;
      verdict: string;
      evaluatedAt?: { toDate?: () => Date } | null;
    }>;

    const mastery = computeMastery(syllabus, questions, evaluations);

    return NextResponse.json(mastery);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error({
      route: "GET /api/mastery",
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
