"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Addition polymerisation — ethene to polythene
// ============================================================================
function AdditionDemo() {
  const [n, setN] = useState(3);
  const unitW = 46;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Ethene monomers (CH₂=CH₂) click together end to end. Add more and watch the chain grow.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 110" className="h-auto w-full">
          {/* free monomer floating above */}
          <g transform="translate(120,14)">
            <text x={0} y={5} fontSize="11" fill="#94a3b8">CH₂</text>
            <line x1={24} y1={0} x2={40} y2={0} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={24} y1={4} x2={40} y2={4} stroke="#94a3b8" strokeWidth={1.5} />
            <text x={42} y={5} fontSize="11" fill="#94a3b8">CH₂</text>
          </g>
          {/* growing chain */}
          <g transform="translate(10,65)">
            <text x={-6} y={5} fontSize="13" fill="#334155">−</text>
            {Array.from({ length: n }).map((_, i) => {
              const x = 6 + i * unitW;
              return (
                <g key={i} transform={`translate(${x},0)`}>
                  <rect x={-2} y={-14} width={unitW - 4} height={28} rx={5} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.3} />
                  <text x={(unitW - 6) / 2} y={5} textAnchor="middle" fontSize="9" fill="#1e40af" fontWeight={600}>
                    CH₂−CH₂
                  </text>
                </g>
              );
            })}
            <text x={6 + n * unitW} y={5} fontSize="13" fill="#334155">−</text>
          </g>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Monomers added: <span className="font-bold text-blue-600">{n}</span>
          <input
            type="range"
            min={1}
            max={6}
            step={1}
            value={n}
            onChange={(e) => setN(+e.target.value)}
            className="mt-1 w-full accent-blue-500"
          />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        n CH₂=CH₂ → <strong className="text-blue-600">−(CH₂−CH₂)ₙ−</strong> (n = {n})
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-blue-400 bg-white p-3 text-xs text-slate-600">
        In addition polymerisation the C=C double bonds simply open and join up. No small molecule is
        lost — every atom of the monomer ends up in the polythene chain.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Condensation polymerisation — releases water each join
// ============================================================================
function CondensationDemo() {
  const [units, setUnits] = useState(2);
  // each new repeat unit beyond the first releases one water; joining n units = n-1 links...
  // For nylon-6,6 amide bonds: water released equals number of amide links formed.
  const water = units; // number of amide links shown (each join releases H₂O)
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        In nylon-6,6, a diamine and a diacid join — and every new amide bond spits out a water.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 120" className="h-auto w-full">
          <g transform="translate(6,50)">
            {Array.from({ length: units }).map((_, i) => {
              const x = i * 92;
              return (
                <g key={i} transform={`translate(${x},0)`}>
                  {/* diamine block */}
                  <rect x={0} y={-14} width={40} height={28} rx={5} fill="#e0e7ff" stroke="#6366f1" strokeWidth={1.2} />
                  <text x={20} y={4} textAnchor="middle" fontSize="8" fill="#3730a3" fontWeight={600}>−NH−</text>
                  {/* amide link */}
                  <text x={46} y={4} textAnchor="middle" fontSize="10" fill="#dc2626" fontWeight={700}>CO</text>
                  {/* diacid block */}
                  <rect x={56} y={-14} width={40} height={28} rx={5} fill="#cffafe" stroke="#06b6d4" strokeWidth={1.2} />
                  <text x={76} y={4} textAnchor="middle" fontSize="8" fill="#155e75" fontWeight={600}>−CO−</text>
                  {/* water leaving */}
                  <text x={48} y={-24} textAnchor="middle" fontSize="9" fill="#0ea5e9">H₂O ↑</text>
                </g>
              );
            })}
          </g>
          <text x={150} y={108} textAnchor="middle" fontSize="9" fill="#94a3b8">amide (−CO−NH−) linkages</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Repeat units joined: <span className="font-bold text-cyan-600">{units}</span>
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={units}
            onChange={(e) => setUnits(+e.target.value)}
            className="mt-1 w-full accent-blue-500"
          />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center font-mono text-sm">
        <div className="rounded-xl bg-white p-2 text-slate-700 shadow-inner">
          Units: <strong className="text-cyan-600">{units}</strong>
        </div>
        <div className="rounded-xl bg-white p-2 text-slate-700 shadow-inner">
          H₂O released: <strong className="text-blue-600">{water}</strong>
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-indigo-400 bg-white p-3 text-xs text-slate-600">
        Unlike addition, condensation polymerisation loses a small molecule (water) at every new bond.
        Nylon-6,6 forms from hexamethylenediamine and adipic acid, linked by amide (−CO−NH−) groups.
      </div>
    </div>
  );
}

export default function PolymersVizPremium() {
  const demos: DemoTab[] = [
    { id: "addition", title: "Addition polymerisation", emoji: "⛓️", render: () => <AdditionDemo /> },
    { id: "condensation", title: "Condensation", emoji: "💧", render: () => <CondensationDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-blue-50 via-indigo-50 to-violet-50" />;
}
