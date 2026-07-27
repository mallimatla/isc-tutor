"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// Covalent radii (pm)
const PERIOD2 = [
  { sym: "Li", r: 134 },
  { sym: "Be", r: 90 },
  { sym: "B", r: 82 },
  { sym: "C", r: 77 },
  { sym: "N", r: 75 },
  { sym: "O", r: 73 },
  { sym: "F", r: 71 },
];
const PERIOD3 = [
  { sym: "Na", r: 154 },
  { sym: "Mg", r: 130 },
  { sym: "Al", r: 118 },
  { sym: "Si", r: 111 },
  { sym: "P", r: 106 },
  { sym: "S", r: 102 },
  { sym: "Cl", r: 99 },
];

// ============================================================================
// Demo 1: Atomic radius trend
// ============================================================================
function RadiusTrendDemo() {
  const [period, setPeriod] = useState(2);
  const row = period === 2 ? PERIOD2 : PERIOD3;
  const [idx, setIdx] = useState(0);
  const el = row[Math.min(idx, row.length - 1)];
  const maxR = 160;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Across a period the atomic radius shrinks — more protons pull the same shell inward.
      </h4>
      <div className="mb-2 flex gap-1.5">
        {[2, 3].map((p) => (
          <button
            key={p}
            onClick={() => { setPeriod(p); setIdx(0); }}
            className={
              "flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition " +
              (period === p ? "bg-amber-600 text-white shadow" : "bg-amber-50 text-amber-700 hover:bg-amber-100")
            }
            aria-pressed={period === p}
          >
            Period {p}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-end justify-around gap-1" style={{ height: 130 }}>
          {row.map((e, i) => {
            const isSel = i === Math.min(idx, row.length - 1);
            return (
              <div key={e.sym} className="flex flex-1 flex-col items-center justify-end">
                <div className="mb-0.5 text-[9px] text-slate-500">{e.r}</div>
                <div
                  className="w-full rounded-t transition-all"
                  style={{ height: (e.r / maxR) * 100, background: isSel ? "#d97706" : "#fcd34d" }}
                />
                <div className={"mt-0.5 text-[10px] font-semibold " + (isSel ? "text-amber-700" : "text-slate-500")}>{e.sym}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Across period → <span className="font-bold text-amber-600">{el.sym}</span>, radius = {el.r} pm
          <input type="range" min={0} max={row.length - 1} step={1} value={Math.min(idx, row.length - 1)} onChange={(e) => setIdx(+e.target.value)} className="mt-1 w-full accent-amber-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-amber-400 bg-white p-3 text-xs text-slate-600">
        Radius decreases left to right across a period, and increases down a group (new shells added).
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: First ionisation energy zig-zag
// ============================================================================
const IE = [
  { z: 1, sym: "H", ie: 1312 },
  { z: 2, sym: "He", ie: 2372 },
  { z: 3, sym: "Li", ie: 520 },
  { z: 4, sym: "Be", ie: 899 },
  { z: 5, sym: "B", ie: 801 },
  { z: 6, sym: "C", ie: 1086 },
  { z: 7, sym: "N", ie: 1402 },
  { z: 8, sym: "O", ie: 1314 },
  { z: 9, sym: "F", ie: 1681 },
  { z: 10, sym: "Ne", ie: 2081 },
  { z: 11, sym: "Na", ie: 496 },
  { z: 12, sym: "Mg", ie: 738 },
  { z: 13, sym: "Al", ie: 578 },
  { z: 14, sym: "Si", ie: 786 },
  { z: 15, sym: "P", ie: 1012 },
  { z: 16, sym: "S", ie: 1000 },
  { z: 17, sym: "Cl", ie: 1251 },
  { z: 18, sym: "Ar", ie: 1521 },
  { z: 19, sym: "K", ie: 419 },
  { z: 20, sym: "Ca", ie: 590 },
];

function IonisationDemo() {
  const [z, setZ] = useState(10);
  const cur = IE[z - 1];
  const W = 300,
    H = 160,
    pad = 26;
  const maxIe = 2400;
  const xOf = (i: number) => pad + (i / (IE.length - 1)) * (W - 2 * pad);
  const yOf = (v: number) => H - pad - (v / maxIe) * (H - 2 * pad);
  const pts = IE.map((d, i) => `${xOf(i)},${yOf(d.ie)}`).join(" ");

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        First ionisation energy zig-zags: peaks at noble gases, dips at group 1 metals.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={pts} fill="none" stroke="#d97706" strokeWidth={2} />
          {IE.map((d, i) => (
            <circle key={d.z} cx={xOf(i)} cy={yOf(d.ie)} r={d.z === z ? 4.5 : 2} fill={d.z === z ? "#b45309" : "#fbbf24"} />
          ))}
          <text x={xOf(z - 1)} y={yOf(cur.ie) - 8} textAnchor="middle" fontSize="9" fill="#b45309" fontWeight="bold">{cur.sym}</text>
          <text x={W - pad} y={H - pad + 14} textAnchor="end" fontSize="9" fill="#64748b">Z →</text>
          <text x={pad - 4} y={pad + 4} textAnchor="end" fontSize="8" fill="#64748b">IE</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Element Z = <span className="font-bold text-amber-600">{z} ({cur.sym})</span>
          <input type="range" min={1} max={20} step={1} value={z} onChange={(e) => setZ(+e.target.value)} className="mt-1 w-full accent-amber-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-amber-400 bg-white p-3 text-center text-sm text-slate-700">
        First IE of <strong className="text-amber-700">{cur.sym}</strong> = <strong>{cur.ie} kJ/mol</strong>
      </div>
    </div>
  );
}

export default function PeriodicClassificationVizPremium() {
  const demos: DemoTab[] = [
    { id: "radius", title: "Atomic radius", emoji: "📉", render: () => <RadiusTrendDemo /> },
    { id: "ie", title: "Ionisation energy", emoji: "⚡", render: () => <IonisationDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-amber-50 via-orange-50 to-yellow-50" />;
}
