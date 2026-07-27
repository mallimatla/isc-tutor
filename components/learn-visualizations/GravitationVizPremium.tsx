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
// Demo 1: Orbit — closer means faster
// ============================================================================
function OrbitDemo() {
  const t = useClock();
  const [r, setR] = useState(46); // orbital radius px
  const vRel = Math.sqrt(60 / r); // v ∝ 1/√r
  const period = Math.pow(r, 1.5) / 30; // T² ∝ r³ (Kepler)
  const omega = 2 / period;
  const angle = t * omega;
  const cx = 130 + r * Math.cos(angle);
  const cy = 75 + r * Math.sin(angle) * 0.7;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        A satellite&apos;s gravity IS its centripetal force. Closer orbits move faster.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 260 150" className="h-auto w-full">
          <ellipse cx={130} cy={75} rx={r} ry={r * 0.7} fill="none" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 3" />
          <circle cx={130} cy={75} r={16} fill="url(#earth)" />
          <circle cx={cx} cy={cy} r={5} fill="#0f172a" />
          <defs>
            <radialGradient id="earth">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Orbit radius r = <span className="font-bold text-blue-700">{(r / 46).toFixed(1)}×</span>
          <input type="range" min={28} max={64} value={r} onChange={(e) => setR(+e.target.value)} className="mt-1 w-full accent-blue-500" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center font-mono text-sm text-slate-700">
        <div>v = √(GM/r) = <strong className="text-blue-700">{vRel.toFixed(2)}×</strong></div>
        <div>T² ∝ r³ (Kepler)</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: How g changes with distance
// ============================================================================
function GravityFieldDemo() {
  const [pos, setPos] = useState(100); // % of Earth radius from centre
  const r = pos / 100;
  const g = r <= 1 ? r : 1 / (r * r); // inside: ∝r, outside: ∝1/r²
  const W = 300,
    H = 130;
  const cy = H - 20;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        g is strongest at the surface — weaker both above it and deep inside.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* g curve */}
          {(() => {
            const pts: string[] = [];
            for (let p = 2; p <= 260; p += 3) {
              const rr = p / 100;
              const gg = rr <= 1 ? rr : 1 / (rr * rr);
              pts.push(`${20 + p},${cy - gg * 70}`);
            }
            return <polyline points={pts.join(" ")} fill="none" stroke="#2563eb" strokeWidth={2.5} />;
          })()}
          <line x1={20 + 100} y1={20} x2={20 + 100} y2={cy} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3 3" />
          <text x={20 + 100} y={cy + 12} textAnchor="middle" fontSize="8" fill="#64748b">surface</text>
          <circle cx={20 + Math.min(pos, 260)} cy={cy - g * 70} r={4.5} fill="#1d4ed8" />
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Distance from centre = <span className="font-bold text-blue-700">{pos}% of R⊕</span>
          <input type="range" min={0} max={260} value={pos} onChange={(e) => setPos(+e.target.value)} className="mt-1 w-full accent-blue-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        g = <strong className="text-blue-700">{(g * 9.8).toFixed(2)} m/s²</strong>{" "}
        <span className="text-xs text-slate-500">({r <= 1 ? "inside: g ∝ r" : "outside: g ∝ 1/r²"})</span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Escape velocity
// ============================================================================
const BODIES = [
  { name: "Moon", ve: 2.4, emoji: "🌙" },
  { name: "Earth", ve: 11.2, emoji: "🌍" },
  { name: "Jupiter", ve: 59.5, emoji: "🪐" },
  { name: "Sun", ve: 618, emoji: "☀️" },
];
function EscapeDemo() {
  const [i, setI] = useState(1);
  const b = BODIES[i];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Throw anything faster than the escape speed and it never comes back.
      </h4>
      <div className="mb-3 flex flex-wrap justify-center gap-1.5">
        {BODIES.map((x, j) => (
          <button
            key={x.name}
            onClick={() => setI(j)}
            className={"rounded-full px-3 py-1.5 text-xs font-semibold transition " + (i === j ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100")}
          >
            {x.emoji} {x.name}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-5 text-center shadow-inner">
        <div className="text-4xl">{b.emoji}</div>
        <div className="mt-2 font-mono text-2xl font-bold text-blue-700">{b.ve} km/s</div>
        <div className="mt-1 text-xs text-slate-500">escape velocity, vₑ = √(2GM/R)</div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-blue-500 bg-white p-3 text-xs text-slate-600">
        More mass or smaller radius ⇒ higher escape speed. It doesn&apos;t depend on the mass of the
        object being launched.
      </div>
    </div>
  );
}

export default function GravitationVizPremium() {
  const demos: DemoTab[] = [
    { id: "orbit", title: "Orbits", emoji: "🛰️", render: () => <OrbitDemo /> },
    { id: "gfield", title: "g vs distance", emoji: "📉", render: () => <GravityFieldDemo /> },
    { id: "escape", title: "Escape speed", emoji: "🚀", render: () => <EscapeDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-blue-50 via-indigo-50 to-sky-50" />;
}
