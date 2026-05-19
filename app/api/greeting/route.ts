import { NextRequest, NextResponse } from "next/server";
import { adminDb, col } from "@/lib/firebase-admin";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";
import {
  buildGreetingPrompt,
  GreetingOutputSchema,
} from "@/lib/prompts/personalized-greeting";
import { callClaude } from "@/lib/anthropic";
import { getChapter } from "@/lib/syllabus";

export async function POST(req: NextRequest) {
  let uid = "";
  try {
    const user = await verifyRequest(req);
    uid = user.uid;

    // Load session
    const sessionRef = adminDb.collection(col("sessions")).doc(uid);
    const sessionSnap = await sessionRef.get();
    const sessionData = sessionSnap.exists ? sessionSnap.data() : null;

    const totalQuestionsAnswered = sessionData?.totalAnswered ?? 0;
    const totalCorrect = sessionData?.totalCorrect ?? 0;
    const displayName = user.displayName ?? "there";

    // Load recent questions to build session summaries
    const recentQuestionsSnap = await adminDb
      .collection(col("questions"))
      .where("sessionId", "==", uid)
      .orderBy("generatedAt", "desc")
      .limit(30)
      .get();

    // Group by chapter for recent session summaries
    const chapterMap = new Map<
      string,
      { chapterId: string; classLevel: string; count: number }
    >();
    const questionIds: string[] = [];
    for (const doc of recentQuestionsSnap.docs) {
      const d = doc.data();
      questionIds.push(doc.id);
      const existing = chapterMap.get(d.chapterId) ?? {
        chapterId: d.chapterId,
        classLevel: d.class,
        count: 0,
      };
      existing.count++;
      chapterMap.set(d.chapterId, existing);
    }

    // Load evaluations for those questions
    const evalsByQuestion = new Map<string, string>();
    if (questionIds.length > 0) {
      // Firestore 'in' queries limited to 30
      const evalsSnap = await adminDb
        .collection(col("evaluations"))
        .where("sessionId", "==", uid)
        .orderBy("evaluatedAt", "desc")
        .limit(50)
        .get();
      for (const doc of evalsSnap.docs) {
        const d = doc.data();
        if (!evalsByQuestion.has(d.questionId)) {
          evalsByQuestion.set(d.questionId, d.verdict);
        }
      }
    }

    // Build per-chapter accuracy
    const chapterAccuracy = new Map<
      string,
      { answered: number; correct: number }
    >();
    for (const doc of recentQuestionsSnap.docs) {
      const d = doc.data();
      const verdict = evalsByQuestion.get(doc.id);
      if (!verdict) continue;
      const stats = chapterAccuracy.get(d.chapterId) ?? {
        answered: 0,
        correct: 0,
      };
      stats.answered++;
      if (verdict === "correct") stats.correct++;
      chapterAccuracy.set(d.chapterId, stats);
    }

    const recentSessions = Array.from(chapterMap.entries())
      .slice(0, 5)
      .map(([chapterId, info]) => {
        const chapter = getChapter(
          "mathematics",
          info.classLevel as "11" | "12",
          chapterId
        );
        const acc = chapterAccuracy.get(chapterId) ?? {
          answered: 0,
          correct: 0,
        };
        return {
          chapterId,
          chapterLabel: chapter?.label ?? chapterId,
          questionsAnswered: acc.answered,
          correct: acc.correct,
        };
      });

    // Load struggled sub-skills from recent dialogues
    const dialoguesSnap = await adminDb
      .collection(col("dialogues"))
      .where("sessionId", "==", uid)
      .orderBy("startedAt", "desc")
      .limit(10)
      .get();

    const skillCounts = new Map<string, number>();
    for (const doc of dialoguesSnap.docs) {
      const d = doc.data();
      const struggled = d.subSkillsStruggled as string[] | undefined;
      if (struggled) {
        for (const skill of struggled) {
          skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1);
        }
      }
    }
    const struggledSubSkills = Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill);

    const now = new Date();
    const currentDateTime = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const prompt = buildGreetingPrompt({
      displayName,
      totalQuestionsAnswered,
      totalCorrect,
      recentSessions,
      struggledSubSkills,
      currentDateTime,
    });

    const result = await callClaude({
      system: prompt.system,
      user: prompt.user,
      schema: GreetingOutputSchema,
      promptVersion: prompt.promptVersion,
    });

    return NextResponse.json(result.data);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error({
      route: "POST /api/greeting",
      uid,
      errorName: err instanceof Error ? err.name : "Unknown",
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    // Return a safe fallback greeting on error
    return NextResponse.json({
      greeting: "Welcome back! Ready to practice some maths?",
      recommendedAction: {
        type: "first_visit" as const,
        chapterId: null,
        reasoning: "Fallback greeting due to server error",
      },
    });
  }
}
