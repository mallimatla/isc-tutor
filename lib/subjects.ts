/**
 * Subject registry. The app was originally Mathematics-only; every prompt and
 * several routes hardcoded "ISC Mathematics". This centralises what differs by
 * subject so prompts can stay generic and new subjects are a data change.
 *
 * `examSubject` is the descriptor used in prompts ("ISC Mathematics"). The
 * `*Guidance` blocks are injected into the corresponding prompt to adapt
 * pedagogy (Physics needs units, dimensions, diagrams, derivations; Maths
 * needs rigour and multiple valid solution paths).
 */

export type SubjectId = "mathematics" | "physics";

export interface SubjectMeta {
  id: SubjectId;
  label: string;
  examSubject: string;
  /** Guidance for generating practice questions in this subject. */
  questionGuidance: string;
  /** Guidance for grading a free-text answer in this subject. */
  evalGuidance: string;
  /** Guidance for the Socratic tutor and the "Ask a doubt" tutor. */
  tutorGuidance: string;
  /** Real-world context hints for hooks / difficulty 1-3 questions. */
  contexts: string;
}

const SUBJECTS: Record<SubjectId, SubjectMeta> = {
  mathematics: {
    id: "mathematics",
    label: "Mathematics",
    examSubject: "ISC Mathematics",
    questionGuidance:
      "Every question must be mathematically correct and unambiguous. All maths must use LaTeX ($...$ inline, $$...$$ display). Numbers should stay clean (integers or small fractions) where possible.",
    evalGuidance:
      "ISC mathematics often has multiple valid solution paths. Do NOT mark the student wrong solely because their method differs from the expected one — check whether the final answer is correct AND the method is valid.",
    tutorGuidance:
      "There are often several valid methods; if the student's approach is mathematically sound, treat it as correct even if it differs from the expected solution.",
    contexts:
      "Instagram/YouTube stats, IPL/FIFA/gaming numbers, JEE rank distributions, UPI/EMI money problems, Spotify/Netflix stats.",
  },
  physics: {
    id: "physics",
    label: "Physics",
    examSubject: "ISC Physics",
    questionGuidance:
      "Physics is quantitative and conceptual. Numerical questions MUST specify units for every given quantity and expect the answer with correct SI units and sensible significant figures. Respect sign conventions, vector directions and standard constants (g = 9.8 m/s^2 unless stated). Use LaTeX for all equations and symbols ($...$ inline, $$...$$ display). A question may be a numerical, a short derivation, a conceptual 'explain/why', or a diagram-based reasoning question. Keep numbers realistic for the phenomenon.",
    evalGuidance:
      "Judge the physics, not just the number: the final answer must be correct in BOTH magnitude and unit, and the reasoning (correct law, correct free-body/vector setup, correct sign convention) must be sound. A right number with wrong or missing units, or a lucky answer from wrong physics, is at best 'partial'. Alternative valid methods (energy vs kinematics, for example) are fine. Allow small rounding differences in the last significant figure.",
    tutorGuidance:
      "Anchor explanations in the physical picture first (what is happening, which law applies, draw/describe the free-body or ray/circuit diagram), then the equation, then the numbers with units. Always carry units through the working and sanity-check the final answer's magnitude and direction.",
    contexts:
      "EV acceleration and braking, rockets/ISRO launches, phone-battery charging, cricket-ball swing and projectile, roller-coasters, earbuds/audio and resonance, solar panels, MRI/electromagnets, fibre-optic internet.",
  },
};

const DEFAULT_SUBJECT: SubjectId = "mathematics";

export function isSubjectId(value: string): value is SubjectId {
  return value === "mathematics" || value === "physics";
}

/** Resolve a subject by id, falling back to Mathematics for anything unknown. */
export function getSubject(subjectId: string | undefined | null): SubjectMeta {
  if (subjectId && isSubjectId(subjectId)) return SUBJECTS[subjectId];
  return SUBJECTS[DEFAULT_SUBJECT];
}

export function listSubjects(): SubjectMeta[] {
  return Object.values(SUBJECTS);
}
