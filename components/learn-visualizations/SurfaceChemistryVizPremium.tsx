"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// deterministic pseudo-random so SSR and client agree
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// ============================================================================
// Demo 1: Freundlich adsorption isotherm
// ============================================================================
const K = 2.5;
const NF = 2; // 1/n = 0.5
const P_MAX = 100;
const XM_MAX = K * Math.pow(P_MAX, 1 / NF);

function IsothermDemo() {
  const [p, setP] = useState(20);
  const xm = K * Math.pow(p, 1 / NF);
  const coverage = xm / XM_MAX;

  const W = 300,
    H = 160,
    pad = 26;
  const pts: string[] = [];
  for (let pp = 0; pp <= P_MAX; pp += 2) {
    const v = K * Math.pow(pp, 1 / NF);
    const x = pad + (pp / P_MAX) * (W - 2 * pad);
    const y = H - pad - (v / XM_MAX) * (H - 2 * pad);
    pts.push(`${x},${y}`);
  }
  const mx = pad + (p / P_MAX) * (W - 2 * pad);
  const my = H - pad - (xm / XM_MAX) * (H - 2 * pad);

  const sites = 16;
  const stuck = Math.round(coverage * sites);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Raise the pressure and more gas sticks to the surface — until the surface saturates and the curve flattens.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={pts.join(" ")} fill="none" stroke="#c026d3" strokeWidth={2.5} />
          <line x1={mx} y1={pad} x2={mx} y2={H - pad} stroke="#f0abfc" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={mx} cy={my} r={4} fill="#c026d3" />
          <text x={W - pad} y={H - pad + 14} textAnchor="end" fontSize="9" fill="#64748b">pressure →</text>
          <text x={pad - 6} y={pad + 4} textAnchor="end" fontSize="9" fill="#64748b">x/m</text>
        </svg>
      </div>
      <div className="mt-3 flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 220 120" className="h-32 w-full max-w-xs">
          {/* floating gas molecules, denser at higher p */}
          {Array.from({ length: 18 }, (_, i) => {
            const show = seeded(i + 1) < p / P_MAX + 0.15;
            if (!show) return null;
            const gx = 12 + seeded(i * 2 + 3) * 196;
            const gy = 8 + seeded(i * 2 + 4) * 60;
            return <circle key={`g${i}`} cx={gx} cy={gy} r={3} fill="#e879f9" opacity={0.75} />;
          })}
          {/* the solid surface */}
          <rect x={6} y={96} width={208} height={18} fill="#a21caf" rx={3} />
          {/* adsorbed molecules on sites */}
          {Array.from({ length: sites }, (_, i) => {
            const sx = 14 + (i / (sites - 1)) * 192;
            const on = i < stuck;
            return <circle key={`s${i}`} cx={sx} cy={on ? 90 : 90} r={4} fill={on ? "#c026d3" : "#e5e7eb"} stroke="#a21caf" strokeWidth={on ? 0 : 1} />;
          })}
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Pressure p = <span className="font-bold text-fuchsia-600">{p}</span> — coverage {(coverage * 100).toFixed(0)}%
          <input type="range" min={1} max={P_MAX} step={1} value={p} onChange={(e) => setP(+e.target.value)} className="mt-1 w-full accent-fuchsia-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        x/m = k·p^(1/n) = <strong className="text-fuchsia-600">{xm.toFixed(2)}</strong>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-fuchsia-400 bg-white p-3 text-xs text-slate-600">
        With 1/n between 0 and 1 the amount adsorbed grows less than proportionally with pressure, so the surface eventually saturates.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Tyndall effect — true solution vs colloid
// ============================================================================
function TyndallDemo() {
  const [colloid, setColloid] = useState(true);
  const W = 300,
    H = 150;
  const beamY = H / 2;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        A colloid scatters the light beam so you can see its path — a true solution does not.
      </h4>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setColloid(false)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (!colloid ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100")}
        >
          True solution
        </button>
        <button
          onClick={() => setColloid(true)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (colloid ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100")}
        >
          Colloid
        </button>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" style={{ background: "#0f172a", borderRadius: 8 }}>
          {/* beaker */}
          <rect x={70} y={20} width={160} height={110} fill="#1e293b" stroke="#475569" strokeWidth={2} rx={6} />
          {/* light source */}
          <circle cx={30} cy={beamY} r={10} fill="#fde047" />
          <text x={30} y={beamY + 26} textAnchor="middle" fontSize="8" fill="#94a3b8">torch</text>
          {/* incoming beam */}
          <line x1={40} y1={beamY} x2={70} y2={beamY} stroke="#fde047" strokeWidth={3} />
          {/* beam through liquid */}
          {colloid ? (
            <>
              <line x1={70} y1={beamY} x2={230} y2={beamY} stroke="#fef08a" strokeWidth={3} opacity={0.85} />
              {Array.from({ length: 34 }, (_, i) => {
                const dx = 78 + seeded(i + 5) * 144;
                const dy = 28 + seeded(i * 3 + 2) * 94;
                const r = 1 + seeded(i * 5 + 1) * 1.6;
                return <circle key={i} cx={dx} cy={dy} r={r} fill="#fef9c3" opacity={0.8} />;
              })}
            </>
          ) : (
            <line x1={70} y1={beamY} x2={230} y2={beamY} stroke="#fde047" strokeWidth={2} opacity={0.18} />
          )}
          <text x={150} y={124} textAnchor="middle" fontSize="9" fill="#cbd5e1">{colloid ? "colloid — beam visible" : "true solution — no scattering"}</text>
        </svg>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-fuchsia-400 bg-white p-3 text-xs text-slate-600">
        {colloid
          ? "Colloidal particles (1–1000 nm) are big enough to scatter visible light, making the beam path glow — the Tyndall effect."
          : "In a true solution the particles are too small to scatter light, so the beam passes through unseen."}
      </div>
    </div>
  );
}

export default function SurfaceChemistryVizPremium() {
  const demos: DemoTab[] = [
    { id: "isotherm", title: "Adsorption isotherm", emoji: "📈", render: () => <IsothermDemo /> },
    { id: "tyndall", title: "Tyndall effect", emoji: "🔦", render: () => <TyndallDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-fuchsia-50 via-purple-50 to-violet-50" />;
}
