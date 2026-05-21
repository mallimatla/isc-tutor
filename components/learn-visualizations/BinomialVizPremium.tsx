"use client";
import { useState } from "react";

const ROWS = 8;

function binom(n: number, k: number): number {
  let v = 1;
  for (let i = 0; i < k; i++) v = (v * (n - i)) / (i + 1);
  return Math.round(v);
}

export default function BinomialVizPremium() {
  const [selectedRow, setSelectedRow] = useState(4);

  const W = 520, H = 360;
  const cx = W / 2;
  const rowGap = 38, cellGap = 44;

  const coefficients = Array.from({ length: selectedRow + 1 }, (_, k) =>
    binom(selectedRow, k)
  );

  const expansionTerms = coefficients.map((coef, k) => {
    const power = selectedRow - k;
    const aPart = power === 0 ? "" : power === 1 ? "a" : `a^${power}`;
    const bPart = k === 0 ? "" : k === 1 ? "b" : `b^${k}`;
    const coefPart = coef === 1 ? "" : `${coef}`;
    return `${coefPart}${aPart}${bPart}` || "1";
  });

  return (
    <div className="rounded-3xl bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Tap any row of Pascal&apos;s triangle</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none rounded-2xl bg-white shadow-inner">
        {Array.from({ length: ROWS }, (_, n) => {
          const y = 30 + n * rowGap;
          const isSelected = n === selectedRow;
          return (
            <g key={n}>
              {Array.from({ length: n + 1 }, (_, k) => {
                const x = cx + (k - n / 2) * cellGap;
                const value = binom(n, k);
                return (
                  <g key={`${n}-${k}`} className="cursor-pointer" onClick={() => setSelectedRow(n)}>
                    <circle
                      cx={x}
                      cy={y}
                      r="17"
                      fill={isSelected ? "#0ea5e9" : "#f1f5f9"}
                      stroke={isSelected ? "#0369a1" : "#cbd5e1"}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                    />
                    <text
                      x={x}
                      y={y + 5}
                      textAnchor="middle"
                      fill={isSelected ? "#fff" : "#475569"}
                      fontSize="14"
                      fontWeight={isSelected ? "700" : "500"}
                    >
                      {value}
                    </text>
                  </g>
                );
              })}
              <text x={W - 24} y={y + 5} fill="#94a3b8" fontSize="11" textAnchor="end">n={n}</text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-sky-700">n</div>
          <div className="mt-1 text-2xl font-bold text-sky-700">{selectedRow}</div>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-blue-700">Sum of row = 2<sup>n</sup></div>
          <div className="mt-1 text-2xl font-bold text-blue-700">{Math.pow(2, selectedRow)}</div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-700">
          Coefficients of (a + b)<sup>{selectedRow}</sup>
        </div>
        <div className="flex flex-wrap gap-2">
          {coefficients.map((c, k) => (
            <span
              key={k}
              className="rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 px-3 py-1.5 font-mono text-sm font-bold text-white shadow-sm"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border-l-4 border-sky-500 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-700">
          Binomial expansion
        </div>
        <div className="font-mono text-sm leading-relaxed text-slate-800 sm:text-base">
          (a + b)<sup>{selectedRow}</sup> = {expansionTerms.join(" + ").replace(/\^(\d+)/g, "^$1")}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          General term: T<sub>r+1</sub> = <sup>n</sup>C<sub>r</sub> · a<sup>n−r</sup> · b<sup>r</sup>
        </div>
      </div>
    </div>
  );
}
