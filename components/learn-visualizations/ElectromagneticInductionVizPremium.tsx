"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Magnet through a coil — Faraday & Lenz
// ============================================================================
function FaradayDemo() {
  const [pos, setPos] = useState(20); // magnet position %
  // EMF ∝ rate of change of flux. We approximate the induced effect by how
  // close the magnet is to the coil centre (strongest change while passing through).
  const dist = Math.abs(pos - 50);
  const emf = Math.max(0, 30 - dist) * Math.sign(50 - pos);
  const glow = Math.min(1, Math.abs(emf) / 25);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Move a magnet through a coil and it drives a current — from nothing but motion.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 260 110" className="h-auto w-full">
          {/* coil */}
          {[...Array(5)].map((_, i) => (
            <ellipse key={i} cx={130 + i * 8 - 16} cy={55} rx={7} ry={26} fill="none" stroke={`rgba(217,119,6,${0.4 + glow * 0.6})`} strokeWidth={2} />
          ))}
          {/* bulb */}
          <circle cx={220} cy={30} r={11} fill={`rgba(250,204,21,${0.15 + glow})`} stroke="#eab308" strokeWidth={1.5} />
          <line x1={150} y1={40} x2={209} y2={33} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={150} y1={70} x2={214} y2={40} stroke="#94a3b8" strokeWidth={1.5} />
          {/* magnet */}
          <g transform={`translate(${(pos / 100) * 200 - 20} 0)`}>
            <rect x={0} y={46} width={22} height={18} rx={2} fill="#e11d48" />
            <rect x={22} y={46} width={22} height={18} rx={2} fill="#2563eb" />
          </g>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Slide the magnet through the coil = <span className="font-bold text-orange-600">{pos}%</span>
          <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(+e.target.value)} className="mt-1 w-full accent-orange-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        EMF = −dΦ/dt {Math.abs(emf) > 3 ? <strong className="text-orange-600">current flows {emf > 0 ? "→" : "←"}</strong> : <span className="text-slate-400">still ⇒ no current</span>}
      </div>
      <div className="mt-2 text-xs text-slate-500">
        Faster motion (steeper flux change) ⇒ bigger EMF. Stop moving and the current dies instantly.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Motional EMF (rod on rails)
// ============================================================================
function MotionalDemo() {
  const [v, setV] = useState(4);
  const [B, setB] = useState(5);
  const L = 2;
  const emf = B * L * v;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Slide a rod across a magnetic field and its free electrons pile up — a battery from motion.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 260 110" className="h-auto w-full">
          {[...Array(15)].map((_, i) =>
            [...Array(4)].map((_, j) => (
              <circle key={`${i}-${j}`} cx={20 + i * 16} cy={25 + j * 20} r={1.5} fill="#cbd5e1" />
            ))
          )}
          <line x1={20} y1={25} x2={240} y2={25} stroke="#334155" strokeWidth={2} />
          <line x1={20} y1={85} x2={240} y2={85} stroke="#334155" strokeWidth={2} />
          <line x1={20} y1={25} x2={20} y2={85} stroke="#334155" strokeWidth={2} />
          <line x1={60 + v * 8} y1={20} x2={60 + v * 8} y2={90} stroke="#0891b2" strokeWidth={4} />
          <text x={130} y={102} textAnchor="middle" fontSize="8" fill="#64748b">• field out of page — rod moves right →</text>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Speed v = <span className="font-bold text-cyan-700">{v} m/s</span>
          <input type="range" min={1} max={10} value={v} onChange={(e) => setV(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Field B = <span className="font-bold text-cyan-700">{B}</span>
          <input type="range" min={1} max={10} value={B} onChange={(e) => setB(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        EMF = B·L·v = <strong className="text-cyan-700">{emf.toFixed(0)} V</strong> (relative)
      </div>
    </div>
  );
}

export default function ElectromagneticInductionVizPremium() {
  const demos: DemoTab[] = [
    { id: "faraday", title: "Magnet & coil", emoji: "🧲", render: () => <FaradayDemo /> },
    { id: "motional", title: "Rod on rails", emoji: "🛤️", render: () => <MotionalDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-orange-50 via-amber-50 to-cyan-50" />;
}
