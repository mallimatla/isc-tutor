"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Raoult's law
// ============================================================================
function RaoultDemo() {
  const [x, setX] = useState(0.8); // mole fraction of solvent
  const P0 = 100; // reference vapour pressure of pure solvent (arbitrary units)
  const P = x * P0;
  const W = 300;
  const H = 140;
  const pad = 30;
  const px = pad + x * (W - 2 * pad);
  const py = H - pad - (P / P0) * (H - 2 * pad);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Vapour pressure of a solution is the pure-solvent value scaled by how much solvent is present.
      </h4>
      <div className="flex gap-3">
        <div className="flex flex-col items-center rounded-2xl bg-white p-3 shadow-inner">
          <svg viewBox="0 0 70 120" className="h-32 w-16">
            {/* beaker */}
            <path d="M12 20 L12 105 Q12 112 20 112 L50 112 Q58 112 58 105 L58 20" fill="none" stroke="#94a3b8" strokeWidth={2} />
            {/* liquid */}
            <rect x={12} y={60} width={46} height={52} fill="#22d3ee" opacity={0.5} />
            {/* vapour dots proportional to P */}
            {Array.from({ length: Math.round((P / P0) * 8) }).map((_, i) => (
              <circle key={i} cx={20 + ((i * 7) % 32)} cy={30 + ((i * 11) % 24)} r={2.5} fill="#0891b2" />
            ))}
          </svg>
          <span className="mt-1 text-[10px] text-slate-500">vapour ∝ P</span>
        </div>
        <div className="flex-1 rounded-2xl bg-white p-3 shadow-inner">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
            <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
            {/* P = x P0 straight line */}
            <line x1={pad} y1={H - pad} x2={W - pad} y2={pad} stroke="#0891b2" strokeWidth={2.5} />
            <circle cx={px} cy={py} r={5} fill="#dc2626" />
            <text x={W - pad} y={H - pad + 14} textAnchor="end" fontSize="9" fill="#64748b">x (solvent) →</text>
            <text x={pad - 6} y={pad + 4} textAnchor="end" fontSize="9" fill="#64748b">P</text>
          </svg>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Mole fraction of solvent x = <span className="font-bold text-cyan-600">{x.toFixed(2)}</span>
          <input type="range" min={0} max={1} step={0.01} value={x} onChange={(e) => setX(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        P = x · P° = {x.toFixed(2)} × {P0} = <strong className="text-cyan-600">{P.toFixed(1)}</strong>
      </div>
      <div className="mt-2 rounded-xl border-l-4 border-teal-400 bg-white p-3 text-xs text-slate-600">
        Adding non-volatile solute lowers x for the solvent, so the vapour pressure drops. This lowering is a colligative property.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Boiling and freezing point shift
// ============================================================================
function ColligativeDemo() {
  const [m, setM] = useState(1); // molality
  const Kb = 0.52;
  const Kf = 1.86;
  const dTb = Kb * m;
  const dTf = Kf * m;
  const bp = 100 + dTb;
  const fp = 0 - dTf;
  const H = 180;
  const pad = 20;
  // scale from -12 C to 106 C onto the thermometer
  const lo = -12;
  const hi = 106;
  const yOf = (temp: number) => H - pad - ((temp - lo) / (hi - lo)) * (H - 2 * pad);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Dissolving solute in water pushes the boiling point up and the freezing point down.
      </h4>
      <div className="flex gap-3">
        <div className="rounded-2xl bg-white p-3 shadow-inner">
          <svg viewBox="0 0 90 180" className="h-44 w-20">
            <line x1={30} y1={pad} x2={30} y2={H - pad} stroke="#94a3b8" strokeWidth={3} />
            {/* pure water markers */}
            <circle cx={30} cy={yOf(100)} r={4} fill="#0891b2" />
            <text x={40} y={yOf(100) + 3} fontSize="8" fill="#0891b2">100</text>
            <circle cx={30} cy={yOf(0)} r={4} fill="#0891b2" />
            <text x={40} y={yOf(0) + 3} fontSize="8" fill="#0891b2">0</text>
            {/* shifted points */}
            <circle cx={30} cy={yOf(bp)} r={5} fill="#dc2626" />
            <text x={40} y={yOf(bp) - 4} fontSize="8" fill="#dc2626">bp {bp.toFixed(1)}</text>
            <circle cx={30} cy={yOf(fp)} r={5} fill="#2563eb" />
            <text x={40} y={yOf(fp) + 10} fontSize="8" fill="#2563eb">fp {fp.toFixed(1)}</text>
          </svg>
        </div>
        <div className="flex-1">
          <div className="rounded-2xl bg-white p-3 shadow-inner">
            <label className="text-xs font-medium text-slate-600">
              Molality m = <span className="font-bold text-cyan-600">{m.toFixed(2)} mol/kg</span>
              <input type="range" min={0} max={3} step={0.1} value={m} onChange={(e) => setM(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
            </label>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="rounded-lg bg-rose-50 p-2 font-mono text-slate-700">
              ΔTb = Kb·m = 0.52 × {m.toFixed(2)} = <strong className="text-rose-600">{dTb.toFixed(2)} °C</strong>
            </div>
            <div className="rounded-lg bg-blue-50 p-2 font-mono text-slate-700">
              ΔTf = Kf·m = 1.86 × {m.toFixed(2)} = <strong className="text-blue-600">{dTf.toFixed(2)} °C</strong>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-teal-400 bg-white p-3 text-xs text-slate-600">
        Both shifts are colligative: they depend on the amount of dissolved particles, not what the solute is.
      </div>
    </div>
  );
}

export default function SolutionsVizPremium() {
  const demos: DemoTab[] = [
    { id: "raoult", title: "Raoult's law", emoji: "💨", render: () => <RaoultDemo /> },
    { id: "colligative", title: "Boiling/freezing shift", emoji: "❄️", render: () => <ColligativeDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-cyan-50 via-teal-50 to-emerald-50" />;
}
