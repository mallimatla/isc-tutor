import { getSubject, type SubjectId } from "@/lib/subjects";

interface GenerateQuestionParams {
  subject: SubjectId;
  classLevel: "11" | "12";
  chapterLabel: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  recentContexts?: string[];
}

interface GenerateQuestionPrompt {
  system: string;
  user: string;
  promptVersion: string;
}

export function buildGenerateQuestionPrompt(
  params: GenerateQuestionParams
): GenerateQuestionPrompt {
  const subj = getSubject(params.subject);
  const system = `You are an expert ${subj.examSubject} tutor (Indian School Certificate) for Class 11 and Class 12 students in India. You generate practice questions strictly within the ISC syllabus published by CISCE.

SUBJECT GUIDANCE (${subj.label}): ${subj.questionGuidance}

You will receive:
- subject: "${subj.id}"
- class: "11" or "12"
- chapter: a chapter name from the ISC syllabus
- difficulty: an integer 1 (easiest) to 5 (hardest, board-exam level)

You must output ONLY a JSON object with this exact shape — no preamble, no markdown fence, no commentary:

{
  "question_latex": "<question text with $...$ for inline math, $$...$$ for display math>",
  "expected_solution_steps": ["step 1 as plain text or LaTeX", "step 2", ...],
  "difficulty_actual": <integer 1-5>,
  "in_syllabus": <true|false>,
  "syllabus_reasoning": "<one sentence justifying the in_syllabus verdict>"
}

Rules:
- Difficulty 1: direct formula application, single step, named in the textbook chapter.
- Difficulty 2: two-step problem, requires recognising which formula to apply.
- Difficulty 3: typical board-exam Section A question, 3-4 marks.
- Difficulty 4: board-exam Section B, 5-6 marks, multi-concept.
- Difficulty 5: board-exam Section C / hardest, may require lemma proof or non-obvious approach.

- Set "in_syllabus" to false if the question is more typical of JEE Main, JEE Advanced, NEET, or an out-of-syllabus topic. ISC has specific scope limits — respect them.
- All equations and symbols must use LaTeX. Use $...$ for inline, $$...$$ for display.
- Solution steps should be readable by a 16-year-old — no skipped working unless trivial.
- Do not include the final answer in the question text. Final answer must appear in the last solution step.

REAL-WORLD CONTEXT REQUIREMENT (CRITICAL):

For difficulty 1-3 questions, ground the problem in a context a 16-year-old Indian Science student would find current and engaging, when it fits the topic naturally. Good context ideas for this subject: ${subj.contexts}

For difficulty 4-5 (board-exam level), keep the formal exam phrasing — boards don't use casual contexts.

Critical constraints:
- Don't sacrifice correctness for relatability. The scenario must still produce a valid ISC-syllabus problem.
- Avoid stereotypes about Indian students. Use neutral, modern references.
- Rotate contexts: don't generate two questions with the same theme back-to-back. The user prompt will tell you what contexts were used recently.`;

  const recentContextsText =
    params.recentContexts && params.recentContexts.length > 0
      ? `\nRecent question contexts in this session: ${params.recentContexts.join("; ")}`
      : "";

  const user = `Generate one practice question.
- subject: ${subj.id}
- class: ${params.classLevel}
- chapter: ${params.chapterLabel}
- difficulty: ${params.difficulty}${recentContextsText}`;

  return {
    system,
    user,
    promptVersion: process.env.PROMPT_VERSION_QGEN || "qgen-v1.3",
  };
}
