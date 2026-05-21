import data from "@/data/isc-chapter-syllabus.json";

export interface ChapterSyllabus {
  subtopics: string[];
  suggestedDiagrams: string[];
}

const RAW = (data as { chapters: Record<string, ChapterSyllabus> }).chapters;

export const ISC_SYLLABUS: Record<string, ChapterSyllabus> = RAW;

export function getChapterSyllabus(chapterId: string): ChapterSyllabus | null {
  return ISC_SYLLABUS[chapterId] ?? null;
}
