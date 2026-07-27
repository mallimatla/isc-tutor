"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Stress–strain curve
// ============================================================================
// Piecewise curve: elastic (linear) → yield → plastic → fracture.
function stressAt(strain: number) {
  // strain 0..1 maps across the curve
  if (strain < 0.35) return strain * 2.4; // elastic, steep & linear
  if (strain < 0.5) return 0.84 + (strain - 0.35) * 0.4; // yield plateau
  if (strain < 0.85) return 0.9 + (strain - 0.5) * 0.5; // strain hardening
  return 1.075 - (strain - 0.85) * 1.2; // necking → fracture drop
}
function regionOf(s: number) {
  if (s < 0.35) return { name: "Elastic — springs back", color: "#16a34a" };
  if (s < 0.5) return { name: "Yield — starts to give", color: "#d97706" };
  if (s < 0.85) return { name: "Plastic — permanent stretch", color: "#ea580c" };
  return { name: "Necking → Fracture!", color: "#e11d48" };
}
function StressStrainDemo() {
  const [s, setS] = useState(20); // % along strain
  const strain = s / 100;
  const stress = stressAt(strain);
  const reg = regionOf(strain);
  const W = 300,
    H = 160,
    pad = 24;
  const toX = (st: number) => pad + st * (W - 2 * pad);
  const toY = (v: number) => H - pad - (v / 1.15) * (H - 2 * pad);
  const pts: string[] = [];
  for (let i = 0; i <= 100; i++) pts.push(`${toX(i / 100)},${toY(stressAt(i / 100))}`);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Stretch a metal wire and watch it go from springy to permanently bent to snapped.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#e2e8f0" strokeWidth={1.5} />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#e2e8f0" strokeWidth={1.5} />
          <polyline points={pts.join(" ")} fill="none" stroke="#0f766e" strokeWidth={2.5} />
          <circle cx={toX(strain)} cy={toY(stress)} r={5} fill={reg.color} />
          <text x={W - pad} y={H - 8} textAnchor="end" fontSize="8" fill="#94a3b8">strain →</text>
          <text x={pad - 6} y={pad + 2} textAnchor="end" fontSize="8" fill="#94a3b8">stress</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Load applied = <span className="font-bold" style={{ color: reg.color }}>{s}%</span>
          <input type="range" min={0} max={100} value={s} onChange={(e) => setS(+e.target.value)} className="mt-1 w-full accent-teal-600" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 bg-white p-3 text-sm font-semibold" style={{ borderColor: reg.color, color: reg.color }}>
        {reg.name}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Young's modulus — F, area, length → extension
// ============================================================================
function YoungDemo() {
  const [F, setF] = useState(100);
  const [area, setArea] = useState(2); // mm²
  const [L, setL] = useState(2); // m
  const Y = 200; // GPa (steel-ish), arbitrary units for a relative feel
  // ΔL = F·L / (A·Y)  → relative
  const dL = (F * L) / (area * Y * 5);
  const stretchPx = Math.min(60, dL * 40);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        A thicker or shorter wire stretches less. Young&apos;s modulus Y measures stiffness.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <svg viewBox="0 0 120 150" className="mx-auto h-32">
          <rect x={40} y={8} width={40} height={6} fill="#334155" />
          <rect x={57} y={14} width={6} height={90 + stretchPx} fill="#0d9488" rx={2} />
          <rect x={44} y={104 + stretchPx} width={32} height={18} rx={3} fill="#475569" />
          <text x={60} y={140} textAnchor="middle" fontSize="9" fill="#64748b">load</text>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-[11px] font-medium text-slate-600">
          Force <span className="font-bold text-teal-700">{F} N</span>
          <input type="range" min={20} max={200} value={F} onChange={(e) => setF(+e.target.value)} className="mt-1 w-full accent-teal-600" />
        </label>
        <label className="text-[11px] font-medium text-slate-600">
          Area <span className="font-bold text-teal-700">{area} mm²</span>
          <input type="range" min={1} max={6} value={area} onChange={(e) => setArea(+e.target.value)} className="mt-1 w-full accent-teal-600" />
        </label>
        <label className="text-[11px] font-medium text-slate-600">
          Length <span className="font-bold text-teal-700">{L} m</span>
          <input type="range" min={1} max={5} value={L} onChange={(e) => setL(+e.target.value)} className="mt-1 w-full accent-teal-600" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        ΔL = F·L / (A·Y) → <strong className="text-teal-700">{dL.toFixed(2)} mm</strong> (relative)
      </div>
    </div>
  );
}

export default function MechanicalPropertiesSolidsVizPremium() {
  const demos: DemoTab[] = [
    { id: "ss", title: "Stress–strain", emoji: "📈", render: () => <StressStrainDemo /> },
    { id: "young", title: "Young's modulus", emoji: "🪢", render: () => <YoungDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-teal-50 via-emerald-50 to-cyan-50" />;
}
