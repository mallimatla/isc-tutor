"use client";
import { useState, useCallback } from "react";

const BALLS = [
  ...Array(4).fill("#ef4444"),
  ...Array(3).fill("#3b82f6"),
  ...Array(3).fill("#22c55e"),
] as string[];
const COLORS = { "#ef4444": "Red", "#3b82f6": "Blue", "#22c55e": "Green" };
const THEORY = { "#ef4444": 0.4, "#3b82f6": 0.3, "#22c55e": 0.3 };

export default function ProbabilityVizPremium() {
  const [picks, setPicks] = useState<string[]>([]);
  const [lastPick, setLastPick] = useState<string | null>(null);

  const pickBall = useCallback(() => {
    const color = BALLS[Math.floor(Math.random() * BALLS.length)];
    setPicks((prev) => [...prev, color]);
    setLastPick(color);
  }, []);

  const reset = () => { setPicks([]); setLastPick(null); };

  const counts: Record<string, number> = {};
  for (const c of picks) counts[c] = (counts[c] || 0) + 1;
  const total = picks.length || 1;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Run the experiment — watch reality converge to theory</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {BALLS.map((c, i) => (
          <div key={i} className="h-8 w-8 rounded-full shadow-sm" style={{ backgroundColor: c, opacity: lastPick === c ? 1 : 0.6, transform: lastPick === c ? "scale(1.2)" : "scale(1)", transition: "all 0.2s" }} />
        ))}
      </div>

      <div className="mb-6 flex items-center justify-center gap-3">
        <button onClick={pickBall} className="rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl">Pick a ball</button>
        <button onClick={reset} className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">Reset</button>
        <span className="text-sm text-slate-500">{picks.length} picks</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(Object.entries(COLORS) as [string, string][]).map(([hex, name]) => {
          const empirical = (counts[hex] || 0) / total;
          const theoretical = THEORY[hex as keyof typeof THEORY];
          return (
            <div key={hex} className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: hex + "40" }}>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: hex }} />
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{name}</span>
              </div>
              <div className="mt-2 text-2xl font-bold" style={{ color: hex }}>{picks.length > 0 ? `${(empirical * 100).toFixed(0)}%` : "—"}</div>
              <div className="mt-1 text-xs text-slate-400">Theory: {(theoretical * 100).toFixed(0)}%</div>
              <div className="mt-2 h-2 rounded-full bg-zinc-100">
                <div className="h-2 rounded-full transition-all" style={{ width: `${empirical * 100}%`, backgroundColor: hex }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
