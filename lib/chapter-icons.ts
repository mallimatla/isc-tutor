/**
 * A distinctive emoji icon per chapter, used on the dashboard tiles and the
 * practice header instead of the first letter of the chapter name. Keyed by
 * chapterId; falls back to a book when a chapter isn't listed.
 */
const CHAPTER_ICONS: Record<string, string> = {
  // ---- Mathematics · Class 11 ----
  sets: "🎯",
  "relations-functions": "⚙️",
  "trigonometric-functions": "🎡",
  "principle-mathematical-induction": "🪜",
  "complex-numbers-quadratic": "🌀",
  "linear-inequalities": "⚖️",
  "permutations-combinations": "🎴",
  "binomial-theorem": "🔺",
  "sequences-series": "📈",
  "straight-lines": "📏",
  "conic-sections": "🥚",
  "intro-3d-geometry": "🧊",
  "limits-derivatives": "♾️",
  "mathematical-reasoning": "🧠",
  statistics: "📊",
  probability: "🎲",
  // ---- Mathematics · Class 12 ----
  "relations-functions-12": "🔗",
  "inverse-trigonometric-functions": "↪️",
  matrices: "🔢",
  determinants: "📐",
  "continuity-differentiability": "〽️",
  "applications-derivatives": "🎢",
  integrals: "🌊",
  "applications-integrals": "🖼️",
  "differential-equations": "🦠",
  vectors: "➡️",
  "3d-geometry": "🛩️",
  "linear-programming": "🏆",
  "probability-12": "🃏",

  // ---- Physics · Class 11 ----
  "units-measurements": "📏",
  kinematics: "🏹",
  "laws-of-motion": "🏎️",
  "work-energy-power": "💪",
  "rotational-motion": "🔄",
  gravitation: "🪐",
  "mechanical-properties-solids": "🧱",
  "mechanical-properties-fluids": "💧",
  "thermal-properties-matter": "🌡️",
  thermodynamics: "🔥",
  "kinetic-theory": "💨",
  oscillations: "〰️",
  waves: "🌊",
  // ---- Physics · Class 12 ----
  "electric-charges-fields": "⚡",
  "electrostatic-potential-capacitance": "🔋",
  "current-electricity": "💡",
  "moving-charges-magnetism": "🧲",
  "magnetism-matter": "🧭",
  "electromagnetic-induction": "🔌",
  "alternating-current": "📻",
  "electromagnetic-waves": "📡",
  "ray-optics": "🔎",
  "wave-optics": "🌈",
  "dual-nature-radiation": "🔦",
  atoms: "⚛️",
  nuclei: "☢️",
  "semiconductor-electronics": "💻",
};

export function getChapterIcon(chapterId: string): string {
  return CHAPTER_ICONS[chapterId] ?? "📘";
}
