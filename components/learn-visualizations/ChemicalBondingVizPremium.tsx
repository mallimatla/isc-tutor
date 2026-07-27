"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

const SHAPES = [
  { domains: 2, name: "Linear", angle: "180°", example: "CO₂" },
  { domains: 3, name: "Trigonal planar", angle: "120°", example: "BF₃" },
  { domains: 4, name: "Tetrahedral", angle: "109.5°", example: "CH₄" },
];

// ============================================================================
// Demo 1: VSEPR shapes
// ============================================================================
function VseprDemo() {
  const [di, setDi] = useState(2);
  const shape = SHAPES[di];
  const cx = 110,
    cy = 110,
    L = 70;

  // bond direction angles (degrees, 0 = up)
  let dirs: number[] = [];
  if (shape.domains === 2) dirs = [90, 270];
  else if (shape.domains === 3) dirs = [270, 30, 150];
  else dirs = [270, 30, 150, 90]; // tetrahedral projected (2D approximation)

  const bonds = dirs.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + L * Math.cos(rad), y: cy + L * Math.sin(rad) };
  });

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        VSEPR: electron domains repel and spread out as far as possible, setting the bond angle.
      </h4>
      <div className="mb-2 flex gap-1.5">
        {SHAPES.map((s, i) => (
          <button
            key={s.domains}
            onClick={() => setDi(i)}
            className={
              "flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition " +
              (i === di ? "bg-blue-600 text-white shadow" : "bg-blue-50 text-blue-700 hover:bg-blue-100")
            }
            aria-pressed={i === di}
          >
            {s.domains} domains
          </button>
        ))}
      </div>
      <div className="flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 220 220" className="h-48 w-48">
          {bonds.map((b, i) => (
            <line key={i} x1={cx} y1={cy} x2={b.x} y2={b.y} stroke="#3b82f6" strokeWidth={3} />
          ))}
          {bonds.map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r={11} fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1.5} />
          ))}
          <circle cx={cx} cy={cy} r={14} fill="#1d4ed8" />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">A</text>
          <text x={cx} y={30} textAnchor="middle" fontSize="10" fill="#1d4ed8" fontWeight="bold">{shape.angle}</text>
        </svg>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-blue-400 bg-white p-3 text-sm text-slate-700">
        <strong className="text-blue-700">{shape.name}</strong> — {shape.domains} bonding domains, angle{" "}
        <strong>{shape.angle}</strong>. Example: {shape.example}.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Ionic ↔ covalent
// ============================================================================
function IonicCovalentDemo() {
  const [den, setDen] = useState(1);
  // Pauling: percent ionic character
  const pctIonic = (1 - Math.exp(-0.25 * den * den)) * 100;
  const kind = den < 0.4 ? "Nonpolar covalent" : den <= 1.7 ? "Polar covalent" : "Largely ionic";
  const color = den < 0.4 ? "#0ea5e9" : den <= 1.7 ? "#2563eb" : "#7c3aed";
  // shared cloud shifts toward the more electronegative atom (right)
  const shift = (den / 3.3) * 26; // px toward right atom

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        The bigger the electronegativity gap, the more the shared electrons shift — covalent to ionic.
      </h4>
      <div className="flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 240 120" className="h-32 w-full">
          <circle cx={70} cy={60} r={26} fill="#e0f2fe" stroke="#0284c7" strokeWidth={2} />
          <text x={70} y={64} textAnchor="middle" fontSize="12" fill="#0369a1" fontWeight="bold">A</text>
          <circle cx={170} cy={60} r={26} fill="#ede9fe" stroke="#7c3aed" strokeWidth={2} />
          <text x={170} y={64} textAnchor="middle" fontSize="12" fill="#6d28d9" fontWeight="bold">B</text>
          <ellipse cx={120 + shift} cy={60} rx={22} ry={12} fill={color} opacity={0.35} />
          <circle cx={112 + shift} cy={60} r={4} fill={color} />
          <circle cx={128 + shift} cy={60} r={4} fill={color} />
          <text x={120} y={104} textAnchor="middle" fontSize="9" fill="#64748b">shared electron cloud</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          ΔEN = <span className="font-bold text-blue-600">{den.toFixed(1)}</span>
          <input type="range" min={0} max={3.3} step={0.1} value={den} onChange={(e) => setDen(+e.target.value)} className="mt-1 w-full accent-blue-500" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-blue-50 p-2">
          <div className="text-[10px] text-slate-500">% ionic character</div>
          <div className="text-lg font-bold text-blue-600">{pctIonic.toFixed(0)}%</div>
        </div>
        <div className="rounded-xl p-2" style={{ background: `${color}22` }}>
          <div className="text-[10px] text-slate-500">Bond type</div>
          <div className="text-sm font-bold" style={{ color }}>{kind}</div>
        </div>
      </div>
    </div>
  );
}

export default function ChemicalBondingVizPremium() {
  const demos: DemoTab[] = [
    { id: "vsepr", title: "VSEPR shapes", emoji: "📐", render: () => <VseprDemo /> },
    { id: "polarity", title: "Ionic ↔ covalent", emoji: "🔗", render: () => <IonicCovalentDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-blue-50 via-cyan-50 to-sky-50" />;
}
