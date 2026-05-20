import { z } from "zod";

export const ChapterNarrativeSchema = z.object({
  syllabusCoverage: z.array(z.string()).min(3),
  hook: z.string(),
  narrativeBeats: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
        diagramHint: z.string().nullable(),
      })
    )
    .min(4),
  commonMistakes: z
    .array(
      z.object({
        mistake: z.string(),
        whyItHappens: z.string(),
        howToAvoid: z.string(),
      })
    )
    .min(2),
  quickReferenceCard: z.array(z.string()).min(2),
  keyTakeaway: z.string(),
});

export type ChapterNarrative = z.infer<typeof ChapterNarrativeSchema>;

export const ChapterVisualizationSchema = z.object({
  title: z.string(),
  interactionHint: z.string(),
  html: z.string(),
});

export type ChapterVisualization = z.infer<typeof ChapterVisualizationSchema>;

export const ChapterLessonSchema = z.object({
  lessonId: z.string(),
  chapterId: z.string(),
  classLevel: z.enum(["11", "12"]),
  promptVersion: z.string(),
  narrative: ChapterNarrativeSchema,
  visualization: z.object({
    title: z.string(),
    interactionHint: z.string(),
    html: z.string(),
    sanitizationWarnings: z.array(z.string()),
  }),
  generatedAt: z.unknown(),
});

export type ChapterLesson = z.infer<typeof ChapterLessonSchema>;
