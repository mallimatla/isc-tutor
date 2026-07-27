"use client";
import { useState, type ReactNode } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Carbon allotropes
// ============================================================================
type AlloKey = "diamond" | "graphite" | "fullerene";

function DiamondSVG() {
  const c = "#0f172a";
  return (
    <svg viewBox="0 0 160 140" className="h-40 w-44">
      {/* central carbon with 4 tetrahedral bonds */}
      <line x1={80} y1={70} x2={80} y2={30} stroke="#64748b" strokeWidth={2} />
      <line x1={80} y1={70} x2={40} y2={95} stroke="#64748b" strokeWidth={2} />
      <line x1={80} y1={70} x2={120} y2={95} stroke="#64748b" strokeWidth={2} />
      <line x1={80} y1={70} x2={80} y2={115} stroke="#64748b" strokeWidth={2} />
      {[[80, 30], [40, 95], [120, 95], [80, 115]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={9} fill={c} />
      ))}
      <circle cx={80} cy={70} r={11} fill="#334155" />
    </svg>
  );
}

function GraphiteSVG() {
  const rows = [30, 70, 110];
  return (
    <svg viewBox="0 0 160 140" className="h-40 w-44">
      {rows.map((y, r) => (
        <g key={r}>
          <line x1={20} y1={y} x2={140} y2={y} stroke="#94a3b8" strokeWidth={1} strokeDasharray="2 4" />
          {[30, 55, 80, 105, 130].map((x, i) => (
            <circle key={i} cx={x} cy={y} r={7} fill="#0f172a" />
          ))}
          {[30, 55, 80, 105].map((x, i) => (
            <line key={i} x1={x} y1={y} x2={x + 25} y2={y} stroke="#334155" strokeWidth={2} />
          ))}
        </g>
      ))}
    </svg>
  );
}

function FullereneSVG() {
  const cx = 80,
    cy = 70,
    R = 46;
  const pts = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
  });
  return (
    <svg viewBox="0 0 160 140" className="h-40 w-44">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
      {pts.map(([x, y], i) => {
        const [nx, ny] = pts[(i + 1) % 12];
        return <line key={"e" + i} x1={x} y1={y} x2={nx} y2={ny} stroke="#334155" strokeWidth={1.5} />;
      })}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill="#0f172a" />
      ))}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#475569">C₆₀</text>
    </svg>
  );
}

const ALLOTROPES: Record<AlloKey, { name: string; property: string; render: () => ReactNode }> = {
  diamond: { name: "Diamond", property: "Rigid 3-D tetrahedral network — the hardest natural material; electrical insulator.", render: () => <DiamondSVG /> },
  graphite: { name: "Graphite", property: "Flat layers that slide over each other — soft and slippery, and conducts electricity.", render: () => <GraphiteSVG /> },
  fullerene: { name: "Fullerene (C₆₀)", property: "Closed cage molecule of 60 carbons — a discrete molecular solid, not a giant lattice.", render: () => <FullereneSVG /> },
};

function AllotropesDemo() {
  const [key, setKey] = useState<AlloKey>("diamond");
  const a = ALLOTROPES[key];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Same element, different bonding arrangement — carbon allotropes have very different properties.
      </h4>
      <div className="flex justify-center gap-2">
        {(Object.keys(ALLOTROPES) as AlloKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setKey(k)}
            className={
              "rounded-full px-3 py-1.5 text-sm font-semibold transition " +
              (k === key ? "bg-slate-800 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100")
            }
            aria-pressed={k === key}
          >
            {ALLOTROPES[k].name}
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        {a.render()}
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 text-center shadow-inner">
        <div className="text-sm font-bold text-slate-800">{a.name}</div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-slate-400 bg-white p-3 text-xs text-slate-600">
        {a.property}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Inert pair effect down Group 14
// ============================================================================
const GROUP14 = [
  { sym: "C", plus4: 0.95, note: "+4 strongly preferred; +2 is rare and reducing." },
  { sym: "Si", plus4: 0.9, note: "+4 dominates almost entirely." },
  { sym: "Ge", plus4: 0.75, note: "+4 usual, but +2 starts to appear." },
  { sym: "Sn", plus4: 0.5, note: "+2 and +4 both common; Sn²⁺ is a reducing agent." },
  { sym: "Pb", plus4: 0.2, note: "+2 is the stable state; Pb⁴⁺ is a strong oxidiser." },
];

function InertPairDemo() {
  const [idx, setIdx] = useState(0);
  const el = GROUP14[idx];
  const plus4Pct = el.plus4 * 100;
  const plus2Pct = 100 - plus4Pct;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        The inert pair effect: down Group 14 the outer s-electrons stay paired and inert, so the +2 state grows more stable than +4.
      </h4>
      <div className="rounded-2xl bg-white p-4 text-center shadow-inner">
        <div className="text-3xl font-extrabold text-slate-700">{el.sym}</div>
        <div className="text-xs text-slate-500">element {idx + 1} of 5 down the group</div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <div className="mb-1 flex justify-between text-[11px] text-slate-600">
          <span className="font-medium">Stability of +4 state</span>
          <span className="font-mono">{plus4Pct.toFixed(0)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full transition-all" style={{ width: `${plus4Pct}%`, background: "#0ea5e9" }} />
        </div>
        <div className="mt-3 mb-1 flex justify-between text-[11px] text-slate-600">
          <span className="font-medium">Stability of +2 state</span>
          <span className="font-mono">{plus2Pct.toFixed(0)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full transition-all" style={{ width: `${plus2Pct}%`, background: "#f43f5e" }} />
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Position down Group 14: <span className="font-bold text-slate-700">{el.sym}</span>
          <input type="range" min={0} max={4} step={1} value={idx} onChange={(e) => setIdx(+e.target.value)} className="mt-1 w-full accent-slate-500" />
        </label>
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          {GROUP14.map((g) => <span key={g.sym}>{g.sym}</span>)}
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-slate-400 bg-white p-3 text-xs text-slate-600">
        {el.note}
      </div>
    </div>
  );
}

export default function PBlockElements11VizPremium() {
  const demos: DemoTab[] = [
    { id: "allotropes", title: "Carbon allotropes", emoji: "💎", render: () => <AllotropesDemo /> },
    { id: "inertpair", title: "Inert pair effect", emoji: "📉", render: () => <InertPairDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-slate-50 via-zinc-50 to-slate-100" />;
}
