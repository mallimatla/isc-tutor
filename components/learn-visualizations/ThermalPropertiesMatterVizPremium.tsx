"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Heating curve of water (phase changes)
// ============================================================================
// Heat segments: warm ice, melt (plateau), warm water, boil (plateau), warm steam.
const SEGMENTS = [
  { q: 10, dT: 20, label: "Ice warming", from: -20, plateau: false, state: "🧊 Ice" },
  { q: 33, dT: 0, label: "Melting", from: 0, plateau: true, state: "🧊💧 Melting" },
  { q: 40, dT: 100, label: "Water warming", from: 0, plateau: false, state: "💧 Water" },
  { q: 90, dT: 0, label: "Boiling", from: 100, plateau: true, state: "💧♨️ Boiling" },
  { q: 20, dT: 20, label: "Steam warming", from: 100, plateau: false, state: "♨️ Steam" },
];
const TOTAL_Q = SEGMENTS.reduce((s, x) => s + x.q, 0);
function HeatingDemo() {
  const [pct, setPct] = useState(15);
  let q = (pct / 100) * TOTAL_Q;
  let temp = -20;
  let state = "🧊 Ice";
  const curve: Array<[number, number]> = [[0, -20]];
  let acc = 0;
  for (const seg of SEGMENTS) {
    const endTemp = seg.from + seg.dT;
    if (q > seg.q) {
      curve.push([acc + seg.q, endTemp]);
      acc += seg.q;
      q -= seg.q;
      temp = endTemp;
      state = seg.state;
    } else {
      const f = seg.q === 0 ? 0 : q / seg.q;
      temp = seg.from + seg.dT * f;
      curve.push([acc + (q > 0 ? q : 0), temp]);
      state = seg.state;
      q = 0;
      break;
    }
  }
  const W = 300,
    H = 160,
    pad = 26;
  const toX = (qq: number) => pad + (qq / TOTAL_Q) * (W - 2 * pad);
  const toY = (tt: number) => H - pad - ((tt + 20) / 140) * (H - 2 * pad);
  // full reference curve
  const full: Array<[number, number]> = [[0, -20]];
  let a2 = 0;
  for (const seg of SEGMENTS) {
    a2 += seg.q;
    full.push([a2, seg.from + seg.dT]);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Add heat to ice: the temperature climbs — then <em>pauses</em> while it melts and boils.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={toY(0)} x2={W - pad} y2={toY(0)} stroke="#e0f2fe" strokeWidth={1} />
          <line x1={pad} y1={toY(100)} x2={W - pad} y2={toY(100)} stroke="#fee2e2" strokeWidth={1} />
          <polyline points={full.map(([x, y]) => `${toX(x)},${toY(y)}`).join(" ")} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" />
          <polyline points={curve.map(([x, y]) => `${toX(x)},${toY(y)}`).join(" ")} fill="none" stroke="#dc2626" strokeWidth={2.5} />
          <circle cx={toX(curve[curve.length - 1][0])} cy={toY(temp)} r={5} fill="#dc2626" />
          <text x={pad - 4} y={toY(0) + 3} textAnchor="end" fontSize="8" fill="#0369a1">0°</text>
          <text x={pad - 4} y={toY(100) + 3} textAnchor="end" fontSize="8" fill="#b91c1c">100°</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Heat added = <span className="font-bold text-rose-600">{pct}%</span>
          <input type="range" min={0} max={100} value={pct} onChange={(e) => setPct(+e.target.value)} className="mt-1 w-full accent-rose-500" />
        </label>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border-l-4 border-rose-500 bg-white p-3 text-sm">
        <span className="font-semibold text-slate-700">{state}</span>
        <span className="font-mono font-bold text-rose-600">{temp.toFixed(0)} °C</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        The flat parts are latent heat — energy breaking bonds, not raising temperature.
      </p>
    </div>
  );
}

// ============================================================================
// Demo 2: Thermal expansion
// ============================================================================
function ExpansionDemo() {
  const [dT, setDT] = useState(50);
  const alpha = 0.000012; // steel per °C
  const strain = alpha * dT * 1000; // per 1000 units, scaled for visibility
  const barW = 180 * (1 + strain * 0.5);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Heat a metal bar and it grows — that&apos;s why bridges have expansion gaps.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <svg viewBox="0 0 240 70" className="h-auto w-full">
          <rect x={20} y={30} width={barW} height={16} rx={2} fill={`hsl(${20 - dT / 4}, 80%, 55%)`} />
          <line x1={20} y1={24} x2={20} y2={52} stroke="#94a3b8" strokeWidth={1} />
          <line x1={200} y1={24} x2={200} y2={52} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="2 2" />
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Temperature rise ΔT = <span className="font-bold text-orange-600">{dT} °C</span>
          <input type="range" min={0} max={200} value={dT} onChange={(e) => setDT(+e.target.value)} className="mt-1 w-full accent-orange-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        ΔL / L = α·ΔT = <strong className="text-orange-600">{(alpha * dT * 100).toFixed(3)}%</strong>
      </div>
    </div>
  );
}

export default function ThermalPropertiesMatterVizPremium() {
  const demos: DemoTab[] = [
    { id: "heat", title: "Heating curve", emoji: "🔥", render: () => <HeatingDemo /> },
    { id: "expand", title: "Expansion", emoji: "📏", render: () => <ExpansionDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-orange-50 via-red-50 to-amber-50" />;
}
