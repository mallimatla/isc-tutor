"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Greenhouse effect
// ============================================================================
function GreenhouseDemo() {
  const [co2, setCo2] = useState(400); // ppm
  // qualitative warming above a pre-industrial baseline of 14 C at 280 ppm
  const deltaT = ((co2 - 280) / 280) * 5.5;
  const temp = 14 + deltaT;
  // fraction of outgoing IR trapped grows with CO2
  const trapped = Math.min(0.85, 0.25 + (co2 - 280) / 600);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Sunlight warms the Earth; the surface re-radiates infrared. More CO₂ traps more of it, so the surface warms.
      </h4>
      <div className="rounded-2xl bg-gradient-to-b from-sky-100 to-emerald-50 p-3 shadow-inner">
        <svg viewBox="0 0 300 160" className="h-auto w-full">
          {/* sun */}
          <circle cx={40} cy={30} r={16} fill="#f59e0b" />
          {/* incoming sunlight */}
          <line x1={52} y1={42} x2={140} y2={120} stroke="#f59e0b" strokeWidth={2.5} markerEnd="url(#sunArrow)" />
          {/* Earth surface */}
          <rect x={0} y={128} width={300} height={32} fill="#16a34a" opacity={0.75} />
          <text x={150} y={150} textAnchor="middle" fontSize="10" fill="#065f46">Earth surface</text>
          {/* atmosphere band */}
          <rect x={0} y={70} width={300} height={22} fill="#10b981" opacity={trapped * 0.5} />
          <text x={150} y={84} textAnchor="middle" fontSize="9" fill="#065f46">CO₂ layer</text>
          {/* outgoing IR that escapes */}
          <line x1={175} y1={125} x2={230} y2={20} stroke="#dc2626" strokeWidth={2} opacity={1 - trapped} markerEnd="url(#irArrow)" />
          {/* re-radiated IR back down */}
          <line x1={200} y1={90} x2={170} y2={126} stroke="#dc2626" strokeWidth={2.5} strokeDasharray="4 3" opacity={trapped} markerEnd="url(#irArrow)" />
          <defs>
            <marker id="sunArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
            </marker>
            <marker id="irArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#dc2626" />
            </marker>
          </defs>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Atmospheric CO₂ = <span className="font-bold text-green-600">{co2} ppm</span>
          <input type="range" min={280} max={560} step={5} value={co2} onChange={(e) => setCo2(+e.target.value)} className="mt-1 w-full accent-green-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        Est. surface temperature ≈ <strong className="text-green-600">{temp.toFixed(1)} °C</strong>{" "}
        ({deltaT >= 0 ? "+" : ""}
        {deltaT.toFixed(1)} °C vs pre-industrial)
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Ozone depletion by CFC-derived chlorine
// ============================================================================
function OzoneDemo() {
  const [cfc, setCfc] = useState(3); // arbitrary units
  // one Cl radical destroys many O3 molecules catalytically
  const thickness = Math.max(12, 100 - cfc * 12);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        UV light splits a CFC, freeing a chlorine radical that destroys ozone again and again.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 130" className="h-auto w-full">
          {/* CFC molecule releasing Cl */}
          <circle cx={40} cy={35} r={14} fill="#64748b" />
          <text x={40} y={39} textAnchor="middle" fontSize="9" fill="#fff">CFC</text>
          <text x={40} y={62} textAnchor="middle" fontSize="9" fill="#64748b">+ UV</text>
          <line x1={54} y1={35} x2={92} y2={35} stroke="#16a34a" strokeWidth={1.5} markerEnd="url(#ozArrow)" />
          <circle cx={108} cy={35} r={12} fill="#22c55e" />
          <text x={108} y={39} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">Cl·</text>
          {/* catalytic cycle */}
          <text x={210} y={30} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="bold">Cl + O₃ → ClO + O₂</text>
          <text x={210} y={50} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="bold">ClO + O → Cl + O₂</text>
          <text x={210} y={70} textAnchor="middle" fontSize="9" fill="#16a34a">Cl regenerated → keeps going</text>
          {/* ozone layer thickness bar */}
          <rect x={20} y={95} width={260} height={20} fill="#e2e8f0" rx={4} />
          <rect x={20} y={95} width={(thickness / 100) * 260} height={20} fill="#3b82f6" rx={4} />
          <text x={150} y={109} textAnchor="middle" fontSize="9" fill="#1e3a8a">O₃ layer</text>
          <defs>
            <marker id="ozArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#16a34a" />
            </marker>
          </defs>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          CFC released = <span className="font-bold text-green-600">{cfc} units</span>
          <input type="range" min={0} max={7} step={1} value={cfc} onChange={(e) => setCfc(+e.target.value)} className="mt-1 w-full accent-green-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-400 bg-white p-3 text-xs text-slate-600">
        Chlorine acts as a catalyst: it is regenerated each cycle, so a single Cl atom can break down thousands of O₃ molecules, thinning the protective ozone layer.
      </div>
    </div>
  );
}

export default function EnvironmentalChemistryVizPremium() {
  const demos: DemoTab[] = [
    { id: "greenhouse", title: "Greenhouse effect", emoji: "🌡️", render: () => <GreenhouseDemo /> },
    { id: "ozone", title: "Ozone depletion", emoji: "🕳️", render: () => <OzoneDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-green-50 via-emerald-50 to-teal-50" />;
}
