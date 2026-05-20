import syllabusData from "@/data/isc-syllabus.json";

export interface Chapter {
  id: string;
  label: string;
  description?: string;
}

interface Subject {
  id: string;
  label: string;
}

type ClassLevel = "11" | "12";

interface SyllabusSubject {
  label: string;
  classes: Record<
    string,
    { label: string; chapters: Chapter[] } | undefined
  >;
}

const subjects = syllabusData.subjects as Record<string, SyllabusSubject>;

export function getSubjects(): Subject[] {
  return Object.entries(subjects).map(([id, s]) => ({
    id,
    label: s.label,
  }));
}

export function getAllChapters(
  subject: string,
  classLevel: ClassLevel
): Chapter[] {
  const cls = subjects[subject]?.classes[classLevel];
  return cls?.chapters ?? [];
}

export function getChapter(
  subject: string,
  classLevel: ClassLevel,
  chapterId: string
): Chapter | null {
  const chapters = getAllChapters(subject, classLevel);
  return chapters.find((c) => c.id === chapterId) ?? null;
}
