"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Complex geometry
// ============================================================================
interface Geo {
  id: string;
  label: string;
  cn: number;
  angle: string;
  example: string;
}
const GEOS: Geo[] = [
  { id: "tet", label: "Tetrahedral", cn: 4, angle: "109.5°", example: "[NiCl₄]²⁻" },
  { id: "sqp", label: "Square planar", cn: 4, angle: "90°", example: "[Pt(NH₃)₄]²⁺" },
  { id: "oct", label: "Octahedral", cn: 6, angle: "90°", example: "[Co(NH₃)₆]³⁺" },
];

function GeoSVG({ id }: { id: string }) {
  const cx = 100,
    cy = 90;
  const bond = (x: number, y: number) => <line x1={cx} y1={cy} x2={x} y2={y} stroke="#334155" strokeWidth={1.8} />;
  const ligand = (x: number, y: number, key: string) => (
    <g key={key}>
      {bond(x, y)}
      <circle cx={x} cy={y} r={12} fill="#c4b5fd" stroke="#6d28d9" strokeWidth={1.2} />
      <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fill="#4c1d95" fontWeight="bold">L</text>
    </g>
  );
  let ligs: [number, number][] = [];
  if (id === "tet") ligs = [[cx - 50, cy - 45], [cx + 50, cy - 45], [cx - 30, cy + 55], [cx + 30, cy + 55]];
  if (id === "sqp") ligs = [[cx - 55, cy], [cx + 55, cy], [cx, cy - 55], [cx, cy + 55]];
  if (id === "oct")
    ligs = [
      [cx, cy - 62],
      [cx, cy + 62],
      [cx - 55, cy - 18],
      [cx + 55, cy - 18],
      [cx - 35, cy + 34],
      [cx + 35, cy + 34],
    ];
  return (
    <svg viewBox="0 0 200 180" className="h-44 w-auto">
      {ligs.map((l, i) => ligand(l[0], l[1], "l" + i))}
      <circle cx={cx} cy={cy} r={15} fill="#7c3aed" stroke="#4c1d95" strokeWidth={1.5} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">M</text>
    </svg>
  );
}

function GeometryDemo() {
  const [sel, setSel] = useState(2);
  const g = GEOS[sel];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        The coordination number and geometry set how the ligands arrange around the central metal.
      </h4>
      <div className="mb-3 flex gap-1.5">
        {GEOS.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setSel(i)}
            className={"flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition " + (i === sel ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100")}
          >
            {x.cn} {x.label.split(" ")[0]}
          </button>
        ))}
      </div>
      <div className="flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <GeoSVG id={g.id} />
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 text-center shadow-inner">
        <span className="text-sm font-bold text-violet-600">{g.label}</span>
        <span className="ml-2 text-xs text-slate-600">CN {g.cn} · bond angle {g.angle}</span>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-violet-400 bg-white p-3 text-xs text-slate-600">
        Example: <span className="font-mono font-semibold text-slate-800">{g.example}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Crystal field splitting
// ============================================================================
function CrystalFieldDemo() {
  const [oct, setOct] = useState(true);
  const [delta, setDelta] = useState(50); // 0..100 relative field strength
  const W = 300,
    H = 170;
  const mid = H / 2;
  // octahedral gap larger than tetrahedral for the same field setting
  const gap = (oct ? 0.6 : 0.27) * (delta / 100) * 70;
  const lowSpin = oct && delta > 60;

  // lower set below (t2g for oct, e for tet), upper set above (eg for oct, t2 for tet)
  const lowerY = mid + gap;
  const upperY = mid - gap;
  const lowerLabel = oct ? "t₂g" : "e";
  const upperLabel = oct ? "eg" : "t₂";
  const lowerCount = oct ? 3 : 2;
  const upperCount = oct ? 2 : 3;

  const level = (y: number, n: number, startX: number, colour: string, key: string) => (
    <g key={key}>
      {Array.from({ length: n }, (_, i) => {
        const x = startX + i * 36;
        return <line key={i} x1={x} y1={y} x2={x + 26} y2={y} stroke={colour} strokeWidth={3} />;
      })}
    </g>
  );

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Ligands split the five d-orbitals. The octahedral gap Δo is larger than the tetrahedral gap Δt.
      </h4>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setOct(true)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (oct ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100")}
        >
          Octahedral
        </button>
        <button
          onClick={() => setOct(false)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (!oct ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100")}
        >
          Tetrahedral
        </button>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={30} y1={mid} x2={W - 30} y2={mid} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 4" />
          <text x={W - 30} y={mid - 4} textAnchor="end" fontSize="8" fill="#94a3b8">barycentre</text>
          {/* upper set */}
          {level(upperY, upperCount, 90, "#8b5cf6", "u")}
          <text x={70} y={upperY + 3} textAnchor="end" fontSize="10" fill="#6d28d9">{upperLabel}</text>
          {/* lower set */}
          {level(lowerY, lowerCount, 90, "#8b5cf6", "l")}
          <text x={70} y={lowerY + 3} textAnchor="end" fontSize="10" fill="#6d28d9">{lowerLabel}</text>
          {/* gap arrow */}
          <line x1={W - 80} y1={upperY} x2={W - 80} y2={lowerY} stroke="#a855f7" strokeWidth={1.2} markerEnd="url(#a)" markerStart="url(#a)" />
          <defs>
            <marker id="a" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#a855f7" />
            </marker>
          </defs>
          <text x={W - 74} y={mid + 3} fontSize="10" fill="#7c3aed" fontWeight="bold">{oct ? "Δo" : "Δt"}</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Field strength Δ = <span className="font-bold text-violet-600">{delta}</span> {delta > 60 ? "(strong field)" : "(weak field)"}
          <input type="range" min={0} max={100} step={1} value={delta} onChange={(e) => setDelta(+e.target.value)} className="mt-1 w-full accent-violet-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-violet-400 bg-white p-3 text-xs text-slate-600">
        {oct
          ? lowSpin
            ? "Strong-field octahedral: Δo beats the pairing energy, electrons pair in t₂g first — low spin."
            : "Weak-field octahedral: small Δo, electrons spread out before pairing — high spin."
          : "Tetrahedral: Δt is only about 4/9 of Δo, so it almost never exceeds the pairing energy — complexes are essentially always high spin."}
      </div>
    </div>
  );
}

export default function CoordinationCompoundsVizPremium() {
  const demos: DemoTab[] = [
    { id: "geometry", title: "Complex geometry", emoji: "🔷", render: () => <GeometryDemo /> },
    { id: "cfse", title: "Crystal field splitting", emoji: "📶", render: () => <CrystalFieldDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-violet-50 via-purple-50 to-indigo-50" />;
}
