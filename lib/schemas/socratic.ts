import { z } from "zod";

const BaseSocraticFields = {
  tutor_message: z.string(),
  reasoning_diagnosis: z.string(),
  sub_skills_tested: z.array(z.string()).min(1),
  sub_skills_struggled: z.array(z.string()),
  confidence: z.number().min(0).max(1),
};

const AskSchema = z.object({
  decision: z.literal("ASK"),
  ...BaseSocraticFields,
  verdict_so_far: z.enum(["on_track", "partial", "struggling", "correct"]),
  full_solution_steps: z.null(),
  reflection_question: z.null(),
});

const AffirmAndRevealSchema = z.object({
  decision: z.literal("AFFIRM_AND_REVEAL"),
  ...BaseSocraticFields,
  verdict_so_far: z.literal("correct"),
  full_solution_steps: z.array(z.string()).min(1),
  reflection_question: z.string(),
});

const RevealSchema = z.object({
  decision: z.literal("REVEAL"),
  ...BaseSocraticFields,
  verdict_so_far: z.enum(["on_track", "partial", "struggling", "correct"]),
  full_solution_steps: z.array(z.string()).min(1),
  reflection_question: z.string(),
});

export const SocraticTurnOutputSchema = z.discriminatedUnion("decision", [
  AskSchema,
  AffirmAndRevealSchema,
  RevealSchema,
]);

export type SocraticTurnOutput = z.infer<typeof SocraticTurnOutputSchema>;
