"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Inclined plane with friction (free-body diagram)
// ============================================================================
function InclineDemo() {
  const [deg, setDeg] = useState(25);
  const [mu, setMu] = useState(0.4);
  const th = (deg * Math.PI) / 180;
  const mg = 40; // pixel length representing weight
  const driving = mg * Math.sin(th); // mg sinθ
  const maxStatic = mu * mg * Math.cos(th); // μ mg cosθ
  const slides = driving > maxStatic + 0.01;
  const friction = slides ? maxStatic : driving;

  const W = 300,
    H = 180,
    pivotX = 255,
    pivotY = 150,
    L = 205;
  const topX = pivotX - L * Math.cos(th);
  const topY = pivotY - L * Math.sin(th);
  const bx = pivotX - (L / 2) * Math.cos(th);
  const by = pivotY - (L / 2) * Math.sin(th);
  // unit vectors
  const upSlope = { x: -Math.cos(th), y: -Math.sin(th) };
  const normal = { x: Math.sin(th), y: -Math.cos(th) };
  const arrow = (dx: number, dy: number, len: number) => ({ x: bx + dx * len, y: by + dy * len });
  const wEnd = { x: bx, y: by + mg };
  const nEnd = arrow(normal.x, normal.y, mg * Math.cos(th));
  const fEnd = arrow(upSlope.x, upSlope.y, friction);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Tilt the ramp. Gravity pulls down the slope; friction resists — until it can&apos;t.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <polygon points={`${pivotX},${pivotY} ${topX},${topY} ${topX},${pivotY}`} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} />
          {/* block */}
          <rect x={bx - 9} y={by - 9} width={18} height={18} rx={2} transform={`rotate(${deg} ${bx} ${by})`} fill={slides ? "#e11d48" : "#0284c7"} />
          {/* weight (down) */}
          <line x1={bx} y1={by} x2={wEnd.x} y2={wEnd.y} stroke="#334155" strokeWidth={2} markerEnd="url(#lm-w)" />
          {/* normal */}
          <line x1={bx} y1={by} x2={nEnd.x} y2={nEnd.y} stroke="#16a34a" strokeWidth={2} markerEnd="url(#lm-n)" />
          {/* friction */}
          {friction > 1 && (
            <line x1={bx} y1={by} x2={fEnd.x} y2={fEnd.y} stroke="#d97706" strokeWidth={2} markerEnd="url(#lm-f)" />
          )}
          <defs>
            {[
              ["lm-w", "#334155"],
              ["lm-n", "#16a34a"],
              ["lm-f", "#d97706"],
            ].map(([id, c]) => (
              <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={c} />
              </marker>
            ))}
          </defs>
        </svg>
        <div className="flex justify-center gap-3 text-[10px] font-semibold">
          <span className="text-slate-600">■ weight mg</span>
          <span className="text-green-600">■ normal N</span>
          <span className="text-amber-600">■ friction f</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Angle θ = <span className="font-bold text-sky-700">{deg}°</span>
          <input type="range" min={5} max={60} value={deg} onChange={(e) => setDeg(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Friction µ = <span className="font-bold text-sky-700">{mu.toFixed(1)}</span>
          <input type="range" min={0} max={1} step={0.1} value={mu} onChange={(e) => setMu(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
      </div>
      <div className={"mt-3 rounded-xl border-l-4 bg-white p-3 text-xs " + (slides ? "border-rose-500 text-rose-700" : "border-emerald-500 text-emerald-700")}>
        {slides
          ? `mg·sinθ > µ·mg·cosθ → the block SLIDES down.`
          : `mg·sinθ ≤ µ·mg·cosθ → friction holds it STILL. It starts to slip at θ ≈ ${(Math.atan(mu) * 180 / Math.PI).toFixed(0)}°.`}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: F = m·a
// ============================================================================
function FmaDemo() {
  const [F, setF] = useState(12);
  const [m, setM] = useState(3);
  const a = F / m;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Newton&apos;s 2nd law: the same push moves a light cart faster than a heavy one.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="relative h-14">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl" style={{ transform: `translateX(${Math.min(220, a * 22)}px) translateY(-50%)`, transition: "transform 0.3s" }}>
            📦
          </div>
        </div>
        <div className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-500">
          <span className="text-rose-600">force</span>
          <div className="h-1.5 rounded-full bg-rose-400" style={{ width: `${F * 4}px` }} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Force F = <span className="font-bold text-sky-700">{F} N</span>
          <input type="range" min={2} max={30} value={F} onChange={(e) => setF(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Mass m = <span className="font-bold text-sky-700">{m} kg</span>
          <input type="range" min={1} max={10} value={m} onChange={(e) => setM(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-lg text-slate-800">
        a = F / m = <strong className="text-sky-700">{a.toFixed(2)} m/s²</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Newton's third law (recoil)
// ============================================================================
function RecoilDemo() {
  const [ratio, setRatio] = useState(3); // heavy/light mass ratio
  const vLight = 1;
  const vHeavy = vLight / ratio; // equal & opposite momentum
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Every action has an equal and opposite reaction. Momentum is shared, not created.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="flex items-center justify-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-3xl" style={{ transform: `translateX(${-vHeavy * 40}px)`, transition: "transform 0.3s" }}>🛥️</span>
            <span className="mt-1 text-[10px] text-slate-500">heavy — slow</span>
          </div>
          <span className="text-xl text-slate-300">↔</span>
          <div className="flex flex-col items-center">
            <span className="text-2xl" style={{ transform: `translateX(${vLight * 40}px)`, transition: "transform 0.3s" }}>🏀</span>
            <span className="mt-1 text-[10px] text-slate-500">light — fast</span>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Mass ratio (heavy : light) = <span className="font-bold text-sky-700">{ratio} : 1</span>
          <input type="range" min={1} max={6} value={ratio} onChange={(e) => setRatio(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        m₁v₁ = m₂v₂ → heavier object recoils <strong className="text-sky-700">{ratio}×</strong> slower.
      </div>
    </div>
  );
}

export default function LawsOfMotionVizPremium() {
  const demos: DemoTab[] = [
    { id: "incline", title: "Incline & friction", emoji: "⛰️", render: () => <InclineDemo /> },
    { id: "fma", title: "F = ma", emoji: "📦", render: () => <FmaDemo /> },
    { id: "recoil", title: "Action–reaction", emoji: "🚀", render: () => <RecoilDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-blue-50 via-slate-50 to-sky-50" />;
}
