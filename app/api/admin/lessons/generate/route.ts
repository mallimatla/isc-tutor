import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyRequest, assertAdmin, UnauthorizedError } from "@/lib/verify-token";
import { generateChapterLesson } from "@/lib/generate-chapter-lesson";

export const maxDuration = 300;

const RequestBodySchema = z.object({
  chapterId: z.string().min(1),
  classLevel: z.enum(["11", "12"]),
  force: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequest(req);
    assertAdmin(user);

    const body = await req.json();
    const parsed = RequestBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { chapterId, classLevel, force } = parsed.data;
    const result = await generateChapterLesson(chapterId, classLevel, { force });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json(
      {
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
        lesson: null,
        durationMs: 0,
      },
      { status: 500 }
    );
  }
}
