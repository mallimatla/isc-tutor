"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Parallel-plate capacitor
// ============================================================================
function CapacitorDemo() {
  const [d, setD] = useState(30); // plate gap
  const [k, setK] = useState(1); // dielectric constant
  const C = (k * 100) / d; // C = ε₀·k·A / d
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Bring the plates closer, or slip in a dielectric — the capacitance goes up.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <svg viewBox="0 0 200 110" className="mx-auto h-28">
          <rect x={100 - d / 2 - 8} y={20} width={8} height={70} fill="#dc2626" />
          <rect x={100 + d / 2} y={20} width={8} height={70} fill="#2563eb" />
          {k > 1 && <rect x={100 - d / 2} y={20} width={d} height={70} fill="#a7f3d0" opacity={0.6} />}
          {[...Array(4)].map((_, i) => (
            <line key={i} x1={100 - d / 2} y1={30 + i * 17} x2={100 + d / 2} y2={30 + i * 17} stroke="#94a3b8" strokeWidth={1} markerEnd="url(#ep-a)" />
          ))}
          <defs>
            <marker id="ep-a" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
              <path d="M0,0 L5,3 L0,6 Z" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Plate gap d = <span className="font-bold text-indigo-700">{(d / 30).toFixed(1)}×</span>
          <input type="range" min={12} max={60} value={d} onChange={(e) => setD(+e.target.value)} className="mt-1 w-full accent-indigo-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Dielectric k = <span className="font-bold text-indigo-700">{k}</span>
          <input type="range" min={1} max={6} value={k} onChange={(e) => setK(+e.target.value)} className="mt-1 w-full accent-indigo-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        C = ε₀·k·A / d = <strong className="text-indigo-700">{C.toFixed(1)}</strong> (relative)
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Potential of a point charge
// ============================================================================
function PotentialDemo() {
  const [r, setR] = useState(40);
  const V = 400 / r; // V ∝ 1/r
  const E = 4000 / (r * r); // E ∝ 1/r²
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Potential falls off as 1/r; the field falls faster, as 1/r². Equipotentials are circles.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 260 120" className="h-auto w-full">
          {[30, 55, 80].map((rad) => (
            <circle key={rad} cx={60} cy={60} r={rad} fill="none" stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3 3" />
          ))}
          <circle cx={60} cy={60} r={10} fill="#f59e0b" />
          <text x={60} y={64} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">+</text>
          <circle cx={60 + r} cy={60} r={5} fill="#6366f1" />
          <line x1={60} y1={60} x2={60 + r} y2={60} stroke="#c7d2fe" strokeWidth={1.5} />
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Distance r = <span className="font-bold text-indigo-700">{(r / 40).toFixed(1)}×</span>
          <input type="range" min={20} max={90} value={r} onChange={(e) => setR(+e.target.value)} className="mt-1 w-full accent-indigo-500" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center font-mono text-sm text-slate-700">
        <div>V = kQ/r = <strong className="text-indigo-700">{V.toFixed(0)}</strong></div>
        <div>E = kQ/r² = <strong className="text-indigo-700">{E.toFixed(0)}</strong></div>
      </div>
    </div>
  );
}

export default function ElectrostaticPotentialCapacitanceVizPremium() {
  const demos: DemoTab[] = [
    { id: "cap", title: "Capacitor", emoji: "🔋", render: () => <CapacitorDemo /> },
    { id: "pot", title: "Potential", emoji: "🎯", render: () => <PotentialDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-indigo-50 via-violet-50 to-blue-50" />;
}
