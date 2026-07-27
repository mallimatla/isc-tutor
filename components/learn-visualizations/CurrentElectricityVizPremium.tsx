"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Ohm's law — brightness of a bulb
// ============================================================================
function OhmDemo() {
  const [V, setV] = useState(6);
  const [R, setR] = useState(3);
  const I = V / R;
  const P = V * I;
  const glow = Math.min(1, P / 24);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        More voltage or less resistance ⇒ more current ⇒ a brighter bulb. I = V / R.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <svg viewBox="0 0 220 100" className="mx-auto h-24">
          <rect x={20} y={20} width={180} height={60} rx={6} fill="none" stroke="#94a3b8" strokeWidth={2} />
          <circle cx={110} cy={20} r={13} fill={`rgba(250,204,21,${0.15 + glow})`} stroke="#eab308" strokeWidth={2} />
          <rect x={12} y={40} width={16} height={20} fill="#334155" />
          <text x={20} y={54} textAnchor="middle" fontSize="9" fill="#fff">🔋</text>
          <rect x={175} y={72} width={30} height={8} fill="#cbd5e1" />
          <text x={190} y={95} textAnchor="middle" fontSize="8" fill="#64748b">R</text>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Voltage V = <span className="font-bold text-amber-600">{V} V</span>
          <input type="range" min={1} max={12} value={V} onChange={(e) => setV(+e.target.value)} className="mt-1 w-full accent-amber-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Resistance R = <span className="font-bold text-amber-600">{R} Ω</span>
          <input type="range" min={1} max={12} value={R} onChange={(e) => setR(+e.target.value)} className="mt-1 w-full accent-amber-500" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center font-mono text-sm text-slate-700">
        <div>I = <strong className="text-amber-600">{I.toFixed(2)} A</strong></div>
        <div>P = VI = <strong className="text-amber-600">{P.toFixed(1)} W</strong></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Series vs parallel
// ============================================================================
function CombinationDemo() {
  const [mode, setMode] = useState<"series" | "parallel">("series");
  const [r1, setR1] = useState(4);
  const [r2, setR2] = useState(6);
  const Req = mode === "series" ? r1 + r2 : (r1 * r2) / (r1 + r2);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Resistors in a row add up; side by side they combine to <em>less</em> than either one.
      </h4>
      <div className="mb-3 flex justify-center gap-2">
        {(["series", "parallel"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={"rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition " + (mode === m ? "bg-amber-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100")}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 240 90" className="h-auto w-full">
          {mode === "series" ? (
            <>
              <line x1={20} y1={45} x2={70} y2={45} stroke="#94a3b8" strokeWidth={2} />
              <rect x={70} y={37} width={40} height={16} fill="#fcd34d" stroke="#d97706" />
              <line x1={110} y1={45} x2={140} y2={45} stroke="#94a3b8" strokeWidth={2} />
              <rect x={140} y={37} width={40} height={16} fill="#fcd34d" stroke="#d97706" />
              <line x1={180} y1={45} x2={220} y2={45} stroke="#94a3b8" strokeWidth={2} />
            </>
          ) : (
            <>
              <line x1={20} y1={45} x2={70} y2={45} stroke="#94a3b8" strokeWidth={2} />
              <rect x={90} y={18} width={40} height={14} fill="#fcd34d" stroke="#d97706" />
              <rect x={90} y={58} width={40} height={14} fill="#fcd34d" stroke="#d97706" />
              <path d="M70,45 L70,25 L90,25 M70,45 L70,65 L90,65 M130,25 L150,25 L150,45 L150,65 L130,65" fill="none" stroke="#94a3b8" strokeWidth={2} />
              <line x1={150} y1={45} x2={220} y2={45} stroke="#94a3b8" strokeWidth={2} />
            </>
          )}
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          R₁ = <span className="font-bold text-amber-600">{r1} Ω</span>
          <input type="range" min={1} max={10} value={r1} onChange={(e) => setR1(+e.target.value)} className="mt-1 w-full accent-amber-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          R₂ = <span className="font-bold text-amber-600">{r2} Ω</span>
          <input type="range" min={1} max={10} value={r2} onChange={(e) => setR2(+e.target.value)} className="mt-1 w-full accent-amber-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        R_eq = <strong className="text-amber-600">{Req.toFixed(2)} Ω</strong>
      </div>
    </div>
  );
}

export default function CurrentElectricityVizPremium() {
  const demos: DemoTab[] = [
    { id: "ohm", title: "Ohm's law", emoji: "💡", render: () => <OhmDemo /> },
    { id: "comb", title: "Series & parallel", emoji: "🔗", render: () => <CombinationDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-amber-50 via-yellow-50 to-orange-50" />;
}
