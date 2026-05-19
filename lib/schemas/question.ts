import { z } from "zod";

export const QuestionGenerationOutputSchema = z.object({
  question_latex: z.string(),
  expected_solution_steps: z.array(z.string()).min(1),
  difficulty_actual: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  in_syllabus: z.boolean(),
  syllabus_reasoning: z.string(),
});

export type QuestionGenerationOutput = z.infer<
  typeof QuestionGenerationOutputSchema
>;
