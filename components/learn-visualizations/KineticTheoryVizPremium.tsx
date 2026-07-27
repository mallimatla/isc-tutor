"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

function useClock() {
  const [t, setT] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      if (start.current === null) start.current = now;
      setT((now - start.current) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

// deterministic pseudo-random so SSR and client agree
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
// triangle wave in [0,1] for frictionless wall bouncing
function tri(u: number) {
  const f = ((u % 2) + 2) % 2;
  return f < 1 ? f : 2 - f;
}

// ============================================================================
// Demo 1: Molecules in a box — temperature is average speed
// ============================================================================
function GasBoxDemo() {
  const t = useClock();
  const [T, setT_] = useState(300); // K
  const speed = Math.sqrt(T / 300); // v_rms ∝ √T
  const N = 26;
  const mol = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => ({
        px: seeded(i * 2 + 1),
        py: seeded(i * 2 + 2),
        vx: (seeded(i * 3 + 5) - 0.5) * 2,
        vy: (seeded(i * 3 + 7) - 0.5) * 2,
      })),
    []
  );
  const box = 150;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Temperature is just how fast the molecules jiggle. Heat it up — they fly faster.
      </h4>
      <div className="flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${box} ${box}`} className="h-40 w-40" style={{ background: `hsl(${220 - T / 12}, 70%, 96%)`, borderRadius: 8 }}>
          <rect x={2} y={2} width={box - 4} height={box - 4} fill="none" stroke="#94a3b8" strokeWidth={2} rx={4} />
          {mol.map((m, i) => {
            const x = 8 + tri(m.px * 2 + m.vx * t * speed) * (box - 16);
            const y = 8 + tri(m.py * 2 + m.vy * t * speed) * (box - 16);
            return <circle key={i} cx={x} cy={y} r={3.5} fill="#dc2626" />;
          })}
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Temperature T = <span className="font-bold text-red-600">{T} K</span> ({(T - 273).toFixed(0)} °C)
          <input type="range" min={100} max={900} step={10} value={T} onChange={(e) => setT_(+e.target.value)} className="mt-1 w-full accent-red-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        ½m⟨v²⟩ = (3/2)kT → v_rms ∝ √T = <strong className="text-red-600">{speed.toFixed(2)}×</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Maxwell speed distribution
// ============================================================================
function DistributionDemo() {
  const [T, setT_] = useState(300);
  const scale = Math.sqrt(300 / T); // higher T → curve stretches right & flattens
  const W = 300,
    H = 150,
    pad = 24;
  // Maxwell-Boltzmann shape: f(v) ∝ v² exp(−v²/a²)
  const a = 60 / scale;
  const f = (v: number) => (v * v) * Math.exp(-(v * v) / (a * a));
  let fmax = 0;
  for (let v = 0; v < 260; v += 2) fmax = Math.max(fmax, f(v));
  const pts: string[] = [];
  for (let v = 0; v <= 260; v += 3) pts.push(`${pad + (v / 260) * (W - 2 * pad)},${H - pad - (f(v) / fmax) * (H - 2 * pad)}`);
  const vmp = a; // most probable speed
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Not every molecule moves at the same speed — they spread out. Heat shifts the peak right.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={pts.join(" ")} fill="none" stroke="#dc2626" strokeWidth={2.5} />
          <line x1={pad + (vmp / 260) * (W - 2 * pad)} y1={pad} x2={pad + (vmp / 260) * (W - 2 * pad)} y2={H - pad} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
          <text x={W - pad} y={H - pad + 14} textAnchor="end" fontSize="9" fill="#64748b">speed →</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Temperature = <span className="font-bold text-red-600">{T} K</span>
          <input type="range" min={150} max={900} step={10} value={T} onChange={(e) => setT_(+e.target.value)} className="mt-1 w-full accent-red-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-amber-400 bg-white p-3 text-xs text-slate-600">
        The dashed line is the most probable speed. Hotter gas → taller, broader spread pushed to
        higher speeds.
      </div>
    </div>
  );
}

export default function KineticTheoryVizPremium() {
  const demos: DemoTab[] = [
    { id: "box", title: "Molecules", emoji: "🔴", render: () => <GasBoxDemo /> },
    { id: "dist", title: "Speed spread", emoji: "🔔", render: () => <DistributionDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-red-50 via-rose-50 to-orange-50" />;
}
