# Demo Video Script — ISC Tutor

Target length: 8-9 minutes.

---

## Section 1: Problem (2 min)

**What to say:**
- Hi, I'm Nag. I'm submitting ISC Tutor for the Build at Damco Challenge.
- I built this for my son. He's in ISC Class 11, Science stream. ISC Math is one of the hardest secondary-school curricula on the planet.
- The current options for an Indian Science-stream student are: ₹60K-1.5L per subject per year of coaching, ChatGPT (which lacks ISC syllabus grounding and forgets him every session), BYJU's-style apps (passive, video-based, no real diagnosis), or just R.D. Sharma at the desk (lonely, no feedback).
- The real problem isn't access to questions. The problem is at 10 PM, when he's stuck on a specific step in a specific problem, there's nobody to walk him through *that step*. Not the whole topic. The specific step.
- That's what good tutors do. I built that.

**What to show:**
- A textbook on the desk
- The home page of the app

---

## Section 2: Live Demo (2-3 min)

**What to show (in this order, narrate as you go):**
- Sign in with Google — Firebase Auth, isolated per user
- Land on home page with personalized greeting
- Show the mastery map — explain green/amber/grey
- Click into a chapter (Sets)
- A real question loads — point out it's grounded in real-world context (Instagram/FIFA/etc), not textbook fluff
- Deliberately type a WRONG answer with shaky reasoning
- **The key moment:** tutor responds Socratically, not with verdict — asks "walk me through your step 2" or similar
- Reply to that prompt — another follow-up — eventually arrive at the right answer
- Then on a harder question, show "I don't know, show me the answer" — full solution + reflection question
- Click the speak button on the solution — English TTS reads it aloud
- Return to home — mastery map has updated

---

## Section 3: How Built (3-4 min)

**What to say + show:**
- Stack: Next.js 16, TypeScript, Tailwind, Claude Sonnet 4, Firebase Firestore, Vercel
- Show git log (`git log --oneline | head -30`) — point out the atomic commit history, PRD-first approach
- Walk through key architectural decisions:
  - Why Google Sign-In not anonymous — production patterns, cross-device sync
  - Prefixed Firestore collections (`isctutor_*`) inside shared Firebase project — operational isolation
  - Lazy init for Firebase Admin — handles Next.js build-time data collection elegantly
  - The three-mode Socratic engine: ASK / AFFIRM_AND_REVEAL / REVEAL
  - Streaming via Server-Sent Events
  - Adaptive difficulty: rolling 5-question window with weighted verdict scoring
- Show one of the prompt files (lib/prompts/socratic-turn.ts) — emphasize: prompts are versioned, schemas validate output, retries on parse failure
- Show the `/api/debug-firebase` endpoint — point out: I built observable systems, not just code that "works on my machine"
- Mention Claude Code CLI was the primary dev environment throughout

---

## Section 4: What's broken / Future (1-2 min)

**What to say:**
- Read the "What's broken" list from README — emphasize honest scoping
- Computer Science track is the biggest gap — would need a Java code-execution sandbox + SQL evaluator. Roadmapped.
- Hallucinations on edge cases — mitigated by Socratic engine giving room to defend reasoning, plus the flag system for human review
- Phase 2 priorities: CS track, parent dashboard, handwritten math input via Claude vision, week-over-week trends
- Close: "If you want to talk through architecture or trade-offs in the next round, I have a lot more to say about what worked and what didn't. Thanks for the opportunity."

---

## Recording notes

- Screen resolution: 1920x1080, browser at ~80% width (show desktop context)
- Use Chrome (best KaTeX rendering + speech synthesis)
- Have a question pre-loaded if the first generation is slow (cut and splice)
- Face cam: optional but recommended (bottom-right corner, small)
- Audio: clear mic, no background music
- Export: 1080p MP4, upload to YouTube as unlisted
