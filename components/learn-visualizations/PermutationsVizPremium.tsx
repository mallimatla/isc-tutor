"use client";
import { useState } from "react";

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

const POOL_COLORS = [
  "#8b5cf6", "#a855f7", "#c084fc", "#d946ef", "#e879f9",
  "#ec4899", "#f472b6", "#fb7185", "#fbbf24", "#f59e0b",
];

export default function PermutationsVizPremium() {
  const [n, setN] = useState(5);
  const [r, setR] = useState(3);

  const safeR = Math.min(r, n);
  const nFact = factorial(n);
  const rFact = factorial(safeR);
  const nMinusRFact = factorial(n - safeR);
  const nPr = nFact / nMinusRFact;
  const nCr = nPr / rFact;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Pick n and r — see permutations vs combinations</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-inner">
        {/* Pool of n items */}
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Pool of {n} items</div>
        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from({ length: n }, (_, i) => (
            <div
              key={i}
              className="flex h-10 w-10 items-center justify-center rounded-xl font-mono text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: POOL_COLORS[i % POOL_COLORS.length] }}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>

        {/* Picked slots: r boxes */}
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Pick {safeR}</div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: safeR }, (_, i) => (
            <div
              key={i}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-violet-300 font-mono text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: POOL_COLORS[i % POOL_COLORS.length] + "cc" }}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          {safeR === 0 && <span className="text-sm text-slate-400">(pick nothing)</span>}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-violet-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>n (pool size)</span>
            <span className="font-mono text-sm text-violet-700">{n}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setN(Math.max(1, n - 1))} className="h-8 w-8 rounded-full bg-violet-100 font-bold text-violet-700 hover:bg-violet-200">−</button>
            <button onClick={() => setN(Math.min(10, n + 1))} className="h-8 w-8 rounded-full bg-violet-100 font-bold text-violet-700 hover:bg-violet-200">+</button>
          </div>
        </div>
        <div className="rounded-2xl border border-fuchsia-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>r (picks)</span>
            <span className="font-mono text-sm text-fuchsia-700">{safeR}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setR(Math.max(0, r - 1))} className="h-8 w-8 rounded-full bg-fuchsia-100 font-bold text-fuchsia-700 hover:bg-fuchsia-200">−</button>
            <button onClick={() => setR(Math.min(n, r + 1))} className="h-8 w-8 rounded-full bg-fuchsia-100 font-bold text-fuchsia-700 hover:bg-fuchsia-200">+</button>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-violet-700">
            <sup>{n}</sup>P<sub>{safeR}</sub> &nbsp;(order matters)
          </div>
          <div className="mt-1 text-3xl font-bold text-violet-700">{nPr.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-fuchsia-200 bg-gradient-to-b from-fuchsia-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-fuchsia-700">
            <sup>{n}</sup>C<sub>{safeR}</sub> &nbsp;(order doesn&apos;t)
          </div>
          <div className="mt-1 text-3xl font-bold text-fuchsia-700">{nCr.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border-l-4 border-violet-500 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-700">Formulae</div>
        <div className="font-mono text-base text-slate-800 sm:text-lg">
          <sup>n</sup>P<sub>r</sub> = n! / (n − r)! &nbsp;·&nbsp; <sup>n</sup>C<sub>r</sub> = n! / [r! (n − r)!]
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {safeR > 0 && <>Permutations / Combinations = r! → {nPr.toLocaleString()} ÷ {rFact} = {nCr.toLocaleString()}</>}
        </div>
      </div>
    </div>
  );
}
