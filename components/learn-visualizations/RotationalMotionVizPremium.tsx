"use client";
import { useState, useEffect, useRef } from "react";
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

// ============================================================================
// Demo 1: Torque = r · F · sinθ
// ============================================================================
function TorqueDemo() {
  const [r, setR] = useState(70); // lever arm px
  const [deg, setDeg] = useState(90);
  const F = 1;
  const th = (deg * Math.PI) / 180;
  const torque = ((r / 70) * F * Math.sin(th)).toFixed(2);
  const px = 40 + r,
    py = 90;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Push a door far from the hinge, at 90° — that&apos;s maximum turning effect.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 150" className="h-auto w-full">
          <line x1={40} y1={90} x2={40 + r} y2={90} stroke="#94a3b8" strokeWidth={4} strokeLinecap="round" />
          <circle cx={40} cy={90} r={6} fill="#334155" />
          <line
            x1={px}
            y1={py}
            x2={px + 44 * Math.cos(th - Math.PI / 2)}
            y2={py + 44 * Math.sin(th - Math.PI / 2)}
            stroke="#e11d48"
            strokeWidth={3}
            markerEnd="url(#rot-a)"
          />
          <defs>
            <marker id="rot-a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#e11d48" />
            </marker>
          </defs>
          <text x={40} y={118} fontSize="9" fill="#64748b">hinge</text>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Lever arm r = <span className="font-bold text-indigo-700">{(r / 70).toFixed(1)}×</span>
          <input type="range" min={20} max={110} value={r} onChange={(e) => setR(+e.target.value)} className="mt-1 w-full accent-indigo-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Angle θ = <span className="font-bold text-indigo-700">{deg}°</span>
          <input type="range" min={0} max={90} value={deg} onChange={(e) => setDeg(+e.target.value)} className="mt-1 w-full accent-indigo-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        τ = r·F·sinθ = <strong className="text-indigo-700">{torque}</strong> (relative)
        {deg === 0 && <span className="ml-2 text-xs text-rose-500">θ=0 ⇒ no turn</span>}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Rolling race — moment of inertia decides the winner
// ============================================================================
const ROLLERS = [
  { name: "Sphere", emoji: "⚽", k: 0.4, color: "#16a34a" },
  { name: "Disc", emoji: "🔵", k: 0.5, color: "#2563eb" },
  { name: "Ring", emoji: "⭕", k: 1.0, color: "#e11d48" },
];
function RollingDemo() {
  const t = useClock();
  const g = 9.8,
    sinTh = 0.4;
  const loopT = 2.4;
  const tt = t % loopT;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Same ramp, same mass — the one with mass nearest its centre wins.
      </h4>
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-inner">
        {ROLLERS.map((rObj) => {
          const a = (g * sinTh) / (1 + rObj.k); // linear accel
          const dist = 0.5 * a * tt * tt;
          const frac = Math.min(1, dist / (0.5 * ((g * sinTh) / 1.4) * loopT * loopT));
          return (
            <div key={rObj.name}>
              <div className="mb-0.5 flex justify-between text-[11px] font-semibold text-slate-500">
                <span>{rObj.name}</span>
                <span>I = {rObj.k} mr²</span>
              </div>
              <div className="relative h-6 rounded-full bg-slate-100">
                <span className="absolute top-1/2 -translate-y-1/2 text-lg transition-none" style={{ left: `calc(${frac * 92}% )` }}>
                  {rObj.emoji}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-indigo-500 bg-white p-3 text-xs text-slate-600">
        a = g·sinθ / (1 + I/mr²). Smaller I ⇒ bigger acceleration. Sphere (0.4) beats disc (0.5)
        beats ring (1.0) — every time, whatever the mass.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Angular momentum — the spinning skater
// ============================================================================
function SkaterDemo() {
  const [r, setR] = useState(100); // arm extension %
  const omega = Math.pow(100 / r, 2); // ω ∝ 1/I ∝ 1/r²
  const t = useClock();
  const angle = ((t * omega * 90) % 360);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        A skater pulls their arms in and spins faster — angular momentum is conserved.
      </h4>
      <div className="flex items-center justify-center rounded-2xl bg-white p-4 shadow-inner">
        <svg viewBox="0 0 120 120" className="h-32 w-32">
          <g transform={`rotate(${angle} 60 60)`}>
            <line x1={60} y1={60} x2={60 - (r / 100) * 42} y2={60} stroke="#6366f1" strokeWidth={4} strokeLinecap="round" />
            <line x1={60} y1={60} x2={60 + (r / 100) * 42} y2={60} stroke="#6366f1" strokeWidth={4} strokeLinecap="round" />
            <circle cx={60 - (r / 100) * 42} cy={60} r={6} fill="#4338ca" />
            <circle cx={60 + (r / 100) * 42} cy={60} r={6} fill="#4338ca" />
          </g>
          <circle cx={60} cy={60} r={9} fill="#312e81" />
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Arm extension = <span className="font-bold text-indigo-700">{r}%</span>
          <input type="range" min={30} max={100} value={r} onChange={(e) => setR(+e.target.value)} className="mt-1 w-full accent-indigo-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        L = Iω = constant → spin rate ω = <strong className="text-indigo-700">{omega.toFixed(1)}×</strong>
      </div>
    </div>
  );
}

export default function RotationalMotionVizPremium() {
  const demos: DemoTab[] = [
    { id: "torque", title: "Torque", emoji: "🚪", render: () => <TorqueDemo /> },
    { id: "race", title: "Rolling race", emoji: "⚽", render: () => <RollingDemo /> },
    { id: "skater", title: "Spinning skater", emoji: "⛸️", render: () => <SkaterDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-indigo-50 via-blue-50 to-violet-50" />;
}
