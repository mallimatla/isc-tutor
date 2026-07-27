"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Bar-magnet field & a swinging compass
// ============================================================================
function CompassDemo() {
  const [angle, setAngle] = useState(30); // where the compass sits (deg around magnet)
  const rad = (angle * Math.PI) / 180;
  const cx = 130 + 70 * Math.cos(rad);
  const cy = 70 + 50 * Math.sin(rad);
  // needle points along field ≈ tangent-ish; approximate by pointing away from N pole
  const needle = Math.atan2(cy - 70, cx - 60) * (180 / Math.PI);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        A compass needle lines up with the field — that&apos;s how we &quot;see&quot; magnetism.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 260 140" className="h-auto w-full">
          <rect x={60} y={60} width={60} height={20} rx={3} fill="#e11d48" />
          <rect x={120} y={60} width={60} height={20} rx={3} fill="#2563eb" />
          <text x={90} y={74} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">N</text>
          <text x={150} y={74} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">S</text>
          {[-40, -20, 20, 40].map((off) => (
            <path key={off} d={`M60,70 C110,${70 + off} 130,${70 + off} 180,70`} fill="none" stroke="#cbd5e1" strokeWidth={1} />
          ))}
          <g transform={`translate(${cx} ${cy}) rotate(${needle})`}>
            <polygon points="-10,0 10,0 6,-3 6,3" fill="#0f172a" />
            <line x1={-10} y1={0} x2={12} y2={0} stroke="#0f172a" strokeWidth={2} />
          </g>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Move the compass around = <span className="font-bold text-slate-700">{angle}°</span>
          <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} className="mt-1 w-full accent-slate-600" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-slate-500 bg-white p-3 text-xs text-slate-600">
        Field lines run N → S outside the magnet. Earth itself is a giant bar magnet — that&apos;s why
        compasses point north.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Hysteresis loop
// ============================================================================
function HysteresisDemo() {
  const [H, setH] = useState(0); // applied field, -100..100
  // B lags H → S-shaped loop. Approximate with tanh + offset by direction of travel.
  const B = Math.tanh(H / 40) * 80;
  const W = 260,
    Hpx = 150,
    cx = W / 2,
    cy = Hpx / 2;
  const toX = (h: number) => cx + (h / 100) * 100;
  const toY = (b: number) => cy - (b / 100) * 60;
  const upper: string[] = [];
  const lower: string[] = [];
  for (let h = -100; h <= 100; h += 4) {
    upper.push(`${toX(h)},${toY(Math.tanh((h + 30) / 40) * 80)}`);
    lower.push(`${toX(h)},${toY(Math.tanh((h - 30) / 40) * 80)}`);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Magnetise iron and it &quot;remembers&quot; — its magnetism lags behind the field. That loop stores data.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${Hpx}`} className="h-auto w-full">
          <line x1={20} y1={cy} x2={W - 20} y2={cy} stroke="#e2e8f0" strokeWidth={1} />
          <line x1={cx} y1={15} x2={cx} y2={Hpx - 15} stroke="#e2e8f0" strokeWidth={1} />
          <polyline points={upper.join(" ")} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={lower.join(" ")} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
          <circle cx={toX(H)} cy={toY(B)} r={5} fill="#7c3aed" />
          <text x={W - 22} y={cy - 4} fontSize="8" fill="#64748b">H</text>
          <text x={cx + 4} y={22} fontSize="8" fill="#64748b">B</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Applied field H = <span className="font-bold text-violet-700">{H}</span>
          <input type="range" min={-100} max={100} value={H} onChange={(e) => setH(+e.target.value)} className="mt-1 w-full accent-violet-500" />
        </label>
      </div>
      <div className="mt-3 text-center text-xs text-slate-500">
        The gap (coercivity + retentivity) is why permanent magnets and hard-drive bits hold their state.
      </div>
    </div>
  );
}

export default function MagnetismMatterVizPremium() {
  const demos: DemoTab[] = [
    { id: "compass", title: "Compass & field", emoji: "🧭", render: () => <CompassDemo /> },
    { id: "hyst", title: "Hysteresis", emoji: "🔁", render: () => <HysteresisDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-slate-50 via-violet-50 to-blue-50" />;
}
