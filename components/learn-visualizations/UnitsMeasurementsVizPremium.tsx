"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Powers of ten & SI prefixes
// ============================================================================
const PREFIXES: Record<number, { name: string; sym: string; eg: string }> = {
  [-12]: { name: "pico", sym: "p", eg: "spacing of atoms in a crystal" },
  [-9]: { name: "nano", sym: "n", eg: "width of a DNA strand" },
  [-6]: { name: "micro", sym: "µ", eg: "a human red blood cell" },
  [-3]: { name: "milli", sym: "m", eg: "thickness of a coin" },
  [0]: { name: "—", sym: "", eg: "one metre — about one big step" },
  [3]: { name: "kilo", sym: "k", eg: "a 15-minute walk" },
  [6]: { name: "mega", sym: "M", eg: "length of a big city" },
  [9]: { name: "giga", sym: "G", eg: "roughly Earth to the Moon ×2.5" },
};
const EXPS = [-12, -9, -6, -3, 0, 3, 6, 9];

function PrefixDemo() {
  const [idx, setIdx] = useState(4);
  const exp = EXPS[idx];
  const p = PREFIXES[exp];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Physics spans from atoms to galaxies. SI prefixes tame the zeros.
      </h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">scale</span>
        <input
          type="range"
          min={0}
          max={EXPS.length - 1}
          value={idx}
          onChange={(e) => setIdx(parseInt(e.target.value))}
          className="flex-1 accent-sky-500"
        />
      </div>
      <div className="rounded-2xl bg-white p-4 text-center shadow-inner">
        <div className="font-mono text-2xl font-bold text-sky-700">
          1 {p.sym}m = 10<sup>{exp}</sup> m
        </div>
        <div className="mt-1 text-sm font-semibold text-slate-700">
          {p.name === "—" ? "base unit (metre)" : `${p.name} (${p.sym})`}
        </div>
        <div className="mt-2 text-xs text-slate-500">≈ {p.eg}</div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-sky-500 bg-white p-3 text-xs text-slate-600">
        A prefix just shifts the decimal point. 5 kW = 5 × 10³ W = 5000 W.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Significant figures
// ============================================================================
const SIGFIG_SAMPLES = [
  { v: "205", sig: 3, note: "all non-zero digits count; middle zero counts too" },
  { v: "0.00450", sig: 3, note: "leading zeros don't count; the trailing zero does" },
  { v: "1200", sig: 2, note: "trailing zeros with no decimal point are ambiguous → 2" },
  { v: "12.00", sig: 4, note: "trailing zeros after a decimal point count" },
  { v: "6.02", sig: 3, note: "a clean 3-sig-fig measurement" },
];
function SigFigDemo() {
  const [i, setI] = useState(0);
  const s = SIGFIG_SAMPLES[i];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        A measurement is only as precise as its significant figures.
      </h4>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SIGFIG_SAMPLES.map((x, j) => (
          <button
            key={x.v}
            onClick={() => setI(j)}
            className={
              "rounded-full px-3 py-1.5 font-mono text-xs font-semibold transition " +
              (i === j ? "bg-sky-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100")
            }
          >
            {x.v}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-5 text-center shadow-inner">
        <div className="font-mono text-3xl font-bold text-slate-800">{s.v}</div>
        <div className="mt-2 inline-block rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-sky-700">
          {s.sig} significant figures
        </div>
        <div className="mt-2 text-xs text-slate-500">{s.note}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Dimensional formulae
// ============================================================================
const QUANTITIES = [
  { name: "Velocity", unit: "m s⁻¹", dim: "M⁰ L¹ T⁻¹" },
  { name: "Acceleration", unit: "m s⁻²", dim: "M⁰ L¹ T⁻²" },
  { name: "Force", unit: "N = kg m s⁻²", dim: "M¹ L¹ T⁻²" },
  { name: "Energy / Work", unit: "J = kg m² s⁻²", dim: "M¹ L² T⁻²" },
  { name: "Power", unit: "W = kg m² s⁻³", dim: "M¹ L² T⁻³" },
  { name: "Pressure", unit: "Pa = kg m⁻¹ s⁻²", dim: "M¹ L⁻¹ T⁻²" },
];
function DimensionDemo() {
  const [i, setI] = useState(2);
  const q = QUANTITIES[i];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Every quantity is built from Mass, Length and Time. That&apos;s its dimensional formula.
      </h4>
      <div className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {QUANTITIES.map((x, j) => (
          <button
            key={x.name}
            onClick={() => setI(j)}
            className={
              "rounded-xl px-2 py-2 text-xs font-semibold transition " +
              (i === j ? "bg-sky-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100")
            }
          >
            {x.name}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-5 text-center shadow-inner">
        <div className="text-sm text-slate-500">{q.name}</div>
        <div className="mt-1 font-mono text-2xl font-bold text-sky-700">[{q.dim}]</div>
        <div className="mt-2 font-mono text-xs text-slate-500">SI unit: {q.unit}</div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-sky-500 bg-white p-3 text-xs text-slate-600">
        Dimensions let you check any equation: both sides must have the same [M L T] powers.
      </div>
    </div>
  );
}

export default function UnitsMeasurementsVizPremium() {
  const demos: DemoTab[] = [
    { id: "prefix", title: "Powers of ten", emoji: "🔟", render: () => <PrefixDemo /> },
    { id: "sigfig", title: "Significant figures", emoji: "🎯", render: () => <SigFigDemo /> },
    { id: "dim", title: "Dimensions", emoji: "📐", render: () => <DimensionDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-sky-50 via-blue-50 to-cyan-50" />;
}
