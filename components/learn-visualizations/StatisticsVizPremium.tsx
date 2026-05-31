"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Mean / Median / Mode
// ============================================================================
function MMMDemo() {
  const [data, setData] = useState<number[]>([2, 4, 4, 6, 8, 10, 10]);
  const sorted = [...data].sort((a, b) => a - b);
  const mean = data.reduce((s, n) => s + n, 0) / data.length;
  const median = sorted.length % 2
    ? sorted[(sorted.length - 1) / 2]
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const counts: Record<number, number> = {};
  for (const v of data) counts[v] = (counts[v] || 0) + 1;
  let mode = data[0]; let maxC = 0;
  for (const [v, c] of Object.entries(counts)) if (c > maxC) { mode = parseInt(v); maxC = c; }
  const addRand = () => setData((d) => [...d, Math.floor(Math.random() * 11)]);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Three central measures of a dataset.</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="mb-3 flex flex-wrap gap-1">
          {sorted.map((v, i) => (
            <div key={i} className="flex h-8 min-w-[28px] items-center justify-center rounded-lg bg-cyan-100 px-2 font-mono text-sm font-bold text-cyan-800">{v}</div>
          ))}
        </div>
        <div className="flex justify-center gap-2">
          <button onClick={addRand} className="rounded-full bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white">+ Add random</button>
          <button onClick={() => setData((d) => d.slice(0, -1))} className="rounded-full bg-zinc-200 px-4 py-1.5 text-xs font-semibold text-slate-700">− Pop</button>
          <button onClick={() => setData([2, 4, 4, 6, 8, 10, 10])} className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs">Reset</button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-blue-50 p-3"><div className="text-[10px] uppercase text-blue-700">Mean</div><div className="text-xl font-bold text-blue-700">{mean.toFixed(2)}</div></div>
        <div className="rounded-xl bg-cyan-50 p-3"><div className="text-[10px] uppercase text-cyan-700">Median</div><div className="text-xl font-bold text-cyan-700">{median}</div></div>
        <div className="rounded-xl bg-teal-50 p-3"><div className="text-[10px] uppercase text-teal-700">Mode</div><div className="text-xl font-bold text-teal-700">{mode}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Standard deviation visualizer
// ============================================================================
function StdDevDemo() {
  const [spread, setSpread] = useState(2);
  const center = 50;
  // generate symmetric data around center with given spread
  const data = Array.from({ length: 10 }, (_, i) => center + (i - 4.5) * spread);
  const mean = data.reduce((s, n) => s + n, 0) / data.length;
  const variance = data.reduce((s, n) => s + (n - mean) ** 2, 0) / data.length;
  const std = Math.sqrt(variance);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Spread the data — see standard deviation grow.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">spread = {spread}</span>
        <input type="range" min={0} max={10} step={0.5} value={spread} onChange={(e) => setSpread(parseFloat(e.target.value))} className="flex-1 accent-cyan-500" />
      </div>
      <svg viewBox="0 0 420 120" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1="60" x2="400" y2="60" stroke="#cbd5e1" />
        <line x1="210" y1="40" x2="210" y2="80" stroke="#0e7490" strokeWidth="2" />
        <text x="215" y="35" fontSize="11" fill="#0e7490" fontWeight="700">μ={mean.toFixed(0)}</text>
        {/* ±1σ band */}
        <rect x={210 + (-std) * 4} y="50" width={std * 8} height="20" fill="#06b6d4" fillOpacity="0.2" />
        {data.map((d, i) => (
          <circle key={i} cx={210 + (d - center) * 4} cy="60" r="6" fill="#06b6d4" />
        ))}
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-cyan-50 p-3"><div className="text-[10px] uppercase text-cyan-700">Variance σ²</div><div className="font-mono text-lg font-bold text-cyan-700">{variance.toFixed(2)}</div></div>
        <div className="rounded-xl bg-teal-50 p-3"><div className="text-[10px] uppercase text-teal-700">Std Dev σ</div><div className="font-mono text-lg font-bold text-teal-700">{std.toFixed(2)}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Frequency distribution / histogram
// ============================================================================
function HistogramDemo() {
  const rolls = [3, 5, 5, 6, 6, 6, 4, 2, 5, 3, 6, 4, 5, 6, 3, 5];
  const counts: Record<number, number> = {};
  for (const r of rolls) counts[r] = (counts[r] || 0) + 1;
  const max = Math.max(...Object.values(counts));
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Group repeated values — frequencies become bars.</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="mb-2 flex flex-wrap gap-1 justify-center">
          {rolls.map((r, i) => (<span key={i} className="rounded bg-cyan-50 px-2 py-1 text-xs font-mono">{r}</span>))}
        </div>
        <div className="flex h-32 items-end justify-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((v) => (
            <div key={v} className="flex w-12 flex-col items-center">
              <span className="text-[10px] font-mono">{counts[v] || 0}</span>
              <div className="w-full rounded-t bg-gradient-to-t from-cyan-600 to-sky-400" style={{ height: `${((counts[v] || 0) / max) * 100}%`, minHeight: 4 }} />
              <span className="mt-1 text-xs font-mono">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Coefficient of variation
// ============================================================================
function CVDemo() {
  const groupA = [10, 12, 11, 13, 14];
  const groupB = [50, 52, 51, 53, 54];
  const meanA = groupA.reduce((s, n) => s + n, 0) / groupA.length;
  const meanB = groupB.reduce((s, n) => s + n, 0) / groupB.length;
  const sdA = Math.sqrt(groupA.reduce((s, n) => s + (n - meanA) ** 2, 0) / groupA.length);
  const sdB = Math.sqrt(groupB.reduce((s, n) => s + (n - meanB) ** 2, 0) / groupB.length);
  const cvA = (sdA / meanA) * 100;
  const cvB = (sdB / meanB) * 100;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">CV = (σ/mean)×100 — lets you compare spreads of different-scale data.</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner space-y-3">
        <div>
          <div className="text-[10px] uppercase text-blue-700">Group A: heights of seedlings</div>
          <div className="flex gap-1 mt-1">{groupA.map((v, i) => <span key={i} className="rounded bg-blue-50 px-2 py-1 text-xs font-mono">{v}</span>)}</div>
          <div className="mt-1 text-sm font-mono">mean = {meanA}, σ = {sdA.toFixed(2)}, CV = <strong className="text-blue-700">{cvA.toFixed(1)}%</strong></div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-emerald-700">Group B: heights of trees</div>
          <div className="flex gap-1 mt-1">{groupB.map((v, i) => <span key={i} className="rounded bg-emerald-50 px-2 py-1 text-xs font-mono">{v}</span>)}</div>
          <div className="mt-1 text-sm font-mono">mean = {meanB}, σ = {sdB.toFixed(2)}, CV = <strong className="text-emerald-700">{cvB.toFixed(1)}%</strong></div>
        </div>
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3 text-sm">
          Same σ, but A varies <strong>more relatively</strong> (CV is higher). Use CV to compare.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Box plot conceptual
// ============================================================================
function BoxPlotDemo() {
  const data = [2, 5, 7, 8, 11, 13, 14, 15, 18, 22, 25];
  const sorted = [...data].sort((a, b) => a - b);
  const min = sorted[0], max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];
  const q1 = sorted[Math.floor(sorted.length / 4)];
  const q3 = sorted[Math.floor((3 * sorted.length) / 4)];
  const sX = (v: number) => 40 + ((v - min) / (max - min)) * 320;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Box plot — five-number summary: min, Q1, median, Q3, max.</h4>
      <svg viewBox="0 0 400 160" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1="120" x2="360" y2="120" stroke="#cbd5e1" />
        {sorted.map((v, i) => (<text key={i} x={sX(v)} y="140" textAnchor="middle" fontSize="10" fill="#64748b">{v}</text>))}
        {/* whiskers */}
        <line x1={sX(min)} y1="60" x2={sX(min)} y2="100" stroke="#0891b2" strokeWidth="2" />
        <line x1={sX(min)} y1="80" x2={sX(q1)} y2="80" stroke="#0891b2" strokeWidth="2" />
        <line x1={sX(q3)} y1="80" x2={sX(max)} y2="80" stroke="#0891b2" strokeWidth="2" />
        <line x1={sX(max)} y1="60" x2={sX(max)} y2="100" stroke="#0891b2" strokeWidth="2" />
        {/* box */}
        <rect x={sX(q1)} y="50" width={sX(q3) - sX(q1)} height="60" fill="#06b6d4" fillOpacity="0.3" stroke="#0891b2" strokeWidth="2" />
        <line x1={sX(median)} y1="50" x2={sX(median)} y2="110" stroke="#075985" strokeWidth="3" />
      </svg>
      <div className="mt-3 grid grid-cols-5 gap-1 text-center font-mono text-xs">
        <div className="rounded bg-cyan-50 p-2"><div>min</div><div className="font-bold text-cyan-700">{min}</div></div>
        <div className="rounded bg-cyan-50 p-2"><div>Q1</div><div className="font-bold text-cyan-700">{q1}</div></div>
        <div className="rounded bg-sky-100 p-2"><div>median</div><div className="font-bold text-sky-700">{median}</div></div>
        <div className="rounded bg-cyan-50 p-2"><div>Q3</div><div className="font-bold text-cyan-700">{q3}</div></div>
        <div className="rounded bg-cyan-50 p-2"><div>max</div><div className="font-bold text-cyan-700">{max}</div></div>
      </div>
    </div>
  );
}

export default function StatisticsVizPremium() {
  const demos: DemoTab[] = [
    { id: "mmm", title: "Mean/Median/Mode", emoji: "📊", render: () => <MMMDemo /> },
    { id: "std", title: "Std Deviation", emoji: "📏", render: () => <StdDevDemo /> },
    { id: "hist", title: "Histogram", emoji: "📈", render: () => <HistogramDemo /> },
    { id: "cv", title: "Coeff of Variation", emoji: "🔀", render: () => <CVDemo /> },
    { id: "box", title: "Box plot", emoji: "📦", render: () => <BoxPlotDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-cyan-50 via-sky-50 to-teal-50" />;
}
