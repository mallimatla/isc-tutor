"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Flame test colours
// ============================================================================
type MetalKey = "Li" | "Na" | "K" | "Ca" | "Sr" | "Ba";

const METALS: Record<MetalKey, { name: string; colour: string; fill: string; core: string }> = {
  Li: { name: "Lithium", colour: "Crimson", fill: "#dc2626", core: "#fca5a5" },
  Na: { name: "Sodium", colour: "Yellow", fill: "#f59e0b", core: "#fde68a" },
  K: { name: "Potassium", colour: "Lilac", fill: "#a855f7", core: "#e9d5ff" },
  Ca: { name: "Calcium", colour: "Brick-red", fill: "#b91c1c", core: "#f87171" },
  Sr: { name: "Strontium", colour: "Crimson-red", fill: "#e11d48", core: "#fda4af" },
  Ba: { name: "Barium", colour: "Apple-green", fill: "#65a30d", core: "#bef264" },
};

function FlameTestDemo() {
  const [key, setKey] = useState<MetalKey>("Na");
  const m = METALS[key];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Heated s-block metal ions emit light at characteristic wavelengths — the flame test identifies them by colour.
      </h4>
      <div className="flex flex-wrap justify-center gap-2">
        {(Object.keys(METALS) as MetalKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setKey(k)}
            className={
              "rounded-full px-3 py-1.5 text-sm font-semibold transition " +
              (k === key ? "bg-rose-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-rose-50")
            }
            aria-pressed={k === key}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-center rounded-2xl bg-slate-900 p-3 shadow-inner">
        <svg viewBox="0 0 140 180" className="h-48 w-40">
          {/* outer flame */}
          <path d="M 70 20 C 40 70, 30 120, 70 160 C 110 120, 100 70, 70 20 Z" fill={m.fill} opacity={0.85} />
          {/* inner flame */}
          <path d="M 70 60 C 55 90, 52 125, 70 155 C 88 125, 85 90, 70 60 Z" fill={m.core} opacity={0.9} />
          {/* burner */}
          <rect x={62} y={158} width={16} height={18} fill="#475569" />
          <rect x={54} y={174} width={32} height={6} rx={2} fill="#334155" />
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 text-center shadow-inner">
        <div className="text-sm font-bold text-slate-800">{m.name}</div>
        <div className="mt-1 text-lg font-extrabold" style={{ color: m.fill }}>{m.colour} flame</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Group 1 reactivity trend
// ============================================================================
const GROUP1 = [
  { sym: "Li", reactivity: 0.35, ie: 520, radius: 152 },
  { sym: "Na", reactivity: 0.5, ie: 496, radius: 186 },
  { sym: "K", reactivity: 0.7, ie: 419, radius: 227 },
  { sym: "Rb", reactivity: 0.85, ie: 403, radius: 248 },
  { sym: "Cs", reactivity: 1.0, ie: 376, radius: 265 },
];

function Bar({ label, valuePct, colour, sub }: { label: string; valuePct: number; colour: string; sub: string }) {
  return (
    <div className="mb-2">
      <div className="mb-0.5 flex justify-between text-[11px] text-slate-600">
        <span className="font-medium">{label}</span>
        <span className="font-mono">{sub}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${valuePct}%`, background: colour }} />
      </div>
    </div>
  );
}

function ReactivityTrendDemo() {
  const [idx, setIdx] = useState(2);
  const el = GROUP1[idx];
  // normalise for bars
  const iePct = ((520 - el.ie) / (520 - 376)) * 100; // lower IE → longer bar
  const radiusPct = ((el.radius - 152) / (265 - 152)) * 100;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Down Group 1 the outer electron sits farther out and is easier to lose — so reactivity climbs.
      </h4>
      <div className="rounded-2xl bg-white p-4 text-center shadow-inner">
        <div className="text-3xl font-extrabold text-rose-600">{el.sym}</div>
        <div className="text-xs text-slate-500">element {idx + 1} of 5 down the group</div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <Bar label="Reactivity with water" valuePct={el.reactivity * 100} colour="#e11d48" sub={idx === 0 ? "lowest" : idx === 4 ? "highest" : "rising"} />
        <Bar label="Ionisation energy" valuePct={iePct} colour="#f59e0b" sub={`${el.ie} kJ/mol`} />
        <Bar label="Atomic radius" valuePct={radiusPct} colour="#0ea5e9" sub={`${el.radius} pm`} />
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Position down Group 1: <span className="font-bold text-rose-600">{el.sym}</span>
          <input type="range" min={0} max={4} step={1} value={idx} onChange={(e) => setIdx(+e.target.value)} className="mt-1 w-full accent-rose-500" />
        </label>
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          {GROUP1.map((g) => <span key={g.sym}>{g.sym}</span>)}
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-rose-400 bg-white p-3 text-xs text-slate-600">
        Going down: atomic radius <strong>increases</strong>, ionisation energy <strong>decreases</strong>, so reactivity with water <strong>increases</strong>.
      </div>
    </div>
  );
}

export default function SBlockElementsVizPremium() {
  const demos: DemoTab[] = [
    { id: "flame", title: "Flame test", emoji: "🔥", render: () => <FlameTestDemo /> },
    { id: "trend", title: "Reactivity trend", emoji: "📈", render: () => <ReactivityTrendDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-rose-50 via-pink-50 to-red-50" />;
}
