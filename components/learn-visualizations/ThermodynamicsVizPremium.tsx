"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: P–V diagram — work is the area under the curve
// ============================================================================
const PROCESSES = [
  { id: "isobaric", name: "Isobaric", note: "constant pressure — W = P·ΔV" },
  { id: "isothermal", name: "Isothermal", note: "constant T — PV = constant" },
  { id: "adiabatic", name: "Adiabatic", note: "no heat exchange — PVᵞ = constant" },
  { id: "isochoric", name: "Isochoric", note: "constant volume — W = 0" },
];
function PVDemo() {
  const [proc, setProc] = useState("isothermal");
  const W = 300,
    H = 170,
    pad = 30;
  const V1 = 0.2,
    V2 = 0.85,
    P1 = 0.8;
  const toX = (v: number) => pad + v * (W - 2 * pad);
  const toY = (p: number) => H - pad - p * (H - 2 * pad);
  const pAt = (v: number): number => {
    if (proc === "isobaric") return P1;
    if (proc === "isochoric") return P1; // vertical handled separately
    if (proc === "isothermal") return (P1 * V1) / v;
    return (P1 * Math.pow(V1, 1.4)) / Math.pow(v, 1.4); // adiabatic γ=1.4
  };
  const curve: string[] = [];
  const area: string[] = [`${toX(V1)},${toY(0)}`];
  if (proc === "isochoric") {
    curve.push(`${toX(V1)},${toY(P1)}`, `${toX(V1)},${toY(0.25)}`);
  } else {
    for (let i = 0; i <= 40; i++) {
      const v = V1 + ((V2 - V1) * i) / 40;
      curve.push(`${toX(v)},${toY(pAt(v))}`);
      area.push(`${toX(v)},${toY(pAt(v))}`);
    }
    area.push(`${toX(V2)},${toY(0)}`);
  }
  const noWork = proc === "isochoric";
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        On a P–V diagram, the area under the path is the work done by the gas.
      </h4>
      <div className="mb-3 grid grid-cols-2 gap-1.5">
        {PROCESSES.map((p) => (
          <button
            key={p.id}
            onClick={() => setProc(p.id)}
            className={"rounded-lg px-2 py-1.5 text-xs font-semibold transition " + (proc === p.id ? "bg-rose-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100")}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {!noWork && <polygon points={area.join(" ")} fill="#fecdd3" opacity={0.7} />}
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={curve.join(" ")} fill="none" stroke="#e11d48" strokeWidth={2.5} />
          <text x={W - pad} y={H - pad + 14} textAnchor="end" fontSize="9" fill="#64748b">Volume →</text>
          <text x={pad - 6} y={pad} textAnchor="end" fontSize="9" fill="#64748b">P</text>
        </svg>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-rose-500 bg-white p-3 text-xs text-slate-600">
        {PROCESSES.find((p) => p.id === proc)!.note}
        {noWork && <strong className="ml-1 text-rose-600">No area ⇒ no work done.</strong>}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Carnot efficiency of a heat engine
// ============================================================================
function EfficiencyDemo() {
  const [Th, setTh] = useState(600); // K
  const [Tc, setTc] = useState(300); // K
  const eff = Math.max(0, 1 - Tc / Th) * 100;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        No engine can turn all heat into work. The bigger the temperature gap, the better it can do.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="flex items-center justify-center gap-3">
          <div className="rounded-xl bg-red-100 px-4 py-3 text-center">
            <div className="text-[10px] uppercase text-red-500">Hot source</div>
            <div className="font-mono font-bold text-red-700">{Th} K</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">⚙️</div>
            <div className="font-mono text-lg font-bold text-emerald-600">{eff.toFixed(0)}%</div>
          </div>
          <div className="rounded-xl bg-blue-100 px-4 py-3 text-center">
            <div className="text-[10px] uppercase text-blue-500">Cold sink</div>
            <div className="font-mono font-bold text-blue-700">{Tc} K</div>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Hot Tₕ = <span className="font-bold text-red-600">{Th} K</span>
          <input type="range" min={350} max={900} step={10} value={Th} onChange={(e) => setTh(Math.max(+e.target.value, Tc + 10))} className="mt-1 w-full accent-red-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Cold T꜀ = <span className="font-bold text-blue-600">{Tc} K</span>
          <input type="range" min={200} max={500} step={10} value={Tc} onChange={(e) => setTc(Math.min(+e.target.value, Th - 10))} className="mt-1 w-full accent-blue-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        η = 1 − T꜀/Tₕ = <strong className="text-emerald-600">{eff.toFixed(1)}%</strong>
      </div>
    </div>
  );
}

export default function ThermodynamicsVizPremium() {
  const demos: DemoTab[] = [
    { id: "pv", title: "P–V processes", emoji: "📊", render: () => <PVDemo /> },
    { id: "eff", title: "Engine efficiency", emoji: "⚙️", render: () => <EfficiencyDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-rose-50 via-orange-50 to-red-50" />;
}
