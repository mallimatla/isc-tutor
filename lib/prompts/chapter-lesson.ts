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
  "hook": "<1-2 sentence hook: WHY does this matter? What real-world thing does it explain? Connect to something a 16-year-old Indian student cares about (apps, games, money, sports, college admissions).>",
  "narrativeBeats": [
    {
      "title": "<short heading like 'The big idea' or 'Where it starts'>",
      "body": "<1-3 sentences. Plain language. Markdown allowed. Use $...$ for inline LaTeX. Build intuition step by step. Avoid jargon until it's earned.>",
      "diagramHint": "<optional: 1-line description of a simple supporting visual if one would help. e.g. 'a Venn diagram with two overlapping circles labeled A and B' or null>"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "<the specific thing students get wrong>",
      "whyItHappens": "<one sentence>",
      "howToAvoid": "<one sentence, actionable>"
    }
  ],
  "keyTakeaway": "<the ONE sentence the student should walk away remembering>"
}

Provide 4-6 narrative beats and 2-3 common mistakes.

Style rules:
- Write like a senior tutor talking one-on-one, not a textbook
- Build intuition before formality: e.g. for Sets, start with 'a way of asking who belongs to which group' before the union/intersection symbols
- Concrete examples >> abstract ones. Use real numbers, real scenarios.
- Never start with the formula. Start with the idea.
- Never use the phrase 'In this chapter, we will learn about...'
- LaTeX: $...$ for inline, $$...$$ for display blocks. Use sparingly in narrative; heavily in any formal beats.`;

  const user = `Create the Learn content for chapter: ${params.chapterLabel}
Class: ${params.classLevel}
Description: ${params.chapterDescription}

Output only the JSON object.`;

  return {
    system,
    user,
    promptVersion: process.env.PROMPT_VERSION_LESSON || "lesson-v1.0",
  };
}

interface VisualizationParams extends ChapterLessonParams {
  keyTakeaway: string;
}

export function buildChapterVisualizationPrompt(
  params: VisualizationParams
): LessonPrompt {
  const system = `You are generating an interactive SVG visualization for an ISC math chapter. The visualization will be rendered inside a sandboxed iframe in a student-facing app. It must be:

1. SELF-CONTAINED: a single HTML document with inline <style> and inline <script>. No external resources, no fetch, no localStorage, no document.cookie access.
2. SAFE: no eval, no Function() constructor, no setTimeout with string argument, no innerHTML with user data, no postMessage to parent.
3. INTERACTIVE: at least ONE control the student can manipulate (a slider, draggable element, button, click target). The visualization must respond to the interaction in a mathematically meaningful way.
4. RESPONSIVE: works at 320px to 800px viewport width.
5. AESTHETIC: clean, minimal, professional. Match these design constraints:
   - Background: white
   - Primary stroke color: #1f2937 (dark grey)
   - Accent color: #2563eb (blue) for interactive elements
   - Secondary accent: #f59e0b (amber) for highlighted regions
   - Font: system-ui, sans-serif. Sizes: 14px body, 12px labels, 18px main title
   - Generous whitespace; no clutter

You receive:
- chapterId, chapterLabel, classLevel
- chapterDescription
- keyTakeaway (from the narrative call — the ONE thing the student should walk away with)

You output ONLY a JSON object:
{
  "title": "<short title above the visualization, 3-6 words>",
  "interactionHint": "<1 line telling the student what to do, e.g. 'Drag the circles to overlap' or 'Move the slider to see x approach 2'>",
  "html": "<the full self-contained HTML document with <style> and <script>. Must include <!DOCTYPE html> at top. Must define a single root container with id='viz-root'. Must work standalone if served as a file.>"
}

Examples of GOOD visualizations (do not copy verbatim — generate for the actual chapter):
- Sets: two draggable circles forming a Venn diagram, with cardinality formulas updating live as overlap changes
- Trigonometric Functions: a unit circle with a draggable point on the circumference; sin/cos values display as the point moves
- Limits: a function curve with a draggable vertical line; as x approaches the limit value, both the x position and the function value display
- Permutations: a small set of letters; click to choose r letters; all P(n,r) arrangements display
- Matrices: a 2x2 matrix with input fields; apply it to a draggable point on a coordinate plane; show the transformation visually

CRITICAL CONSTRAINTS:
- NO eval, NO new Function(), NO fetch, NO XMLHttpRequest, NO WebSocket, NO localStorage, NO sessionStorage, NO indexedDB, NO cookies, NO postMessage to anything except 'parent.postMessage({type: "ready"}, "*")' on load
- NO innerHTML assignments using user-supplied strings
- NO external script tags, NO external stylesheets, NO external images
- All math should be done in plain JavaScript (Math.* is fine)
- Keep total size under 50KB
- Animations should be smooth (use requestAnimationFrame for ongoing animation; CSS transitions for one-shot)

The visualization must work for a student who knows nothing about the chapter yet. The interaction should reveal the concept, not require knowing it already.`;

  const user = `Generate an interactive visualization for: ${params.chapterLabel}
Class: ${params.classLevel}
Description: ${params.chapterDescription}
Key takeaway: ${params.keyTakeaway}

Output only the JSON object.`;

  return {
    system,
    user,
    promptVersion: process.env.PROMPT_VERSION_LESSON || "lesson-v1.0",
  };
}
