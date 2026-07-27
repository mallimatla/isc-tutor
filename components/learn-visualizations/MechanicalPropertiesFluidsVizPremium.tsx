"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Pressure increases with depth
// ============================================================================
function DepthDemo() {
  const [h, setH] = useState(5); // depth m
  const P = 101 + 9.8 * h; // kPa (atm + ρgh, ρ≈1000)
  const diverY = 30 + (h / 20) * 100;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Dive deeper and the water above squeezes harder: P = P₀ + ρgh.
      </h4>
      <div className="rounded-2xl bg-gradient-to-b from-sky-100 to-blue-700 p-3 shadow-inner">
        <svg viewBox="0 0 260 140" className="h-auto w-full">
          <text x={130} y={44 + (h / 20) * 100 - 8} textAnchor="middle" fontSize="16">🤿</text>
          {[...Array(6)].map((_, i) => (
            <line key={i} x1={30 + i * 40} y1={diverY} x2={30 + i * 40} y2={diverY + 3 + (h / 2)} stroke="#ffffff" strokeWidth={1.5} opacity={0.5} markerEnd="" />
          ))}
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Depth h = <span className="font-bold text-blue-700">{h} m</span>
          <input type="range" min={0} max={20} value={h} onChange={(e) => setH(+e.target.value)} className="mt-1 w-full accent-blue-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        P ≈ <strong className="text-blue-700">{P.toFixed(0)} kPa</strong>{" "}
        <span className="text-xs text-slate-500">(≈ {(P / 101).toFixed(1)} atmospheres)</span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Bernoulli — narrow = fast = low pressure
// ============================================================================
function BernoulliDemo() {
  const [neck, setNeck] = useState(50); // % constriction
  const wide = 40;
  const narrow = wide * (1 - neck / 200);
  const vWide = 1;
  const vNarrow = (wide / narrow) * vWide; // continuity A1v1=A2v2
  const pDrop = (vNarrow * vNarrow - 1) * 20;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Squeeze a pipe and the fluid speeds up — and its pressure drops.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 260 110" className="h-auto w-full">
          <path
            d={`M10,${55 - wide / 2} L100,${55 - wide / 2} L160,${55 - narrow / 2} L250,${55 - narrow / 2} L250,${55 + narrow / 2} L160,${55 + narrow / 2} L100,${55 + wide / 2} L10,${55 + wide / 2} Z`}
            fill="#dbeafe"
            stroke="#60a5fa"
            strokeWidth={1.5}
          />
          {[0, 1, 2].map((i) => (
            <text key={i} x={30 + i * 20} y={58} fontSize="12" fill="#2563eb">›</text>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <text key={i} x={175 + i * 16} y={58} fontSize="12" fill="#1d4ed8" fontWeight="bold">›</text>
          ))}
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Constriction = <span className="font-bold text-blue-700">{neck}%</span>
          <input type="range" min={0} max={80} value={neck} onChange={(e) => setNeck(+e.target.value)} className="mt-1 w-full accent-blue-500" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center font-mono text-sm text-slate-700">
        <div>speed ×<strong className="text-blue-700">{vNarrow.toFixed(1)}</strong></div>
        <div>pressure <strong className="text-rose-600">↓{pDrop.toFixed(0)}%</strong></div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-blue-500 bg-white p-3 text-xs text-slate-600">
        This is why planes fly and spin makes a cricket ball swing — faster flow means lower pressure.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Buoyancy — float or sink
// ============================================================================
function BuoyancyDemo() {
  const [rho, setRho] = useState(600); // object density kg/m³ (water=1000)
  const floats = rho < 1000;
  const submerged = Math.min(1, rho / 1000); // fraction below waterline
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Less dense than water? You float — and only sink until you displace your own weight.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 200 130" className="mx-auto h-32">
          <rect x={0} y={55} width={200} height={75} fill="#bfdbfe" />
          {(() => {
            const boxH = 34;
            const waterline = 55;
            const top = floats ? waterline - boxH * (1 - submerged) : waterline + 40;
            return <rect x={82} y={top} width={36} height={boxH} rx={3} fill={floats ? "#16a34a" : "#e11d48"} />;
          })()}
          <line x1={0} y1={55} x2={200} y2={55} stroke="#3b82f6" strokeWidth={1.5} />
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Object density = <span className="font-bold text-blue-700">{rho} kg/m³</span>
          <input type="range" min={200} max={1600} step={50} value={rho} onChange={(e) => setRho(+e.target.value)} className="mt-1 w-full accent-blue-500" />
        </label>
      </div>
      <div className={"mt-3 rounded-xl border-l-4 bg-white p-3 text-sm font-semibold " + (floats ? "border-emerald-500 text-emerald-700" : "border-rose-500 text-rose-700")}>
        {floats ? `Floats — ${(submerged * 100).toFixed(0)}% submerged (like an iceberg).` : "Denser than water → sinks."}
      </div>
    </div>
  );
}

export default function MechanicalPropertiesFluidsVizPremium() {
  const demos: DemoTab[] = [
    { id: "depth", title: "Pressure & depth", emoji: "🤿", render: () => <DepthDemo /> },
    { id: "bern", title: "Bernoulli", emoji: "✈️", render: () => <BernoulliDemo /> },
    { id: "buoy", title: "Buoyancy", emoji: "🧊", render: () => <BuoyancyDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-blue-50 via-cyan-50 to-sky-50" />;
}
