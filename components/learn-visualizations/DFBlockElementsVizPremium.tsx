"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Colours of aqueous transition-metal ions
// ============================================================================
interface IonColour {
  ion: string;
  name: string;
  colour: string; // hex fill for the test tube
  label: string;
}
const IONS: IonColour[] = [
  { ion: "Cu²⁺", name: "copper(II)", colour: "#3b82f6", label: "blue" },
  { ion: "Fe²⁺", name: "iron(II)", colour: "#86efac", label: "pale green" },
  { ion: "Fe³⁺", name: "iron(III)", colour: "#ca8a04", label: "yellow/brown" },
  { ion: "Mn²⁺", name: "manganese(II)", colour: "#fbcfe8", label: "pale pink" },
  { ion: "Ni²⁺", name: "nickel(II)", colour: "#22c55e", label: "green" },
  { ion: "Cr³⁺", name: "chromium(III)", colour: "#7c3aed", label: "green/violet" },
  { ion: "MnO₄⁻", name: "permanganate", colour: "#6b21a8", label: "deep purple" },
];

function IonColourDemo() {
  const [sel, setSel] = useState(0);
  const ion = IONS[sel];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Pick an ion and see the colour of its aqueous solution.
      </h4>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {IONS.map((x, i) => (
          <button
            key={x.ion}
            onClick={() => setSel(i)}
            className={"rounded-full px-2.5 py-1.5 text-xs font-semibold transition " + (i === sel ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100")}
          >
            {x.ion}
          </button>
        ))}
      </div>
      <div className="flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 120 180" className="h-44 w-auto">
          {/* test tube */}
          <path d="M46 12 L46 150 A14 14 0 0 0 74 150 L74 12" fill="none" stroke="#94a3b8" strokeWidth={2.5} />
          {/* liquid */}
          <path d="M48 70 L48 150 A12 12 0 0 0 72 150 L72 70 Z" fill={ion.colour} opacity={0.85} />
          <ellipse cx={60} cy={70} rx={12} ry={3} fill={ion.colour} />
          <rect x={44} y={8} width={32} height={6} rx={2} fill="#cbd5e1" />
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 text-center shadow-inner">
        <span className="font-mono text-lg font-bold text-purple-600">{ion.ion}</span>
        <span className="ml-2 text-xs text-slate-600">{ion.name} — {ion.label}</span>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-purple-400 bg-white p-3 text-xs text-slate-600">
        The colour comes from d–d transitions: an electron absorbs part of visible light to jump between split d-orbitals, and the transmitted light gives the observed colour.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Oxidation states across the 3d series
// ============================================================================
interface Elem {
  sym: string;
  name: string;
  states: number[];
  max: number;
}
const SERIES: Elem[] = [
  { sym: "Sc", name: "scandium", states: [3], max: 3 },
  { sym: "Ti", name: "titanium", states: [2, 3, 4], max: 4 },
  { sym: "V", name: "vanadium", states: [2, 3, 4, 5], max: 5 },
  { sym: "Cr", name: "chromium", states: [2, 3, 6], max: 6 },
  { sym: "Mn", name: "manganese", states: [2, 3, 4, 6, 7], max: 7 },
  { sym: "Fe", name: "iron", states: [2, 3], max: 3 },
  { sym: "Co", name: "cobalt", states: [2, 3], max: 3 },
  { sym: "Ni", name: "nickel", states: [2, 3], max: 3 },
  { sym: "Cu", name: "copper", states: [1, 2], max: 2 },
  { sym: "Zn", name: "zinc", states: [2], max: 2 },
];

function OxStateDemo() {
  const [idx, setIdx] = useState(4); // Mn
  const el = SERIES[idx];
  const W = 300,
    H = 160,
    pad = 26;
  const bw = (W - 2 * pad) / SERIES.length;
  const maxState = 7;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        The highest oxidation state rises to the middle of the series — manganese reaches +7 — then falls.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          {SERIES.map((e, i) => {
            const bh = (e.max / maxState) * (H - 2 * pad);
            const x = pad + i * bw + bw * 0.12;
            const y = H - pad - bh;
            const on = i === idx;
            return (
              <g key={e.sym}>
                <rect x={x} y={y} width={bw * 0.76} height={bh} rx={2} fill={on ? "#9333ea" : "#e9d5ff"} />
                <text x={x + bw * 0.38} y={H - pad + 11} textAnchor="middle" fontSize="7.5" fill="#64748b">{e.sym}</text>
                <text x={x + bw * 0.38} y={y - 3} textAnchor="middle" fontSize="7.5" fill={on ? "#9333ea" : "#a78bfa"} fontWeight="bold">+{e.max}</text>
              </g>
            );
          })}
          <text x={pad - 4} y={pad} textAnchor="end" fontSize="9" fill="#64748b">max state</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Element: <span className="font-bold text-purple-600">{el.sym}</span> ({el.name})
          <input type="range" min={0} max={SERIES.length - 1} step={1} value={idx} onChange={(e) => setIdx(+e.target.value)} className="mt-1 w-full accent-purple-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-purple-400 bg-white p-3 text-xs text-slate-600">
        Common oxidation states of {el.name}: <span className="font-semibold text-slate-800">{el.states.map((s) => "+" + s).join(", ")}</span>. Higher states use both 4s and 3d electrons for bonding.
      </div>
    </div>
  );
}

export default function DFBlockElementsVizPremium() {
  const demos: DemoTab[] = [
    { id: "colours", title: "Ion colours", emoji: "🎨", render: () => <IonColourDemo /> },
    { id: "oxstates", title: "Oxidation states", emoji: "📊", render: () => <OxStateDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-purple-50 via-fuchsia-50 to-pink-50" />;
}
