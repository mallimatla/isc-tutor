export interface ChapterMastery {
  chapterId: string;
  chapterLabel: string;
  classLevel: "11" | "12";
  status: "mastered" | "practicing" | "untouched";
  questionsAttempted: number;
  accuracy: number;
  lastPracticed: string | null; // ISO string
}

export interface MasteryMap {
  chapters: ChapterMastery[];
  totalMastered: number;
  totalPracticing: number;
  totalChapters: number;
}

interface QuestionDoc {
  chapterId: string;
  class: string;
  difficultyActual?: number;
}

interface EvaluationDoc {
  questionId: string;
  verdict: string;
  evaluatedAt?: { toDate?: () => Date } | null;
}

export function computeMastery(
  syllabus: Array<{
    id: string;
    label: string;
    classLevel: "11" | "12";
  }>,
  questions: QuestionDoc[],
  evaluations: EvaluationDoc[]
): MasteryMap {
  // Build questionId -> question lookup
  const questionById = new Map<string, QuestionDoc>();
  for (const q of questions) {
    questionById.set((q as QuestionDoc & { questionId: string }).questionId, q);
  }

  // Build per-chapter stats
  const chapterStats = new Map<
    string,
    {
      attempted: number;
      correct: number;
      highDifficultyCorrect: number;
      highDifficultyAttempted: number;
      lastPracticed: Date | null;
    }
  >();

  for (const e of evaluations) {
    const q = questionById.get(e.questionId);
    if (!q) continue;

    const stats = chapterStats.get(q.chapterId) ?? {
      attempted: 0,
      correct: 0,
      highDifficultyCorrect: 0,
      highDifficultyAttempted: 0,
      lastPracticed: null,
    };

    stats.attempted++;
    if (e.verdict === "correct") {
      stats.correct++;
      if ((q.difficultyActual ?? 1) >= 3) stats.highDifficultyCorrect++;
    }
    if ((q.difficultyActual ?? 1) >= 3) stats.highDifficultyAttempted++;

    const evalDate = e.evaluatedAt?.toDate?.() ?? null;
    if (evalDate && (!stats.lastPracticed || evalDate > stats.lastPracticed)) {
      stats.lastPracticed = evalDate;
    }

    chapterStats.set(q.chapterId, stats);
  }

  const chapters: ChapterMastery[] = syllabus.map((ch) => {
    const stats = chapterStats.get(ch.id);
    if (!stats || stats.attempted === 0) {
      return {
        chapterId: ch.id,
        chapterLabel: ch.label,
        classLevel: ch.classLevel,
        status: "untouched",
        questionsAttempted: 0,
        accuracy: 0,
        lastPracticed: null,
      };
    }

    const accuracy = stats.correct / stats.attempted;
    const mastered =
      stats.attempted >= 10 &&
      accuracy >= 0.8 &&
      stats.highDifficultyAttempted >= 3 &&
      stats.highDifficultyCorrect / stats.highDifficultyAttempted >= 0.6;

    return {
      chapterId: ch.id,
      chapterLabel: ch.label,
      classLevel: ch.classLevel,
      status: mastered ? "mastered" : "practicing",
      questionsAttempted: stats.attempted,
      accuracy: Math.round(accuracy * 100),
      lastPracticed: stats.lastPracticed?.toISOString() ?? null,
    };
  });

  return {
    chapters,
    totalMastered: chapters.filter((c) => c.status === "mastered").length,
    totalPracticing: chapters.filter((c) => c.status === "practicing").length,
    totalChapters: chapters.length,
  };
}
