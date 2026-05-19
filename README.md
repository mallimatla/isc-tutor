# ISC Tutor

> *"My son just started ISC 11th, Science stream. ISC Mathematics is dense — calculus, vectors, probability, linear programming — and good coaching in India runs ₹60K–1.5L per subject per year. I'm a daily Claude Code user. I built him an AI tutor that he uses every day. This is what I shipped in a week."*

An LLM-backed practice tutor for **ISC Class 11 & 12 Mathematics** (Computer Science roadmapped for Phase 2). Generates adaptive practice questions on any chapter from the ISC syllabus, evaluates free-text answers, and walks the student through step-by-step solutions with LaTeX-rendered math.

Built solo in 6 days using Claude Code as the primary development environment.

**Live:** [isc-tutor.vercel.app](https://isc-tutor.vercel.app) *(replace with actual URL after deploy)*
**Source:** [github.com/mallimatla/isc-tutor](https://github.com/mallimatla/isc-tutor)

---

## The Problem

ISC (Indian School Certificate) Class 11 & 12 is widely considered the toughest higher-secondary board in India. The Mathematics syllabus alone spans:

- **Class 11:** Sets, Relations, Functions, Trigonometry, Complex Numbers, Inequalities, Permutations & Combinations, Binomial Theorem, Sequences & Series, Coordinate Geometry, Conic Sections, Limits & Derivatives, Probability, Statistics
- **Class 12:** Inverse Trigonometry, Matrices, Determinants, Continuity & Differentiability, Applications of Derivatives, Integrals, Differential Equations, Vectors, 3D Geometry, Linear Programming, Probability

Most students rely on private coaching (₹60K–1.5L per subject per year in metros) because:
1. School pace is too fast or too slow for any one student
2. Practice problem sets are static — same questions for every kid, regardless of where they're strong or weak
3. When a student gets a problem wrong, there's nobody at home at 10 PM to walk them through it

I have one of those students at home. So I built a tutor for him.

## What It Does

1. **Personalized greeting.** The tutor greets you by name, references your recent sessions and weak spots, and recommends what to work on next.
2. **Mastery map.** A visual grid showing your progress across all 29 ISC Math chapters — mastered, practicing, or untouched — with accuracy stats per chapter.
3. **Pick a topic.** Class 11 or 12 → chapter from the ISC syllabus → topic.
4. **Get a real-world practice question** at your current difficulty level, grounded in contexts a 16-year-old finds engaging (gaming, social media, sports, money), with all math properly rendered in LaTeX.
5. **Type your answer** (free-text — no multiple choice).
6. **Socratic dialogue.** Instead of a simple right/wrong verdict, the tutor diagnoses your reasoning and asks targeted follow-up questions (up to 5 turns) to help you find your own mistakes. Tutor personality adapts by difficulty level.
7. **Streaming responses.** Tutor messages appear token-by-token in real-time — no dead-air waits.
8. **Full solution + reflection.** After the dialogue concludes, see the step-by-step canonical solution and a reflection question about the key insight.
9. **Difficulty adapts.** A rolling 5-question correctness window bumps difficulty up at ≥80% and down at ≤40%.

## How It's Built

| Layer | Tech | Why |
|---|---|---|
| Frontend | Next.js 15 + React 19 + Tailwind | Fast iteration, great DX, deploys to Vercel in seconds |
| Math rendering | KaTeX | LaTeX is non-negotiable for ISC Maths — no LaTeX, no tutor |
| LLM | Claude (Anthropic API) — Sonnet 4 | Best-in-class reasoning on math; tool-use ready for Phase 2 |
| State | Firebase (Firestore, anonymous auth) | Session state, history, adaptive-difficulty signals |
| Deployment | Vercel | One-command deploys, env-var secrets, zero-ops |

See [DESIGN.md](./DESIGN.md) for architecture, data flow, tradeoffs, and failure modes.

## Why I Built It This Way (Tradeoffs)

- **No user accounts (v1).** Anonymous Firebase auth keeps the friction at zero. My son is the user; the URL is the login. A real product would need accounts, but for v1 it's deliberate cut.
- **Curated chapter list, not full textbook ingestion.** I pasted the ISC syllabus structure into a JSON file rather than parsing textbooks. PDFs of ISC textbooks are not freely distributable, and the LLM already knows the syllabus topics. The student picks topic → LLM generates question.
- **Free-text answers, no multiple choice.** ISC math is about working through problems, not picking from four options. Free-text evaluation is harder for the LLM but worth it.
- **Topic-agnostic LLM-generated questions, not a curated question bank.** Trades static quality control for infinite variety. The "What's Broken" section lists when this breaks.
- **No code execution for CS (yet).** Computer Science is Phase 2. Sandboxing Java in the browser is a much bigger engineering problem and didn't belong in a week-1 build.

## What's Broken / What I'd Do With More Time

Honest list. None of these are deal-breakers for my son's use, but they'd matter for anyone else.

- **Hallucinations on edge-case topics.** The LLM occasionally generates questions slightly off-syllabus (e.g., topic from JEE Advanced when asked for ISC). I check the chapter mapping but don't enforce it strictly. Fix: add an ISC syllabus-grounding step in the prompt with explicit "in-syllabus / out-of-syllabus" check.
- **No answer-verification ground truth.** I rely on the LLM to evaluate the student's answer. For most ISC questions this works, but a complex multi-step calculus problem can occasionally be marked wrong when the student took an equivalent path. Fix: dual-evaluator approach + manual review queue for low-confidence verdicts.
- **No persistent learning history.** Difficulty resets per session. Real adaptive learning needs cross-session memory of which topics the student struggles with. Fix: weekly summaries written to Firebase, surfaced as "you've been weak on Integrals this week — let's spend 20 minutes there."
- **Computer Science not yet shipped.** Roadmapped as Phase 2 — needs Java code execution sandbox (likely Piston API or similar), execution-trace explanation, and SQL question handling. Estimated 1 more week.
- **No mobile app, no offline mode.** Web only. My son's school has wifi. A real product would need a Capacitor wrapper.
- **No parent dashboard.** I told my son I'd see what he's been studying. I haven't. A weekly digest email to parents is a real feature for a real product.
- **No content moderation.** If you ask the tutor for something off-topic, it'll mostly redirect, but I haven't tested adversarial inputs.

## Running Locally

```bash
git clone https://github.com/mallimatla/isc-tutor
cd isc-tutor
npm install
cp .env.example .env.local  # fill in CLAUDE_API_KEY and FIREBASE_* keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Why This Project

This was my submission for the [Build at Damco Challenge](https://www.damcogroup.com/build-at-damco) — Engineers track. The brief was: pick a real problem you've personally experienced, build a solution, ship it, walk us through your thinking. ISC math tutoring isn't a fake problem I made up for an interview. My son still uses it. The repo is the receipt.

## Acknowledgments

Built primarily with **Claude Code** as the development environment. Claude is also the LLM the tutor runs on. This is a deliberate design choice — for an AI-engineering submission, using AI to build with AI surfaces both the engineering judgment and the product mindset.

---

*— Nag (mallimatla@gmail.com)*
