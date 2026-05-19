import { NextResponse } from "next/server";
import syllabusData from "@/data/isc-syllabus.json";

export async function GET() {
  return NextResponse.json(syllabusData, {
    headers: {
      "Cache-Control": "public, max-age=86400",
    },
  });
}
