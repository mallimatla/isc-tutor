import { z } from "zod";

export const GreetingOutputSchema = z.object({
  greeting: z.string(),
  recommendedAction: z.object({
    type: z.enum([
      "revisit_weakness",
      "continue_chapter",
      "new_chapter",
      "first_visit",
    ]),
    chapterId: z.string().nullable(),
    reasoning: z.string(),
  }),
});

export type GreetingOutput = z.infer<typeof GreetingOutputSchema>;

interface GreetingParams {
  displayName: string;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  recentSessions: Array<{
    chapterId: string;
    chapterLabel: string;
    questionsAnswered: number;
    correct: number;
  }>;
  struggledSubSkills: string[];
  currentDateTime: string;
}

interface GreetingPrompt {
  system: string;
  user: string;
  promptVersion: string;
}

export function buildGreetingPrompt(params: GreetingParams): GreetingPrompt {
  const system = `You are warmly greeting an ISC Class 11 or 12 Science student opening their AI math tutor. Be concise (2-3 sentences total), warm but not gushy, never patronizing. Reference their session history meaningfully. Recommend ONE specific next action — either revisit a weak topic or move forward.

You receive:
- Student's displayName (first name only — extract from full name)
- totalQuestionsAnswered (lifetime)
- totalCorrect (lifetime)
- Last 5 sessions' chapter and accuracy summary
- Sub-skills they've struggled with recently (top 3)
- Current date/time (so you can vary 'good morning' etc)

Output ONLY a JSON object:
{
  "greeting": "<the full greeting message, 2-3 sentences>",
  "recommendedAction": {
    "type": "revisit_weakness" | "continue_chapter" | "new_chapter" | "first_visit",
    "chapterId": "<from ISC syllabus>" | null,
    "reasoning": "<one-sentence why>"
  }
}

Examples by case:
- First-time visitor: 'Hi Nag — first time here. ISC Mathematics is big, but you don't have to swallow it all at once. Pick any chapter you're working on right now and let's start there.'
- Returning, did well: 'Welcome back, Nag. You crushed Trigonometric Functions yesterday — 8 out of 10 on hard questions. Ready to try Inverse Trig today, or want to bank the win first with one more easy round?'
- Returning, struggled: 'Hey Nag. Yesterday you got tangled up on the cardinality formula in Sets — totally normal, that's where most students slip. Let's clean that up today with three focused questions before moving on. Sound good?'`;

  const firstName = params.displayName.split(" ")[0] || params.displayName;

  const recentSessionsText =
    params.recentSessions.length === 0
      ? "No prior sessions."
      : params.recentSessions
          .map(
            (s) =>
              `${s.chapterLabel}: ${s.correct}/${s.questionsAnswered} correct`
          )
          .join("\n");

  const user = `Student: ${firstName}
Total questions answered (lifetime): ${params.totalQuestionsAnswered}
Total correct (lifetime): ${params.totalCorrect}
Current date/time: ${params.currentDateTime}

Last sessions:
${recentSessionsText}

Sub-skills struggled with recently: ${
    params.struggledSubSkills.length > 0
      ? params.struggledSubSkills.join(", ")
      : "none"
  }`;

  return {
    system,
    user,
    promptVersion: process.env.PROMPT_VERSION_GREETING || "greeting-v1.0",
  };
}
