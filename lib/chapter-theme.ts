export interface ChapterTheme {
  primary: string;
  secondary: string;
  accent: string;
  name: string;
  gradient: string;
  hex: { primary: string; secondary: string };
}

const themes: Record<string, ChapterTheme> = {
  sets: { primary: "blue-500", secondary: "purple-500", accent: "blue-100", name: "ocean", gradient: "from-blue-500 to-purple-500", hex: { primary: "#3b82f6", secondary: "#a855f7" } },
  "relations-functions": { primary: "emerald-500", secondary: "teal-500", accent: "emerald-100", name: "forest", gradient: "from-emerald-500 to-teal-500", hex: { primary: "#10b981", secondary: "#14b8a6" } },
  "trigonometric-functions": { primary: "amber-500", secondary: "orange-500", accent: "amber-100", name: "sunset", gradient: "from-amber-500 to-orange-500", hex: { primary: "#f59e0b", secondary: "#f97316" } },
  "principle-mathematical-induction": { primary: "rose-500", secondary: "pink-500", accent: "rose-100", name: "blossom", gradient: "from-rose-500 to-pink-500", hex: { primary: "#f43f5e", secondary: "#ec4899" } },
  "complex-numbers-quadratic": { primary: "indigo-500", secondary: "blue-500", accent: "indigo-100", name: "midnight", gradient: "from-indigo-500 to-blue-500", hex: { primary: "#6366f1", secondary: "#3b82f6" } },
  "linear-inequalities": { primary: "teal-500", secondary: "cyan-500", accent: "teal-100", name: "lagoon", gradient: "from-teal-500 to-cyan-500", hex: { primary: "#14b8a6", secondary: "#06b6d4" } },
  "permutations-combinations": { primary: "violet-500", secondary: "fuchsia-500", accent: "violet-100", name: "aurora", gradient: "from-violet-500 to-fuchsia-500", hex: { primary: "#8b5cf6", secondary: "#d946ef" } },
  "binomial-theorem": { primary: "sky-500", secondary: "blue-500", accent: "sky-100", name: "horizon", gradient: "from-sky-500 to-blue-500", hex: { primary: "#0ea5e9", secondary: "#3b82f6" } },
  "sequences-series": { primary: "lime-500", secondary: "green-500", accent: "lime-100", name: "spring", gradient: "from-lime-500 to-green-500", hex: { primary: "#84cc16", secondary: "#22c55e" } },
  "straight-lines": { primary: "slate-500", secondary: "zinc-600", accent: "slate-100", name: "graphite", gradient: "from-slate-500 to-zinc-600", hex: { primary: "#64748b", secondary: "#52525b" } },
  "conic-sections": { primary: "orange-500", secondary: "red-500", accent: "orange-100", name: "ember", gradient: "from-orange-500 to-red-500", hex: { primary: "#f97316", secondary: "#ef4444" } },
  "intro-3d-geometry": { primary: "purple-500", secondary: "violet-500", accent: "purple-100", name: "cosmos", gradient: "from-purple-500 to-violet-500", hex: { primary: "#a855f7", secondary: "#8b5cf6" } },
  "limits-derivatives": { primary: "pink-500", secondary: "rose-500", accent: "pink-100", name: "blossom", gradient: "from-pink-500 to-rose-500", hex: { primary: "#ec4899", secondary: "#f43f5e" } },
  "mathematical-reasoning": { primary: "cyan-500", secondary: "teal-500", accent: "cyan-100", name: "logic", gradient: "from-cyan-500 to-teal-500", hex: { primary: "#06b6d4", secondary: "#14b8a6" } },
  statistics: { primary: "blue-500", secondary: "indigo-500", accent: "blue-100", name: "data", gradient: "from-blue-500 to-indigo-500", hex: { primary: "#3b82f6", secondary: "#6366f1" } },
  probability: { primary: "cyan-500", secondary: "sky-500", accent: "cyan-100", name: "electric", gradient: "from-cyan-500 to-sky-500", hex: { primary: "#06b6d4", secondary: "#0ea5e9" } },
  "relations-functions-12": { primary: "emerald-500", secondary: "green-500", accent: "emerald-100", name: "forest", gradient: "from-emerald-500 to-green-500", hex: { primary: "#10b981", secondary: "#22c55e" } },
  "inverse-trigonometric-functions": { primary: "amber-600", secondary: "yellow-500", accent: "amber-100", name: "gold", gradient: "from-amber-600 to-yellow-500", hex: { primary: "#d97706", secondary: "#eab308" } },
  matrices: { primary: "slate-500", secondary: "zinc-500", accent: "slate-100", name: "steel", gradient: "from-slate-500 to-zinc-500", hex: { primary: "#64748b", secondary: "#71717a" } },
  determinants: { primary: "gray-600", secondary: "slate-500", accent: "gray-100", name: "iron", gradient: "from-gray-600 to-slate-500", hex: { primary: "#4b5563", secondary: "#64748b" } },
  "continuity-differentiability": { primary: "indigo-500", secondary: "blue-600", accent: "indigo-100", name: "midnight", gradient: "from-indigo-500 to-blue-600", hex: { primary: "#6366f1", secondary: "#2563eb" } },
  "applications-derivatives": { primary: "rose-500", secondary: "red-500", accent: "rose-100", name: "peak", gradient: "from-rose-500 to-red-500", hex: { primary: "#f43f5e", secondary: "#ef4444" } },
  integrals: { primary: "red-500", secondary: "orange-500", accent: "red-100", name: "flame", gradient: "from-red-500 to-orange-500", hex: { primary: "#ef4444", secondary: "#f97316" } },
  "applications-integrals": { primary: "pink-500", secondary: "fuchsia-500", accent: "pink-100", name: "bloom", gradient: "from-pink-500 to-fuchsia-500", hex: { primary: "#ec4899", secondary: "#d946ef" } },
  "differential-equations": { primary: "violet-600", secondary: "purple-500", accent: "violet-100", name: "wave", gradient: "from-violet-600 to-purple-500", hex: { primary: "#7c3aed", secondary: "#a855f7" } },
  vectors: { primary: "purple-500", secondary: "violet-500", accent: "purple-100", name: "cosmos", gradient: "from-purple-500 to-violet-500", hex: { primary: "#a855f7", secondary: "#8b5cf6" } },
  "3d-geometry": { primary: "fuchsia-500", secondary: "purple-600", accent: "fuchsia-100", name: "dimension", gradient: "from-fuchsia-500 to-purple-600", hex: { primary: "#d946ef", secondary: "#9333ea" } },
  "linear-programming": { primary: "green-500", secondary: "emerald-500", accent: "green-100", name: "optimize", gradient: "from-green-500 to-emerald-500", hex: { primary: "#22c55e", secondary: "#10b981" } },
  "probability-12": { primary: "sky-500", secondary: "cyan-500", accent: "sky-100", name: "chance", gradient: "from-sky-500 to-cyan-500", hex: { primary: "#0ea5e9", secondary: "#06b6d4" } },
};

const defaultTheme: ChapterTheme = {
  primary: "blue-500",
  secondary: "purple-500",
  accent: "blue-100",
  name: "default",
  gradient: "from-blue-500 to-purple-500",
  hex: { primary: "#3b82f6", secondary: "#a855f7" },
};

export function getChapterTheme(chapterId: string): ChapterTheme {
  return themes[chapterId] ?? defaultTheme;
}
