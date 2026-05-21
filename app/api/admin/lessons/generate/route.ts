import { NextResponse } from "next/server";

// Lesson generation moved to scripts/seed-lessons.mjs (run locally).
// This endpoint stays as a 410 Gone so any old admin UI calls fail loudly.
export async function POST() {
  return NextResponse.json(
    {
      error: "GONE",
      message:
        "Lessons are now generated locally via `npm run seed:lessons`. This endpoint no longer runs generation.",
    },
    { status: 410 }
  );
}
