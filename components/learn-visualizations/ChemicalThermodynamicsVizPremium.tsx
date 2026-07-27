"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Enthalpy diagram
// ============================================================================
function EnthalpyDemo() {
  const [exo, setExo] = useState(true);
  const W = 300,
    H = 170,
    pad = 30;
  const reactY = exo ? 60 : 130;
  const prodY = exo ? 130 : 60;
  const peakY = Math.min(reactY, prodY) - 30;
  const x0 = pad,
    x1 = W - pad;
  const xa = x0 + 40; // reactant plateau end
  const xb = x1 - 40; // product plateau start
  const xm = (xa + xb) / 2;
  const path = `M ${x0} ${reactY} L ${xa} ${reactY} Q ${xm} ${peakY} ${xb} ${prodY} L ${x1} ${prodY}`;
  const dH = exo ? -184 : 178; // kJ/mol (illustrative)

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Energy-level diagrams show the activation hump and whether energy is released or absorbed.
      </h4>
      <div className="mb-2 flex gap-1.5">
        <button
          onClick={() => setExo(true)}
          className={"flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition " + (exo ? "bg-red-600 text-white shadow" : "bg-red-50 text-red-700 hover:bg-red-100")}
          aria-pressed={exo}
        >
          Exothermic
        </button>
        <button
          onClick={() => setExo(false)}
          className={"flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition " + (!exo ? "bg-orange-600 text-white shadow" : "bg-orange-50 text-orange-700 hover:bg-orange-100")}
          aria-pressed={!exo}
        >
          Endothermic
        </button>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - 20} x2={W - pad} y2={H - 20} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={pad} y1={20} x2={pad} y2={H - 20} stroke="#94a3b8" strokeWidth={1.5} />
          <path d={path} fill="none" stroke="#dc2626" strokeWidth={2.5} />
          <text x={x0 + 4} y={reactY - 6} fontSize="9" fill="#475569">reactants</text>
          <text x={x1 - 4} y={prodY - 6} textAnchor="end" fontSize="9" fill="#475569">products</text>
          <line x1={xb + 14} y1={reactY} x2={xb + 14} y2={prodY} stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#ah)" />
          <defs>
            <marker id="ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#f59e0b" />
            </marker>
          </defs>
          <text x={xb + 20} y={(reactY + prodY) / 2} fontSize="9" fill="#b45309">ΔH</text>
          <text x={W - pad} y={H - 6} textAnchor="end" fontSize="8" fill="#64748b">reaction progress →</text>
        </svg>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-red-400 bg-white p-3 text-sm text-slate-700">
        {exo ? "Exothermic" : "Endothermic"}: ΔH = <strong className="text-red-600">{dH > 0 ? "+" : ""}{dH} kJ/mol</strong>.{" "}
        {exo ? "Products sit lower — energy is released." : "Products sit higher — energy is absorbed."}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Spontaneity — ΔG = ΔH − TΔS
// ============================================================================
function SpontaneityDemo() {
  const [dH, setDH] = useState(-100); // kJ/mol
  const [dS, setDS] = useState(50); // J/(K·mol)
  const [tK, setTK] = useState(298); // K
  const dG = dH - (tK * dS) / 1000; // kJ/mol
  const spontaneous = dG < 0;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Gibbs free energy decides spontaneity: ΔG = ΔH − TΔS. Negative ΔG means it goes on its own.
      </h4>
      <div className="rounded-2xl p-3 shadow-inner" style={{ background: spontaneous ? "#dcfce7" : "#fee2e2" }}>
        <div className="text-center">
          <div className="text-[11px] font-medium text-slate-500">ΔG = ΔH − TΔS</div>
          <div className={"text-3xl font-bold " + (spontaneous ? "text-green-600" : "text-red-600")}>
            {dG > 0 ? "+" : ""}{dG.toFixed(1)} kJ/mol
          </div>
          <div className={"text-sm font-semibold " + (spontaneous ? "text-green-700" : "text-red-700")}>
            {spontaneous ? "Spontaneous (ΔG < 0)" : "Non-spontaneous (ΔG > 0)"}
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          ΔH = <span className="font-bold text-red-600">{dH} kJ/mol</span>
          <input type="range" min={-200} max={200} step={10} value={dH} onChange={(e) => setDH(+e.target.value)} className="mt-1 w-full accent-red-500" />
        </label>
        <label className="mt-2 block text-xs font-medium text-slate-600">
          ΔS = <span className="font-bold text-orange-600">{dS} J/(K·mol)</span>
          <input type="range" min={-150} max={150} step={5} value={dS} onChange={(e) => setDS(+e.target.value)} className="mt-1 w-full accent-orange-500" />
        </label>
        <label className="mt-2 block text-xs font-medium text-slate-600">
          T = <span className="font-bold text-amber-600">{tK} K</span>
          <input type="range" min={100} max={1000} step={10} value={tK} onChange={(e) => setTK(+e.target.value)} className="mt-1 w-full accent-amber-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-red-400 bg-white p-3 text-xs text-slate-600">
        When ΔH and ΔS share a sign, temperature flips spontaneity: raising T can favour an endothermic
        reaction with +ΔS, or shut down an exothermic one with −ΔS.
      </div>
    </div>
  );
}

export default function ChemicalThermodynamicsVizPremium() {
  const demos: DemoTab[] = [
    { id: "enthalpy", title: "Enthalpy diagram", emoji: "📊", render: () => <EnthalpyDemo /> },
    { id: "gibbs", title: "Spontaneity", emoji: "🔥", render: () => <SpontaneityDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-red-50 via-orange-50 to-amber-50" />;
}
