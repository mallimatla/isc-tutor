# Demo Video Script — ISC Tutor

For the Build at Damco Challenge, Engineers track. Submission walk-through, target length ~13 minutes structured against Damco's published rubric.

Written in first person — this is the script I'm reading to camera.

---

## 1. Problem (2–3 minutes)

**Goal of this section:** make the evaluator believe the problem is real, specific, and worth solving.

- Hi, I'm Nag. This is ISC Tutor, my submission for the Build at Damco Challenge, Engineers track.
- I built it primarily for one user: my son. He's in ISC Class 11, Science stream, in Bengaluru. He's the live test environment for this product — he uses it on actual school nights.
- The Indian School Certificate maths syllabus across Class 11 and 12 is 29 chapters, hundreds of hours of self-study. Most ISC Science-stream students rely on private coaching at ₹60K – ₹1.5 lakh per subject per year. For a student doing Maths + Physics + Chemistry + Computer Science, that's ₹4–6 lakh per year on coaching alone. The cost is real, but it's not what made me build this.
- What made me build this is a specific scene: 10 PM the night before a test, my son is stuck on one step inside one problem, and there is *nobody available* to help him through *that step*. Not the topic — the step. Coaching's the next day. We're not. ChatGPT just hands him the answer in 200 words, which is the opposite of what a learning student needs. BYJU's plays him a 20-minute video, which doesn't know where he is. R.D. Sharma's solutions skip exactly the algebra he's stuck on.
- And, honestly, even as a Director of Engineering with a CS degree, I cannot fluently solve his harder trigonometry problems on demand at 10 PM. Most parents — even technical ones — can't. So I'm not "the tutor"; I'm the engineer who can build "a tutor" that's available at 10 PM.
- What that tutor needs to do — what *good human* tutors do — is **diagnose where the student's reasoning broke**, not just grade the final answer. So that's the product I built: an AI Socratic tutor for ISC maths that doesn't reveal solutions, it asks targeted questions until the student finds their own mistake.

**On screen during this section:** the textbook on the desk, my son working in the background, the home page of `isc-tutor.vercel.app`.

---

## 2. System Design (5–6 minutes)

**Goal of this section:** show I made deliberate engineering judgments, not just glue.

I'll walk through the architecture in three layers: **runtime reasoning**, **static content**, and **the seed pipelines** that bridge them.

### Runtime layer — what *must* happen per-student, per-request

- `/api/socratic` is the heart of the product. It's a streaming Server-Sent-Events endpoint that calls Claude Sonnet 4 with a five-turn budget. Each turn classifies the student's input against a chapter-level **sub-skill taxonomy** (sourced from `data/isc-chapter-syllabus.json`) and emits a structured `{ decision, tutorMessage, isFinal, subSkillsStruggled }` payload. The decision can be ASK (keep diagnosing), AFFIRM_AND_REVEAL (you're nearly there), or REVEAL (we've hit the turn budget, here's the full solution).
- `/api/question` decides the next question. Adaptive difficulty (`lib/difficulty.ts`) maintains a 5-question rolling window per user with weighted correctness (correct = 1.0, partial = 0.5, incorrect = 0.0); on a full window with ≥ 0.8 rate it bumps the difficulty tier up (board → JEE Main → JEE Advanced); ≤ 0.4 bumps it down.
- `/api/evaluate` and `/api/greeting` do the same per-student work — evaluate one student's free-text answer, greet one student based on their session history.
- Every Claude call is funneled through `lib/anthropic.ts`, which retries with schema validation, strips markdown fences via `safeParseClaudeJson()`, and surfaces typed errors (`ClaudeRateLimitError`, `ClaudeMalformedOutputError`, `ClaudeTimeoutError`) so each route can decide its own retry/backoff policy.

### Static content layer — what's identical for every student

- The 29 illustrated chapter lessons (`isctutor_chapter_lessons`) and the verified question bank (`isctutor_question_bank`) are **not generated at request time**. They depend on no per-student state — the lesson for "Trigonometric Functions" is the same illustrated page for every student.
- So they're generated **once, locally, on my laptop**, written directly to Firestore via the Firebase Admin SDK, and read back at request time. The runtime routes that serve them do a single Firestore read with `maxDuration = 30`. They never call an LLM.
- That separation is the most consequential architectural decision in the project, and I'll explain why in the next section.

### Seed pipelines — bridging the two

- `npm run seed:lessons` (`scripts/seed-lessons.mjs`) walks every chapter, generates a narrative + 2–4 pure-SVG diagrams via Claude, optionally generates a DALL·E hero image via OpenAI, sanitises the SVGs (strips `<script>`, `<foreignObject>`, `on*` handlers, `javascript:` URLs), and writes a `lesson-v3.0` document.
- `npm run seed:questions` (`scripts/seed-questions.mjs`) does something a bit unusual: it generates a practice question with OpenAI gpt-4o, then makes a **second, independent** OpenAI call that solves the same question from scratch — with no access to the proposed answer or the solution. A type-aware comparator (single-letter match for MCQ, set equality for multi-correct, numeric tolerance for numerical) decides agreement. Only verified questions are written. Disagreements are discarded.
- Both scripts are resumable, support `--only=<chapterId>` / `--force` / `--list`, and never overwrite verified content unless you ask them to.

### Other design calls worth naming

- **Pure SVG over sandboxed HTML for diagrams.** I tried `<iframe sandbox="allow-scripts">` rendering AI-authored HTML earlier in the build — it broke constantly because of CSP / sanitiser drift. Replacing it with a constrained SVG primitive vocabulary (rect, circle, line, path, text, gradients, filters; no script, no foreignObject) and rendering via `dangerouslySetInnerHTML` eliminated that whole class of failures. No JavaScript runs in the diagrams.
- **Shared sub-skill taxonomy.** `data/isc-chapter-syllabus.json` is the single source of truth for each chapter's subtopics. The lesson seed reads it, the question seed tags each question against it, and the Socratic engine classifies student turns against it. So "weak on `cardinality-formula`" means the same thing in Sets-the-lesson, Sets-the-questions, and Sets-the-mastery-map. There's exactly one taxonomy.
- **Lazy Firebase Admin init.** `lib/firebase-admin.ts` returns Proxy stubs at build time when env vars aren't present, then real `cert()` instances at runtime. So `next build` doesn't need credentials and Vercel can do a clean preview deploy.
- **Collection prefix everywhere.** Every Firestore collection name is wrapped in `col()` which prepends `FIRESTORE_COLLECTION_PREFIX`. This project shares a Firebase project with another product of mine; the prefix is how they don't step on each other.

**On screen during this section:** I switch between the live app and the codebase in VS Code — `lib/anthropic.ts`, `lib/firebase-admin.ts`, `scripts/seed-questions.mjs`, `app/api/socratic/route.ts`.

---

## 3. Tradeoffs (3–4 minutes)

**Goal of this section:** prove I held the trades in my head consciously, not by accident.

I'll talk through the four trades I think hardest about.

### Trade 1: Vercel Hobby's 60-second function ceiling vs. multi-layer content

- Earlier in the build I was generating each chapter lesson at request time. Narrative + 2–4 diagrams + a hero image is consistently more than 60 seconds. Vercel killed every request. Students saw a 504 instead of the lesson.
- The obvious option was "pay for Vercel Pro." I didn't want a $20/month dependency on a personal side-project, and Pro just moves the ceiling without fixing the fundamental shape of the problem: the *same lesson* was being LLM-generated thousands of times for no per-user reason.
- So I moved generation out of the request path entirely. Seed pipelines run on my laptop. The runtime route does a single Firestore read. A 60-second ceiling stops being a constraint because no LLM call sits inside the request anymore.
- The cost is that adding a new chapter requires me to run a script locally — there's no in-app "regenerate" button, just an admin inventory page. I think that's the right cost. The student experience is what matters; the admin experience is mine to absorb.

### Trade 2: Independent re-solve verification vs. just trusting the model

- Question banks generated by a single LLM call have a known failure mode: the model writes a question, writes a wrong key, writes a solution consistent with the wrong key. You'd never catch it from inspecting one output, because all three pieces lie together.
- The fix is to verify the answer with a **separate** call that has no access to the proposed key. Same model, fresh context. Then a type-aware comparator decides agreement.
- The cost is roughly 2× tokens, and you discard some good questions when the verifier itself is wrong. I accept that cost: the alternative is shipping wrong answers to a student, which destroys trust faster than any other failure mode I can think of.
- I'd add a third pass (or a human-review queue for disagreements) before I'd call this "production grade." But for v1 it's the right shape.

### Trade 3: One opinionated taxonomy vs. flexibility

- I considered letting the lesson author and the question author tag with free-form sub-skill strings, with a deduplication step later. That's the modular thing.
- I chose to constrain both authors to the same `data/isc-chapter-syllabus.json` whitelist. The lesson seed reads it, the question seed tags against it, the Socratic engine classifies against it. The mastery map renders against it.
- The cost is that adding a new sub-skill is now a 3-place coordinated change: edit the JSON, regenerate lessons, regenerate questions. That's deliberate. A diagnostic tutor that says "you're weak on Sets" is useless. One that says "you're weak on `cardinality-formula`" is actionable — but only if the same label means the same thing everywhere in the system. The constraint is what makes the data usable.

### Trade 4: Build for one student vs. building for many

- The temptation was to build a multi-tenant ISC tutor and add class-mode, parent dashboards, leaderboards, streak counters, payments. The classic side-project trap.
- I deliberately built for exactly one student. No class mode, no parent dashboard, no streaks, no payments. The mastery map is the *only* progress UI.
- This is the trade I'm proudest of. A product for one real user beats a product for a hypothetical TAM every time. And it kept the build inside one week.

**On screen during this section:** the `PRD.md` "Decisions" section, the Firestore console showing the bank vs. lesson collections, and `lib/anthropic.ts` (the retry / safe-parse pattern).

---

## 4. Failure Modes (2 minutes)

**Goal of this section:** demonstrate I know exactly where this thing breaks, and that I'm not hiding it.

- **Practice still falls back to runtime generation when the bank is exhausted.** The fallback is the *original* per-request Claude generation. At a chapter where the seed hasn't filled difficulty 5 yet, a student can wait ~20 seconds for a question. The path is correct; the bank just isn't complete. I'm running `seed:questions` to fill the gaps as we go.
- **OpenAI hero images are currently disabled** in production. The OpenAI project key tied to my Firebase project has billing issues I haven't resolved, so I run `seed:lessons --no-image`. The lesson banner falls back to a chapter-themed CSS gradient + decorative blur shapes. It looks fine but it isn't what the design intended.
- **Interactive widgets exist for about 11 of 29 chapters.** The other 18 chapters render the static SVG diagrams only. The widget framework is in `components/learn-visualizations/`; adding more is mechanical labour I haven't done.
- **The evaluator occasionally false-negatives on a creative method.** A mathematically valid alternate solution path can be marked incorrect on the first pass. The Socratic engine partly compensates — the student gets multiple turns to defend their reasoning — but it doesn't eliminate the problem. There's a flag button that logs every disputed evaluation to Firestore for review.
- **`ANTHROPIC_MODEL` defaults to a deprecated model string** (`claude-sonnet-4-20250514`). It still works at the time of submission; it will rotate. Every prompt-version + model is recorded in Firestore alongside the content it generated, which means a rotation is fixable without losing provenance.
- **There are no automated tests.** I have a `tests/` folder planned but empty. The first tests I'd write: `lib/difficulty.ts` window updates, `safeParseClaudeJson()` against fenced/un-fenced/garbage inputs, the bank-vs-runtime branching in `/api/question`.
- **Streaming JSON parsing uses regex.** The Socratic SSE delta path extracts `tutor_message` from partial JSON with a regex. It works; a proper incremental parser would be more robust.
- **No mock-exam timer, no parent dashboard, no class mode, no Computer Science track, no mobile-app wrapper, no handwritten input.** All deliberately out of scope for v1 — listed honestly in the README and the PRD so an evaluator can verify what isn't there.
- **`/api/debug-firebase` exists** for operational diagnostics. It's gated behind a `DEBUG_ENDPOINT_KEY` env var + matching `?key=` query parameter; without both it returns 404. Not publicly callable.

That's the submission. Thank you.

**On screen during this section:** the README "What's broken" list, then the live app at full-screen for the closing beat.

---

## Production checklist before recording

- [ ] Sign in works end-to-end on a clean browser profile.
- [ ] Sets > Learn renders all narrative + diagrams within ~2 s.
- [ ] Sets > Practice serves a question from the bank in < 1 s (check the `metadata.source: "bank"` in DevTools).
- [ ] Submit a deliberately wrong answer — Socratic engine streams a diagnostic question within 3–4 seconds, not the solution.
- [ ] Mastery map shows at least one "learning", one "practicing", one "mastered" tile.
- [ ] `/api/debug-firebase?key=<wrong>` returns 404. With the correct key it returns the 6-test JSON.
