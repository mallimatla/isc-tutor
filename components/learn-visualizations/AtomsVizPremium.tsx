"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

const E = (n: number) => -13.6 / (n * n); // eV

// ============================================================================
// Demo 1: Bohr transitions → photons
// ============================================================================
function TransitionDemo() {
  const [ni, setNi] = useState(3);
  const [nf, setNf] = useState(2);
  const dE = E(ni) - E(nf); // >0 emitted
  const emit = ni > nf;
  const energy = Math.abs(dE);
  // rough visible colour for Balmer-ish energies
  const wl = 1240 / energy; // nm
  const colour =
    wl > 620 ? "#dc2626" : wl > 560 ? "#f59e0b" : wl > 490 ? "#16a34a" : wl > 430 ? "#2563eb" : "#7c3aed";
  const levelY = (n: number) => 20 + (1 - 1 / (n * n)) * 110;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        An electron dropping between levels spits out a photon — its colour is fixed by the energy gap.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 260 150" className="h-auto w-full">
          {[1, 2, 3, 4, 5].map((n) => (
            <g key={n}>
              <line x1={30} y1={levelY(n)} x2={180} y2={levelY(n)} stroke="#e2e8f0" strokeWidth={1.5} />
              <text x={20} y={levelY(n) + 3} fontSize="9" fill="#94a3b8">n={n}</text>
            </g>
          ))}
          {emit && (
            <>
              <line x1={100} y1={levelY(ni)} x2={100} y2={levelY(nf)} stroke={colour} strokeWidth={2.5} markerEnd="url(#at-a)" />
              <circle cx={100} cy={levelY(ni)} r={5} fill="#0f172a" />
              {[...Array(4)].map((_, i) => (
                <line key={i} x1={190 + i * 12} y1={levelY(nf) - 6 + i * 4} x2={200 + i * 12} y2={levelY(nf) - 10 + i * 4} stroke={colour} strokeWidth={2} />
              ))}
            </>
          )}
          <defs>
            <marker id="at-a" markerWidth="8" markerHeight="8" refX="4" refY="6" orient="auto"><path d="M0,0 L4,6 L8,0 Z" fill={colour} /></marker>
          </defs>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          From level nᵢ = <span className="font-bold text-blue-700">{ni}</span>
          <input type="range" min={2} max={5} value={ni} onChange={(e) => setNi(Math.max(+e.target.value, nf + 1))} className="mt-1 w-full accent-blue-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          To level n_f = <span className="font-bold text-blue-700">{nf}</span>
          <input type="range" min={1} max={4} value={nf} onChange={(e) => setNf(Math.min(+e.target.value, ni - 1))} className="mt-1 w-full accent-blue-500" />
        </label>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border-l-4 bg-white p-3 text-sm" style={{ borderColor: colour }}>
        <span className="font-semibold text-slate-700">photon energy</span>
        <span className="font-mono font-bold" style={{ color: colour }}>{energy.toFixed(2)} eV · λ≈{wl.toFixed(0)} nm</span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Hydrogen spectral series
// ============================================================================
const SERIES = [
  { name: "Lyman", to: 1, region: "ultraviolet", color: "#7c3aed" },
  { name: "Balmer", to: 2, region: "visible", color: "#16a34a" },
  { name: "Paschen", to: 3, region: "infrared", color: "#dc2626" },
];
function SeriesDemo() {
  const [i, setI] = useState(1);
  const s = SERIES[i];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        All jumps ending on the same level form one &quot;series&quot; of spectral lines.
      </h4>
      <div className="mb-3 flex justify-center gap-2">
        {SERIES.map((x, j) => (
          <button key={x.name} onClick={() => setI(j)} className={"rounded-full px-4 py-1.5 text-xs font-semibold transition " + (i === j ? "text-white" : "bg-white text-slate-600 hover:bg-slate-100")} style={i === j ? { background: x.color } : {}}>
            {x.name}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-slate-900 p-4 shadow-inner">
        <div className="flex justify-around">
          {[6, 5, 4, 3].map((n) => n > s.to && (
            <div key={n} className="h-14 w-1 rounded" style={{ background: s.color, opacity: 1 - (n - s.to) * 0.12 }} />
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 bg-white p-3 text-xs text-slate-600" style={{ borderColor: s.color }}>
        The <strong>{s.name}</strong> series (jumps down to n={s.to}) lands in the {s.region}. Balmer is
        the one we can actually see.
      </div>
    </div>
  );
}

export default function AtomsVizPremium() {
  const demos: DemoTab[] = [
    { id: "trans", title: "Energy jumps", emoji: "⚛️", render: () => <TransitionDemo /> },
    { id: "series", title: "Spectral series", emoji: "🌈", render: () => <SeriesDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-blue-50 via-indigo-50 to-violet-50" />;
}
