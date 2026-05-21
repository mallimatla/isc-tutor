"use client";
import { useState } from "react";

type Kind = "AP" | "GP";

export default function SequencesSeriesVizPremium() {
  const [kind, setKind] = useState<Kind>("AP");
  const [a, setA] = useState(2);
  const [d, setD] = useState(3);
  const [r, setR] = useState(1.5);

  const N = 8;
  const terms = Array.from({ length: N }, (_, i) =>
    kind === "AP" ? a + i * d : a * Math.pow(r, i)
  );
  const sum = terms.reduce((s, t) => s + t, 0);
  const lastTerm = terms[N - 1];
  const minT = Math.min(...terms, 0);
  const maxT = Math.max(...terms, 0);
  const range = maxT - minT || 1;

  const W = 520, H = 240;
  const padX = 40, padY = 30;
  const chartW = W - 2 * padX, chartH = H - 2 * padY;
  const xFor = (i: number) => padX + (i + 0.5) * (chartW / N);
  const yFor = (t: number) => padY + chartH - ((t - minT) / range) * chartH;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Toggle AP vs GP — watch the terms change</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setKind("AP")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${kind === "AP" ? "bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-md" : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"}`}
        >
          Arithmetic
        </button>
        <button
          onClick={() => setKind("GP")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${kind === "GP" ? "bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-md" : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"}`}
        >
          Geometric
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none rounded-2xl bg-white shadow-inner">
        <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="#cbd5e1" strokeWidth="1" />
        {minT < 0 && maxT > 0 && (
          <line x1={padX} y1={yFor(0)} x2={W - padX} y2={yFor(0)} stroke="#e2e8f0" strokeWidth="1" />
        )}
        {kind === "AP"
          ? terms.map((t, i) => (
              <g key={i}>
                <line x1={xFor(i)} y1={yFor(0)} x2={xFor(i)} y2={yFor(t)} stroke="#84cc16" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx={xFor(i)} cy={yFor(t)} r="9" fill="#84cc16" stroke="#fff" strokeWidth="2" />
                <text x={xFor(i)} y={H - padY + 16} fill="#475569" fontSize="11" textAnchor="middle">{i + 1}</text>
              </g>
            ))
          : terms.map((t, i) => {
              const barH = ((t - Math.min(0, minT)) / range) * chartH;
              const barY = t >= 0 ? yFor(t) : yFor(0);
              return (
                <g key={i}>
                  <rect x={xFor(i) - 18} y={barY} width="36" height={Math.abs(barH)} fill="#22c55e" rx="4" />
                  <text x={xFor(i)} y={H - padY + 16} fill="#475569" fontSize="11" textAnchor="middle">{i + 1}</text>
                </g>
              );
            })}
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="rounded-2xl border border-lime-100 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>First term a</span>
            <span className="font-mono text-sm text-lime-700">{a}</span>
          </div>
          <input type="range" min="-5" max="10" step="1" value={a} onChange={(e) => setA(Number(e.target.value))} className="mt-2 w-full accent-lime-600" />
        </label>
        {kind === "AP" ? (
          <label className="rounded-2xl border border-green-100 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
              <span>Common diff d</span>
              <span className="font-mono text-sm text-green-700">{d}</span>
            </div>
            <input type="range" min="-3" max="5" step="1" value={d} onChange={(e) => setD(Number(e.target.value))} className="mt-2 w-full accent-green-600" />
          </label>
        ) : (
          <label className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
              <span>Common ratio r</span>
              <span className="font-mono text-sm text-emerald-700">{r.toFixed(1)}</span>
            </div>
            <input type="range" min="0.5" max="2" step="0.1" value={r} onChange={(e) => setR(Number(e.target.value))} className="mt-2 w-full accent-emerald-600" />
          </label>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-lime-200 bg-gradient-to-b from-lime-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-lime-700">{N}th term</div>
          <div className="mt-1 text-2xl font-bold text-lime-700">{lastTerm.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-green-200 bg-gradient-to-b from-green-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-green-700">Sum S<sub>{N}</sub></div>
          <div className="mt-1 text-2xl font-bold text-green-700">{sum.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border-l-4 border-emerald-500 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          {kind === "AP" ? "Arithmetic Progression" : "Geometric Progression"}
        </div>
        <div className="font-mono text-base text-slate-800 sm:text-lg">
          {kind === "AP"
            ? <>T<sub>n</sub> = a + (n−1)d &nbsp;·&nbsp; S<sub>n</sub> = (n/2)[2a + (n−1)d]</>
            : <>T<sub>n</sub> = a·r<sup>n−1</sup> &nbsp;·&nbsp; S<sub>n</sub> = a(r<sup>n</sup> − 1)/(r − 1)</>}
        </div>
      </div>
    </div>
  );
}
