"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// deterministic pseudo-random so SSR and client agree
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// ============================================================================
// Demo 1: Boyle's law — P × V = constant
// ============================================================================
function BoyleDemo() {
  const [p, setP] = useState(1);
  const k = 4; // P·V constant (atm·L)
  const v = k / p; // L, ranges 1..8
  const N = 22;
  const colW = 110;
  const colMaxH = 130;
  const colH = (v / 8) * colMaxH; // gas column height ∝ V
  const topY = 10 + (colMaxH - colH);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Boyle{"'"}s law: at constant temperature, squeezing the gas (more P) shrinks its volume.
      </h4>
      <div className="flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 140 160" className="h-40 w-40">
          <rect x={15} y={8} width={colW} height={colMaxH + 4} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={2} rx={3} />
          <rect x={17} y={topY} width={colW - 4} height={colH} fill="#e0f2fe" />
          <rect x={13} y={topY - 8} width={colW + 4} height={8} fill="#64748b" rx={2} />
          {Array.from({ length: N }, (_, i) => {
            const px = 22 + seeded(i * 2 + 1) * (colW - 14);
            const py = topY + 4 + seeded(i * 2 + 2) * Math.max(6, colH - 8);
            return <circle key={i} cx={px} cy={py} r={3} fill="#0284c7" />;
          })}
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Pressure P = <span className="font-bold text-sky-600">{p.toFixed(1)} atm</span>
          <input type="range" min={0.5} max={4} step={0.1} value={p} onChange={(e) => setP(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        V = k/P = <strong className="text-sky-600">{v.toFixed(2)} L</strong> · P × V ={" "}
        <strong className="text-sky-600">{(p * v).toFixed(2)}</strong> (constant)
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Charles's law — V / T = constant
// ============================================================================
function CharlesDemo() {
  const [tK, setTK] = useState(300);
  const ratio = 0.02; // V/T constant (L/K)
  const v = ratio * tK; // L, 2..10
  const N = 22;
  const colW = 110;
  const colMaxH = 130;
  const colH = (v / 10) * colMaxH;
  const topY = 10 + (colMaxH - colH);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Charles{"'"}s law: at constant pressure, heating the gas makes it expand — volume rises with T.
      </h4>
      <div className="flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 140 160" className="h-40 w-40">
          <rect x={15} y={8} width={colW} height={colMaxH + 4} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={2} rx={3} />
          <rect x={17} y={topY} width={colW - 4} height={colH} fill={`hsl(${210 - (tK - 100) / 4}, 80%, 90%)`} />
          <rect x={13} y={topY - 8} width={colW + 4} height={8} fill="#64748b" rx={2} />
          {Array.from({ length: N }, (_, i) => {
            const px = 22 + seeded(i * 2 + 1) * (colW - 14);
            const py = topY + 4 + seeded(i * 2 + 2) * Math.max(6, colH - 8);
            return <circle key={i} cx={px} cy={py} r={3} fill="#4f46e5" />;
          })}
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Temperature T = <span className="font-bold text-sky-600">{tK} K</span>
          <input type="range" min={100} max={500} step={10} value={tK} onChange={(e) => setTK(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        V ∝ T → V = <strong className="text-sky-600">{v.toFixed(2)} L</strong> · V / T ={" "}
        <strong className="text-sky-600">{(v / tK).toFixed(3)}</strong> (constant)
      </div>
    </div>
  );
}

export default function StatesOfMatterVizPremium() {
  const demos: DemoTab[] = [
    { id: "boyle", title: "Boyle's law", emoji: "🎈", render: () => <BoyleDemo /> },
    { id: "charles", title: "Charles's law", emoji: "🌡️", render: () => <CharlesDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-sky-50 via-blue-50 to-indigo-50" />;
}
