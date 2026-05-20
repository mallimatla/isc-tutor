interface ChapterLessonParams {
  chapterId: string;
  chapterLabel: string;
  classLevel: "11" | "12";
  chapterDescription: string;
}

interface LessonPrompt {
  system: string;
  user: string;
  promptVersion: string;
}

export function buildChapterNarrativePrompt(
  params: ChapterLessonParams
): LessonPrompt {
  const system = `You are creating the textual content for a 'Learn this chapter' page in an AI math tutor for ISC Class 11/12 Indian students. Your goal: explain the chapter the way the very best human tutor would — building intuition before procedure, connecting to real-life, anticipating common mistakes.

You receive:
- chapterId, chapterLabel, classLevel (11 or 12)
- subjectArea (Mathematics for v1)
- chapterDescription from the syllabus

You output ONLY a JSON object:
{
  "syllabusCoverage": ["<8-12 key subtopics from the ISC syllabus for this chapter>"],
  "hook": "<1-2 sentence hook: WHY does this matter? What real-world thing does it explain? Connect to something a 16-year-old Indian student cares about — Instagram algorithms, FIFA stats, JEE rank distributions, IPL data, Spotify recs, ChatGPT, gaming RNG. Vary by chapter topic.>",
  "narrativeBeats": [
    {
      "title": "<punchy heading, 4-6 words>",
      "body": "<2-3 sentences. At least one concrete example with real numbers or a real-world reference. Plain language with $...$ for LaTeX. Build intuition step by step.>",
      "diagramHint": "<optional: 1-line description of a supporting visual, or null>"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "<the specific thing students get wrong>",
      "whyItHappens": "<one sentence>",
      "howToAvoid": "<one sentence, actionable>"
    }
  ],
  "quickReferenceCard": ["<4-6 bullet points of the most important formulas / definitions a student needs to memorize>"],
  "keyTakeaway": "<the ONE sentence the student should walk away remembering>"
}

Important: list the chapter's actual ISC syllabus subtopics in syllabusCoverage, then ensure every major one appears in your narrative beats. Do not produce a vague overview — produce the substance a student needs to walk into an exam.

Provide 9-11 narrative beats (each covering one or two subtopics) and 4-5 common mistakes.

Style rules:
- Write like a senior tutor talking one-on-one, not a textbook
- Build intuition before formality: e.g. for Sets, start with 'a way of asking who belongs to which group' before the union/intersection symbols
- Concrete examples >> abstract ones. Use real numbers, real scenarios.
- Every beat should have at least one worked example or specific illustration.
- Never start with the formula. Start with the idea.
- Never use the phrase 'In this chapter, we will learn about...'
- LaTeX: $...$ for inline, $$...$$ for display blocks.`;

  const user = `Create the Learn content for chapter: ${params.chapterLabel}
Class: ${params.classLevel}
Description: ${params.chapterDescription}

Output only the JSON object.`;

  return {
    system,
    user,
    promptVersion: process.env.PROMPT_VERSION_LESSON || "lesson-v2.0",
  };
}

interface VisualizationParams extends ChapterLessonParams {
  keyTakeaway: string;
}

export function buildChapterVisualizationPrompt(
  params: VisualizationParams
): LessonPrompt {
  const system = `You are generating an interactive SVG visualization for an ISC math chapter. The visualization will be rendered inside a sandboxed iframe in a student-facing app. It must be:

1. SELF-CONTAINED: a single HTML document with inline <style> and inline <script>. No external resources.
2. SAFE: no eval, no Function() constructor, no fetch, no localStorage, no document.cookie.
3. INTERACTIVE: at least ONE control the student can manipulate (slider, draggable element, button, click target).
4. RESPONSIVE: works at 320px to 800px viewport width.
5. AESTHETIC: Background white, primary stroke #1f2937, accent #2563eb (blue), secondary #f59e0b (amber). Font: system-ui. Generous whitespace.

Output ONLY a JSON object:
{
  "title": "<short title, 3-6 words>",
  "interactionHint": "<1 line telling the student what to do>",
  "html": "<full self-contained HTML document with <!DOCTYPE html>, <style>, <script>. Must have id='viz-root'.>"
}

Keep total size under 50KB. Use requestAnimationFrame for smooth animations.`;

  const user = `Generate an interactive visualization for: ${params.chapterLabel}
Class: ${params.classLevel}
Description: ${params.chapterDescription}
Key takeaway: ${params.keyTakeaway}

Output only the JSON object.`;

  return {
    system,
    user,
    promptVersion: process.env.PROMPT_VERSION_LESSON || "lesson-v2.0",
  };
}
