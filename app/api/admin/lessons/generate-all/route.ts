import { NextResponse } from "next/server";

// Bulk lesson generation moved to scripts/seed-lessons.mjs (run locally).
export async function POST() {
  return NextResponse.json(
    {
      error: "GONE",
      message:
        "Bulk generation is now `npm run seed:lessons` on a developer machine. Vercel runtime no longer generates lessons.",
    },
    { status: 410 }
  );
}
