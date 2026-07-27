"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// deterministic pseudo-random so SSR and client agree
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// ============================================================================
// Demo 1: Isotopes of hydrogen
// ============================================================================
type IsoKey = "protium" | "deuterium" | "tritium";

const ISOTOPES: Record<IsoKey, { name: string; symbol: string; protons: number; neutrons: number; mass: number }> = {
  protium: { name: "Protium", symbol: "¹H", protons: 1, neutrons: 0, mass: 1 },
  deuterium: { name: "Deuterium", symbol: "²H", protons: 1, neutrons: 1, mass: 2 },
  tritium: { name: "Tritium", symbol: "³H", protons: 1, neutrons: 2, mass: 3 },
};

function IsotopesDemo() {
  const [key, setKey] = useState<IsoKey>("deuterium");
  const iso = ISOTOPES[key];
  const nucleons = [
    ...Array.from({ length: iso.protons }, () => "p"),
    ...Array.from({ length: iso.neutrons }, () => "n"),
  ];
  const cx = 100,
    cy = 90;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        All hydrogen isotopes have 1 proton — they differ only in neutron count, which sets the mass number.
      </h4>
      <div className="flex justify-center gap-2">
        {(Object.keys(ISOTOPES) as IsoKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setKey(k)}
            className={
              "rounded-full px-3 py-1.5 text-sm font-semibold transition " +
              (k === key ? "bg-cyan-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-cyan-50")
            }
            aria-pressed={k === key}
          >
            {ISOTOPES[k].name}
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 200 180" className="h-44 w-56">
          {/* electron shell */}
          <circle cx={cx} cy={cy} r={70} fill="none" stroke="#bae6fd" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={cx + 70} cy={cy} r={5} fill="#0ea5e9" />
          <text x={cx + 70} y={cy - 9} textAnchor="middle" fontSize="8" fill="#0369a1">e⁻</text>
          {/* nucleus */}
          {nucleons.map((typ, i) => {
            const ang = (i / Math.max(1, nucleons.length)) * Math.PI * 2 + seeded(i + 1) * 0.6;
            const rr = nucleons.length === 1 ? 0 : 9;
            return (
              <circle
                key={i}
                cx={cx + Math.cos(ang) * rr}
                cy={cy + Math.sin(ang) * rr}
                r={9}
                fill={typ === "p" ? "#0891b2" : "#94a3b8"}
                stroke="#fff"
                strokeWidth={1.5}
              />
            );
          })}
          <text x={cx} y={cy + 55} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0e7490">{iso.symbol}</text>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-white p-2 shadow-inner">
          <div className="text-slate-500">Mass number</div>
          <div className="text-lg font-bold text-cyan-700">{iso.mass}</div>
        </div>
        <div className="rounded-xl bg-white p-2 shadow-inner">
          <div className="text-slate-500">Protons</div>
          <div className="text-lg font-bold text-cyan-700">{iso.protons}</div>
        </div>
        <div className="rounded-xl bg-white p-2 shadow-inner">
          <div className="text-slate-500">Neutrons</div>
          <div className="text-lg font-bold text-slate-500">{iso.neutrons}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Water shape — bent geometry and bond angle
// ============================================================================
function WaterShapeDemo() {
  const [angle, setAngle] = useState(104.5);
  const ox = 150,
    oy = 70;
  const bond = 70;
  const half = (angle / 2) * (Math.PI / 180);
  // H atoms placed symmetrically below O
  const h1x = ox - Math.sin(half) * bond;
  const h1y = oy + Math.cos(half) * bond;
  const h2x = ox + Math.sin(half) * bond;
  const h2y = oy + Math.cos(half) * bond;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Water is bent, not linear. Two lone pairs on oxygen squeeze the H–O–H angle below the ideal tetrahedral value.
      </h4>
      <div className="flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 170" className="h-44 w-full">
          <line x1={ox} y1={oy} x2={h1x} y2={h1y} stroke="#64748b" strokeWidth={3} />
          <line x1={ox} y1={oy} x2={h2x} y2={h2y} stroke="#64748b" strokeWidth={3} />
          {/* lone pairs on oxygen (pointing up) */}
          <circle cx={ox - 14} cy={oy - 22} r={4} fill="#38bdf8" />
          <circle cx={ox - 6} cy={oy - 26} r={4} fill="#38bdf8" />
          <circle cx={ox + 6} cy={oy - 26} r={4} fill="#38bdf8" />
          <circle cx={ox + 14} cy={oy - 22} r={4} fill="#38bdf8" />
          <text x={ox} y={oy - 32} textAnchor="middle" fontSize="8" fill="#0369a1">2 lone pairs</text>
          {/* oxygen */}
          <circle cx={ox} cy={oy} r={20} fill="#0891b2" />
          <text x={ox} y={oy + 5} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#fff">O</text>
          {/* hydrogens */}
          <circle cx={h1x} cy={h1y} r={14} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} />
          <text x={h1x} y={h1y + 5} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#334155">H</text>
          <circle cx={h2x} cy={h2y} r={14} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} />
          <text x={h2x} y={h2y + 5} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#334155">H</text>
          {/* angle arc */}
          <path d={`M ${ox - 26} ${oy + 20} A 33 33 0 0 0 ${ox + 26} ${oy + 20}`} fill="none" stroke="#0e7490" strokeWidth={1.5} />
          <text x={ox} y={oy + 46} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0e7490">{angle.toFixed(1)}°</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          H–O–H bond angle = <span className="font-bold text-cyan-600">{angle.toFixed(1)}°</span>
          <input type="range" min={90} max={120} step={0.5} value={angle} onChange={(e) => setAngle(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-cyan-400 bg-white p-3 text-xs text-slate-600">
        The real angle is <strong className="text-cyan-700">104.5°</strong>, less than the ideal tetrahedral{" "}
        <strong>109.5°</strong>, because lone-pair repulsion pushes the O–H bonds closer together.
      </div>
    </div>
  );
}

export default function HydrogenVizPremium() {
  const demos: DemoTab[] = [
    { id: "isotopes", title: "Isotopes", emoji: "⚛️", render: () => <IsotopesDemo /> },
    { id: "water", title: "Water shape", emoji: "💧", render: () => <WaterShapeDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-cyan-50 via-sky-50 to-blue-50" />;
}
