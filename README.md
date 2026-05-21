# ISC Tutor

> AI math tutor that thinks like an expert teacher — diagnoses where reasoning breaks instead of just grading. Built for my son, currently in ISC Class 11 Science.

## Try it

**Live URL:** https://isc-tutor.vercel.app
Sign in with any Google account.

## What's built

- **Local lesson seed pipeline** — `npm run seed:lessons` generates all 29 chapter lessons from a developer machine and writes them to Firestore. The Vercel app reads them back; it never generates. This permanently sidesteps the Hobby 60s function-duration limit.
- **Three content layers per lesson** — DALL·E hero illustration (decorative background) + 2–4 Claude-authored pure-SVG diagrams interleaved into the narrative + a 9–11-beat tutor explanation with common-mistakes and quick-reference cards. Diagrams render inline via `dangerouslySetInnerHTML` of sanitized SVG strings, eliminating the iframe sandbox failures that plagued earlier phases.
- **Beautiful chapter Learn mode** — each chapter has a themed hero banner (with DALL·E hero image when seeded), hand-crafted interactive React widgets for 6 key chapters (draggable Venn diagrams, unit circle, limits explorer, matrix transformer, probability simulator) rendered above the static SVG diagrams, narrative beats with glass-card design, common mistakes, and shareable summary cards (PNG export via html2canvas)
- **Socratic Diagnosis Engine** — multi-turn dialogue (up to 5 turns) where the tutor asks targeted questions to find exactly where the student's reasoning breaks, instead of revealing solutions immediately
- **Adaptive difficulty** — rolling 5-question window adjusts question difficulty up/down based on recent performance
- **Concept tracking** — every wrong answer tagged with specific sub-skills (e.g., "complement-notation", "cardinality-formula") for weakness surfacing
- **Real-world question grounding** — easy-medium questions framed in contexts a 16-year-old cares about (Instagram, FIFA, Spotify Wrapped, JEE) instead of "100 students" textbook scenarios. Board-exam-level questions stay formal.
- **Personalized greeting** — Claude reads session history and recommends the next chapter based on weaknesses
- **Mastery map** — visual grid of progress per chapter across Class 11 and 12
- **Streaming responses** — tutor messages stream word-by-word via Server-Sent Events; skeleton loaders before content arrives
- **English TTS** — browser-native speech synthesis (en-IN preferred) reads tutor messages aloud, with LaTeX-to-verbal translation
- **Google Sign-In auth** — Firebase Auth with per-user data isolation via prefixed Firestore collections (`isctutor_*`) inside a shared Firebase project

## Architecture

Stack: Next.js 16 + TypeScript + Tailwind v4 + Claude Sonnet 4 + Firebase (Auth + Firestore) + Vercel + KaTeX. See [PRD.md](./PRD.md) for full system design (24 sections), [DESIGN.md](./DESIGN.md) for architecture summary.

Key design decisions: lazy-init for Firebase Admin (defers credential parsing past `next build`); collection prefix (`FIRESTORE_COLLECTION_PREFIX`) for safe coexistence with other apps inside the shared Firebase project; SSE-based streaming for the Socratic dialogue route; version-controlled LLM prompts in `lib/prompts/` (qgen-v1.3, eval-v1.1, socratic-v1.0, greeting-v1.0).

A debug endpoint exists at `/api/debug-firebase` for operational diagnostics — requires `DEBUG_ENDPOINT_KEY` env var to be set and `?key=` query param to access.

## What's broken / what I'd do with more time

This is a solo build. Honest limitations:

- **Computer Science track not built** — code-execution sandboxing (Java) and SQL evaluation are separate engineering problems. Roadmapped as Phase 2.
- **Occasional false negatives on creative methods** — the evaluator sometimes marks a mathematically-valid alternate method as incorrect on the first pass. Mitigated by the Socratic engine giving the student room to defend their reasoning, but not eliminated.
- **No persistent week-over-week trends** — the mastery map shows current state but doesn't surface "you've improved 30% on Sets this week"
- **No parent dashboard** — kept out of scope intentionally (student privacy + scope discipline)
- **No handwritten math input** — would unlock R.D. Sharma textbook scanning via Claude vision. Phase 4 roadmap.
- **No mock board paper mode** — timed 3-hour exam simulation. Easy to add.
- **No mobile app wrapper** — web-responsive only. PWA-installable but not native.
- **Hallucinations on edge-case topics** — the in_syllabus prompt check catches most off-topic generations but isn't 100% reliable. The flag system lets users surface these for review.
- **Interactive React widgets exist for 6 of 29 chapters** (Sets, Functions, Trigonometric Functions, Limits, Probability, Matrices); the rest rely on static SVG diagrams generated at seed time.
- **Shareable card uses html2canvas** which doesn't perfectly render all CSS (gradients sometimes look off in the PNG export)
- **Seed script must run locally (by design)** — no in-app generation. Chapters that haven't been seeded yet render a friendly "lesson is on its way" card with a button to skip straight to Practice; they don't error.
- **Streaming JSON parsing uses regex** for the tutor_message field rather than a proper incremental JSON parser. Works in practice but could be more robust.
- **English TTS uses browser speech synthesis** — sounds robotic. A paid TTS API (ElevenLabs, OpenAI) would sound much better but wasn't worth the cost or latency for v1.
- **Single-user-per-session** — no shared/collaborative sessions or class-mode.

## Built with Claude Code

Every commit in this repo was authored in tandem with Claude (via Claude Code CLI). The commit history shows the human + AI authorship pattern explicitly. I treated Claude as a senior collaborator, not autocomplete. The decisions that mattered — what to build, what NOT to build, when to scope down vs. ship — those were mine. The implementation velocity came from Claude.

## Local development

```bash
git clone https://github.com/mallimatla/isc-tutor
cd isc-tutor
npm install
cp .env.example .env.local  # fill in API keys and Firebase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seeding chapter lessons

Lessons are generated **locally** via a one-off seed script, then written to Firestore — the Vercel app reads but never generates them.

```bash
# .env.local needs:
#   ANTHROPIC_API_KEY
#   OPENAI_API_KEY                (for hero images; omit with --no-image)
#   FIREBASE_PROJECT_ID
#   FIREBASE_CLIENT_EMAIL
#   FIREBASE_PRIVATE_KEY
#   FIRESTORE_COLLECTION_PREFIX   (e.g. "isctutor_")

npm run seed:lessons                          # seed every missing chapter (lesson-v3.0)
npm run seed:lessons -- --only=sets           # seed one chapter
npm run seed:lessons -- --force               # regenerate everything
npm run seed:lessons -- --no-image            # skip the DALL·E hero
```

The script is resumable: chapters already on `lesson-v3.0` are skipped unless `--force` is passed. Failures don't abort the run; a summary at the end lists any chapter to re-run. `/admin` is a read-only inventory of what's currently in Firestore.

## Submission notes

Built for the Build at Damco Challenge, May 2026. Track: Engineers.

---

*— Nag (mallimatla@gmail.com)*
