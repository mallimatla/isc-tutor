"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Radioactive decay & half-life
// ============================================================================
function DecayDemo() {
  const [hl, setHl] = useState(1.5); // number of half-lives elapsed
  const frac = Math.pow(0.5, hl);
  const total = 48;
  const remaining = Math.round(total * frac);
  const W = 300,
    H = 110,
    pad = 20;
  const pts: string[] = [];
  for (let x = 0; x <= 4; x += 0.1) pts.push(`${pad + (x / 4) * (W - 2 * pad)},${H - pad - Math.pow(0.5, x) * (H - 2 * pad)}`);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Each half-life, half of what&apos;s left decays — never all at once, never fully gone.
      </h4>
      <div className="mb-3 grid grid-cols-12 gap-1 rounded-2xl bg-white p-3 shadow-inner">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={"h-3 w-3 rounded-full transition-colors " + (i < remaining ? "bg-emerald-500" : "bg-slate-200")} />
        ))}
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={pts.join(" ")} fill="none" stroke="#059669" strokeWidth={2.5} />
          <circle cx={pad + (hl / 4) * (W - 2 * pad)} cy={H - pad - frac * (H - 2 * pad)} r={5} fill="#047857" />
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Time elapsed = <span className="font-bold text-emerald-700">{hl.toFixed(1)} half-lives</span>
          <input type="range" min={0} max={4} step={0.1} value={hl} onChange={(e) => setHl(+e.target.value)} className="mt-1 w-full accent-emerald-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        N = N₀·(½)^(t/T) → <strong className="text-emerald-700">{(frac * 100).toFixed(1)}%</strong> remaining
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Binding energy per nucleon
// ============================================================================
function BindingDemo() {
  const [A, setA] = useState(56); // mass number
  // rough BE/A curve: rises fast, peaks ~56 (iron ≈ 8.8 MeV), gentle decline
  const be = (a: number) => 9 * (1 - Math.exp(-a / 15)) - a * 0.006;
  const val = be(A);
  const W = 300,
    H = 130,
    pad = 24;
  const toX = (a: number) => pad + (a / 240) * (W - 2 * pad);
  const toY = (b: number) => H - pad - (b / 9) * (H - 2 * pad);
  const pts: string[] = [];
  for (let a = 2; a <= 240; a += 3) pts.push(`${toX(a)},${toY(be(a))}`);
  const region = A < 50 ? "fusion zone (light nuclei join)" : A > 90 ? "fission zone (heavy nuclei split)" : "most stable (near iron)";
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Iron sits at the peak of stability. Everything else can release energy by moving toward it.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={pts.join(" ")} fill="none" stroke="#059669" strokeWidth={2.5} />
          <circle cx={toX(A)} cy={toY(val)} r={5} fill="#047857" />
          <text x={W - pad} y={H - 8} textAnchor="end" fontSize="8" fill="#94a3b8">mass number A →</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Nucleus size A = <span className="font-bold text-emerald-700">{A}</span>
          <input type="range" min={2} max={240} value={A} onChange={(e) => setA(+e.target.value)} className="mt-1 w-full accent-emerald-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-500 bg-white p-3 text-xs font-semibold text-emerald-700">
        {region}
      </div>
    </div>
  );
}

export default function NucleiVizPremium() {
  const demos: DemoTab[] = [
    { id: "decay", title: "Half-life", emoji: "☢️", render: () => <DecayDemo /> },
    { id: "be", title: "Binding energy", emoji: "⚛️", render: () => <BindingDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-emerald-50 via-green-50 to-teal-50" />;
}
