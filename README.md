# ISC Tutor

> A Socratic AI maths tutor for ISC Class 11 & 12 students. It diagnoses where a student's reasoning breaks down instead of just marking the answer right or wrong. Built solo for my son, who is currently in ISC Class 11 Science.

## Try it

**Live URL:** https://isc-tutor.vercel.app
Sign in with any Google account — the app uses Firebase anonymous-style auth scoped to your Google identity, no separate password.

## The problem

ISC Class 11 and 12 Maths students don't have a patient tutor available at 10 PM when they're stuck on a problem the night before the test. Their parents — even technical ones — usually can't help at that level: I'm a Director of Engineering and I cannot fluently solve my son's harder trigonometry problems on demand. The existing apps (Khan Academy, BYJU's, ChatGPT, generic doubt-solving) all hand back an *answer* in seconds, which is precisely what a learning student doesn't need — the student needs to be walked through where their own attempt broke down. That's the gap this product fills.

## What's built

- **Socratic dialogue engine** — `/api/socratic` is a multi-turn SSE-streaming Claude conversation (up to 5 turns) that asks the student targeted diagnostic questions before ever revealing a solution. Each student turn is classified against a chapter-level sub-skill taxonomy, so we know not just "got it wrong" but "got it wrong on the `cardinality-formula` skill in Sets."
- **Adaptive difficulty** — a 5-question rolling window decides whether to push the next question up a tier (board → JEE Main → JEE Advanced) or step it back; the engine lives in `lib/difficulty.ts`, runs server-side, and exposes a difficulty 1–5 to the question pipeline.
- **AI-generated illustrated lessons** — every chapter has a `lesson-v3.0` document in Firestore with a 9–11-beat narrative, common-mistakes card, quick-reference card, key-takeaway, and 2–4 chapter-themed diagrams. Diagrams are pure SVG strings authored by Claude and sanitized at seed time, rendered inline via `dangerouslySetInnerHTML` — no iframe, no JavaScript runs in them.
- **Interactive premium visualizations** — ~11 of 29 chapters have hand-crafted React widgets (draggable Venn diagrams for Sets, unit circle for Trig, eccentricity slider that morphs circle → ellipse → parabola → hyperbola for Conic Sections, Riemann-sum slider for Integrals, parallelogram-area determinant, tangent-line slider for Applications of Derivatives, draggable Argand plane for Complex Numbers, and others). Each uses its chapter theme, runs at 60 fps, and supports mouse + touch.
- **Living mastery map** — per-chapter status (mastered / practicing / learning / not-started), each tile in the chapter's own theme gradient, progress bars filled with the same colour. "Learning" is a lightweight engagement state that fires when a student opens a Learn lesson, layered *on top of* the practice-based mastery so a real practice score is never overwritten by it.
- **Local seed pipelines, runtime stays read-only** — `npm run seed:lessons` and `npm run seed:questions` run on a developer machine and write directly to Firestore via the Admin SDK. The Vercel runtime never generates static content, which permanently sidesteps the Hobby 60-second function-duration limit. Questions also include a two-pass independent re-solve verification: the verifier sees only the question (not the proposed key) and a type-aware comparator (letter / set / numeric tolerance) only writes a question when both agree.
- **Single-accent design system** (`lib/design-tokens.ts`) — indigo as the only "loud" colour, per-chapter gradients reserved for chapter identity, rounded-2xl white cards, motion via a couple of CSS keyframes with a full `prefers-reduced-motion` override.

## Architecture

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + Claude (Sonnet) for reasoning + OpenAI gpt-4o for the question seed + Firebase Auth + Firestore + Vercel. KaTeX renders the maths.

The most important design decision is the split between **static, identical-for-everyone content** and **runtime, per-student reasoning**:

- The Socratic dialogue, the question evaluation, the adaptive difficulty engine, and the personalised greeting all *must* run at request time — they depend on the specific student's session history and the specific turn they just typed.
- Everything else — the 29 illustrated chapter lessons, the chapter-themed pure-SVG diagrams, the verified question bank — is identical for every student. So it's generated **once, locally, on my laptop**, written to Firestore via the Admin SDK, and read back from there. The app routes that fetch this content do a single Firestore read with `maxDuration = 30`. This trade is what makes the Hobby tier viable without sacrificing any of the AI features.

A few other decisions worth calling out:

- **Pure SVG over sandboxed HTML for diagrams.** Earlier phases rendered AI-authored HTML in a sandboxed iframe with a CSP + sanitiser pipeline. It broke constantly. Replacing it with constrained `<svg>...</svg>` strings (a fixed primitive vocabulary, sanitised at seed time, no `<script>` / `<foreignObject>` / `on*` handlers) eliminated that whole class of failures.
- **Shared sub-skill taxonomy.** `data/isc-chapter-syllabus.json` is the single source of truth for each chapter's subtopics. The lesson seed reads it, the question seed tags each question against it, and the Socratic engine classifies student turns against the same list — so "weak on `cardinality-formula`" means the same thing in Sets-the-lesson, Sets-the-questions, and Sets-the-mastery-map.
- **Lazy Firebase Admin init.** `lib/firebase-admin.ts` returns Proxy stubs at build time when env vars aren't present, then real `cert()` instances at runtime — so `next build` doesn't need credentials and Vercel can do a clean preview deploy.
- **Collection prefix everywhere.** `FIRESTORE_COLLECTION_PREFIX` (`isctutor_`) wraps every collection name via `col()`, so this project safely coexists with other apps inside the same Firebase project.

See [PRD.md](./PRD.md) for the full system design, data model, and phased build log; [DESIGN.md](./DESIGN.md) for the shorter architecture summary.

## What's broken / what I'd do next

Honest list:

1. **Practice questions still partly runtime-generated.** When the verified question bank is exhausted at a user's current difficulty for a chapter, the API falls back to Claude question generation at request time — that's ~20 s p95 which is painfully long. Fix: complete the seed by running `npm run seed:questions` over all chapters; the path itself is in place.
2. **OpenAI hero images are currently disabled in production.** The `seed:lessons --no-image` flag is what I'm running, because the OpenAI project key tied to my Firebase project has billing issues I haven't resolved. Hero banners fall back to a CSS gradient + decorative blur shapes, which looks fine but isn't what the lesson document is designed to show.
3. **Interactive React widgets exist for ~11 of 29 chapters.** The other 18 rely entirely on the static SVG diagrams. The widget framework is in `components/learn-visualizations/`; adding more is mechanical but I haven't done them yet.
4. **`ANTHROPIC_MODEL` defaults to a deprecated model string.** `claude-sonnet-4-20250514` works today but will be rotated; the prompt-version log in Firestore captures which model authored which content, which means the rotation is fixable without losing history.
5. **LaTeX rendering gap on some chapters.** The Quick Reference Card on a few chapters uses plain-text formulae where it should use `$...$`. Cosmetic but visible.
6. **No automated tests.** I have a `tests/` folder pencilled in the file structure but never wrote anything. Things I *would* test first: difficulty-window update logic (`lib/difficulty.ts`), `safeParseClaudeJson()` against fenced/un-fenced/garbage inputs, the bank vs runtime branching in `/api/question`.
7. **AI-authored questions are not real past papers.** The verified-on-second-solve bank catches wrong-answer-key bugs but doesn't replace ICSE/ISC/JEE PYQs. For serious JEE prep this should supplement, not substitute, real previous-year papers.
8. **The evaluator occasionally false-negatives on creative methods.** Mitigated by the Socratic engine letting the student defend their reasoning across multiple turns, but not eliminated. The flag system lets students surface these for review.
9. **Streaming JSON parsing uses regex.** The Socratic SSE delta path extracts `tutor_message` with a regex against partial JSON. It works in practice but a proper incremental parser would be more robust.
10. **English TTS uses browser speech synthesis.** Sounds robotic; an ElevenLabs / OpenAI TTS would sound human, but neither was worth the additional latency + cost for v1.
11. **No week-over-week trend view.** The mastery map shows current state; it doesn't show "you went from 40% → 75% on Sets in two weeks", which would be the actual motivational artifact.
12. **No parent dashboard, no class mode, no mock-exam timer.** All deliberately out of scope for v1 — privacy, scope discipline, and the simple fact that they're not why a student stuck at 10 PM opens this app.
13. **No mobile app wrapper.** Web-responsive, PWA-installable, but not Capacitor-packaged.
14. **Computer Science track not built.** Java code-execution sandbox + SQL evaluation are separate engineering problems; roadmapped as Phase 2.

## Built with Claude Code

The entire codebase was built solo, with Claude (via the Claude Code CLI) as engineering + strategy partner — not autocomplete. The judgments that mattered — what to build, what to cut, what tradeoffs to accept, what to call honestly broken — were mine. The implementation velocity came from Claude. Every commit is co-authored with the model and the history shows that pattern explicitly.

---

*Built by Nag Matla (mallimatla@gmail.com) for the Build at Damco Challenge — Engineers track. See [docs/DEMO-VIDEO-SCRIPT.md](./docs/DEMO-VIDEO-SCRIPT.md) for the submission walkthrough.*
