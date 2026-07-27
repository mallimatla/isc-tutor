"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Order of reaction
// ============================================================================
function OrderDemo() {
  const [order, setOrder] = useState(1);
  const [k, setK] = useState(0.5);
  const A0 = 1;
  const W = 300;
  const H = 150;
  const pad = 28;
  const tMax = 10;
  const conc = (t: number) => {
    if (order === 0) return Math.max(0, A0 - k * t);
    if (order === 1) return A0 * Math.exp(-k * t);
    return A0 / (1 + k * A0 * t); // second order
  };
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * tMax;
    const y = H - pad - (conc(t) / A0) * (H - 2 * pad);
    const xp = pad + (t / tMax) * (W - 2 * pad);
    pts.push(`${xp},${y}`);
  }
  const law = order === 0 ? "[A] = [A]₀ − kt" : order === 1 ? "[A] = [A]₀ e^(−kt)" : "1/[A] = 1/[A]₀ + kt";
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        The order tells you how concentration falls over time — a straight drop, an exponential decay, or a slow tail.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={pts.join(" ")} fill="none" stroke="#e11d48" strokeWidth={2.5} />
          <text x={W - pad} y={H - pad + 14} textAnchor="end" fontSize="9" fill="#64748b">time →</text>
          <text x={pad - 6} y={pad + 4} textAnchor="end" fontSize="9" fill="#64748b">[A]</text>
        </svg>
      </div>
      <div className="mt-3 flex gap-2">
        {[0, 1, 2].map((o) => (
          <button
            key={o}
            onClick={() => setOrder(o)}
            className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (order === o ? "bg-slate-900 text-white" : "bg-white text-slate-600")}
          >
            Order {o}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Rate constant k = <span className="font-bold text-rose-600">{k.toFixed(2)}</span>
          <input type="range" min={0.1} max={1} step={0.05} value={k} onChange={(e) => setK(+e.target.value)} className="mt-1 w-full accent-rose-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">{law}</div>
    </div>
  );
}

// ============================================================================
// Demo 2: Activation energy
// ============================================================================
function ActivationDemo() {
  const [catalyst, setCatalyst] = useState(false);
  const [T, setT] = useState(300); // Kelvin
  const R = 8.314;
  const Ea = (catalyst ? 40 : 75) * 1000; // J/mol
  // relative rate vs a reference at 300 K without catalyst
  const rate = Math.exp(-Ea / (R * T));
  const rateRef = Math.exp(-75000 / (R * 300));
  const relRate = rate / rateRef;
  const W = 300;
  const H = 150;
  // reaction coordinate: reactant plateau, hump, product plateau
  const humpTop = catalyst ? 45 : 20;
  const path = `M20 100 L80 100 Q150 ${humpTop} 220 115 L280 115`;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Molecules must clear an energy barrier to react. A catalyst lowers it; higher temperature gives more molecules the energy to make it over.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={20} y1={H - 15} x2={W - 15} y2={H - 15} stroke="#94a3b8" strokeWidth={1.5} />
          <path d={path} fill="none" stroke="#e11d48" strokeWidth={2.5} />
          {/* Ea arrow */}
          <line x1={150} y1={100} x2={150} y2={humpTop} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
          <text x={158} y={(100 + humpTop) / 2} fontSize="9" fill="#b45309">Ea</text>
          <text x={40} y={95} fontSize="9" fill="#64748b">reactants</text>
          <text x={235} y={110} fontSize="9" fill="#64748b">products</text>
          <text x={W - 15} y={H - 3} textAnchor="end" fontSize="9" fill="#64748b">reaction coordinate →</text>
        </svg>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setCatalyst(false)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (!catalyst ? "bg-slate-900 text-white" : "bg-white text-slate-600")}
        >
          No catalyst
        </button>
        <button
          onClick={() => setCatalyst(true)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (catalyst ? "bg-slate-900 text-white" : "bg-white text-slate-600")}
        >
          With catalyst
        </button>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Temperature T = <span className="font-bold text-rose-600">{T} K</span>
          <input type="range" min={250} max={500} step={5} value={T} onChange={(e) => setT(+e.target.value)} className="mt-1 w-full accent-rose-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        k = A·e^(−Ea/RT), Ea = <strong className="text-amber-600">{(Ea / 1000).toFixed(0)} kJ/mol</strong> → relative rate ≈{" "}
        <strong className="text-rose-600">{relRate < 1000 ? relRate.toFixed(1) : relRate.toExponential(1)}×</strong>
      </div>
    </div>
  );
}

export default function ChemicalKineticsVizPremium() {
  const demos: DemoTab[] = [
    { id: "order", title: "Order of reaction", emoji: "📉", render: () => <OrderDemo /> },
    { id: "activation", title: "Activation energy", emoji: "⛰️", render: () => <ActivationDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-rose-50 via-red-50 to-orange-50" />;
}
