export type Verdict = "correct" | "partial" | "incorrect";

interface DifficultyState {
  currentDifficulty: number;
  rollingWindow: Verdict[];
}

function weighted(v: Verdict): number {
  return v === "correct" ? 1.0 : v === "partial" ? 0.5 : 0.0;
}

export function updateDifficulty(
  state: DifficultyState,
  latestVerdict: Verdict
): DifficultyState {
  // Append latest verdict, trim to last 5
  const window = [...state.rollingWindow, latestVerdict].slice(-5);

  // Compute weighted correctness
  const rate =
    window.length === 0
      ? 0.5
      : window.map(weighted).reduce((a, b) => a + b, 0) / window.length;

  let newDifficulty = state.currentDifficulty;

  // Only adjust once the window is full (5 verdicts)
  if (window.length === 5) {
    if (rate >= 0.8 && newDifficulty < 5) newDifficulty++;
    if (rate <= 0.4 && newDifficulty > 1) newDifficulty--;
  }

  return { currentDifficulty: newDifficulty, rollingWindow: window };
}
