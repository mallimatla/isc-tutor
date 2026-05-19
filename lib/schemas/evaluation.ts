import { z } from "zod";

export const VerdictEnum = z.enum(["correct", "partial", "incorrect"]);

export const AnswerEvaluationOutputSchema = z.object({
  verdict: VerdictEnum,
  where_went_wrong: z.string().nullable(),
  full_solution_steps: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1),
});

export type AnswerEvaluationOutput = z.infer<
  typeof AnswerEvaluationOutputSchema
>;
