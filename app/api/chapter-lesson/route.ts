import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyRequest, UnauthorizedError } from "@/lib/verify-token";
import { generateChapterLesson } from "@/lib/generate-chapter-lesson";

export const maxDuration = 300;

const RequestBodySchema = z.object({
  chapterId: z.string().min(1),
  classLevel: z.enum(["11", "12"]),
});

export async function POST(req: NextRequest) {
  try {
    await verifyRequest(req);

    const body = await req.json();
    const parsed = RequestBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { chapterId, classLevel } = parsed.data;
    const result = await generateChapterLesson(chapterId, classLevel);

    if (result.status === "failed") {
      return NextResponse.json(
        { error: "GENERATION_FAILED", message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.lesson);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error({
      route: "POST /api/chapter-lesson",
      errorName: err instanceof Error ? err.name : "Unknown",
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "INTERNAL", retryable: true },
      { status: 500 }
    );
  }
}
