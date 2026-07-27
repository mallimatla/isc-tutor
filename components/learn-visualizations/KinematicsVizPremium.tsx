"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

const g = 9.8;

// ============================================================================
// Demo 1: Projectile motion (the star)
// ============================================================================
function ProjectileDemo() {
  const [u, setU] = useState(20); // launch speed m/s
  const [deg, setDeg] = useState(45); // angle
  const th = (deg * Math.PI) / 180;
  const T = (2 * u * Math.sin(th)) / g;
  const R = (u * u * Math.sin(2 * th)) / g;
  const H = (u * u * Math.sin(th) * Math.sin(th)) / (2 * g);

  // Build trajectory points in physics coords, then scale to the SVG box.
  const N = 40;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= N; i++) {
    const t = (T * i) / N;
    pts.push([u * Math.cos(th) * t, u * Math.sin(th) * t - 0.5 * g * t * t]);
  }
  const W = 320,
    Hpx = 180,
    pad = 14,
    ground = Hpx - 20;
  const sx = (W - 2 * pad) / Math.max(R, 1);
  const sy = (ground - pad) / Math.max(H, 1);
  const toX = (x: number) => pad + x * sx;
  const toY = (y: number) => ground - y * sy;
  const path = pts.map(([x, y]) => `${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join(" ");
  const apexIdx = Math.round(N / 2);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Throw at an angle — gravity bends the path into a parabola.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${Hpx}`} className="h-auto w-full">
          <line x1={pad} y1={ground} x2={W - pad} y2={ground} stroke="#cbd5e1" strokeWidth={2} />
          <polyline points={path} fill="none" stroke="#0284c7" strokeWidth={2.5} strokeLinecap="round" />
          {/* apex marker */}
          <circle cx={toX(pts[apexIdx][0])} cy={toY(pts[apexIdx][1])} r={3.5} fill="#f59e0b" />
          {/* launch velocity arrow */}
          <line
            x1={toX(0)}
            y1={toY(0)}
            x2={toX(0) + 34 * Math.cos(th)}
            y2={toY(0) - 34 * Math.sin(th)}
            stroke="#e11d48"
            strokeWidth={2.5}
            markerEnd="url(#kin-arrow)"
          />
          {/* projectile at landing */}
          <circle cx={toX(R)} cy={toY(0)} r={5} fill="#0284c7" />
          <defs>
            <marker id="kin-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#e11d48" />
            </marker>
          </defs>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Speed u = <span className="font-bold text-sky-700">{u} m/s</span>
          <input type="range" min={5} max={40} value={u} onChange={(e) => setU(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Angle θ = <span className="font-bold text-sky-700">{deg}°</span>
          <input type="range" min={10} max={80} value={deg} onChange={(e) => setDeg(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Range" value={`${R.toFixed(1)} m`} />
        <Stat label="Max height" value={`${H.toFixed(1)} m`} />
        <Stat label="Time of flight" value={`${T.toFixed(2)} s`} />
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-amber-400 bg-white p-3 text-xs text-slate-600">
        Range is largest at <strong>θ = 45°</strong> (try it). Complementary angles like 30° and
        60° give the <strong>same range</strong>.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-2 shadow-inner">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-mono text-sm font-bold text-slate-800">{value}</div>
    </div>
  );
}

// ============================================================================
// Demo 2: velocity-time graph → displacement is the area
// ============================================================================
function VtGraphDemo() {
  const [u, setU] = useState(4);
  const [a, setA] = useState(2);
  const tMax = 6;
  const vMax = 30;
  const W = 300,
    H = 170,
    pad = 26;
  const toX = (t: number) => pad + (t / tMax) * (W - 2 * pad);
  const toY = (v: number) => H - pad - (v / vMax) * (H - 2 * pad);
  const vEnd = u + a * tMax;
  const s = u * tMax + 0.5 * a * tMax * tMax;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        On a v–t graph, the slope is acceleration and the area is distance.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <polygon
            points={`${toX(0)},${toY(0)} ${toX(0)},${toY(u)} ${toX(tMax)},${toY(vEnd)} ${toX(tMax)},${toY(0)}`}
            fill="#bae6fd"
            opacity={0.7}
          />
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={toX(0)} y1={toY(u)} x2={toX(tMax)} y2={toY(vEnd)} stroke="#0284c7" strokeWidth={2.5} />
          <text x={W - pad} y={H - pad + 14} textAnchor="end" fontSize="9" fill="#64748b">time →</text>
          <text x={pad - 6} y={pad} textAnchor="end" fontSize="9" fill="#64748b">v</text>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Initial u = <span className="font-bold text-sky-700">{u} m/s</span>
          <input type="range" min={0} max={12} value={u} onChange={(e) => setU(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Accel a = <span className="font-bold text-sky-700">{a} m/s²</span>
          <input type="range" min={0} max={3} step={0.5} value={a} onChange={(e) => setA(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        s = ut + ½at² = <strong className="text-sky-700">{s.toFixed(1)} m</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: braking distance (real-world stopping)
// ============================================================================
function BrakingDemo() {
  const [v, setV] = useState(20); // m/s
  const [a, setA] = useState(6); // decel m/s²
  const d = (v * v) / (2 * a);
  const t = v / a;
  const frac = Math.min(1, d / 90);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        An EV slams the brakes. How far before it stops? v² = u² − 2as.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="relative h-8 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all" style={{ width: `${frac * 100}%` }} />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-lg">🚗</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Speed = <span className="font-bold text-sky-700">{v} m/s</span> ({(v * 3.6).toFixed(0)} km/h)
          <input type="range" min={5} max={35} value={v} onChange={(e) => setV(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Braking = <span className="font-bold text-sky-700">{a} m/s²</span>
          <input type="range" min={2} max={10} value={a} onChange={(e) => setA(+e.target.value)} className="mt-1 w-full accent-sky-500" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <Stat label="Stopping distance" value={`${d.toFixed(1)} m`} />
        <Stat label="Time to stop" value={`${t.toFixed(2)} s`} />
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-amber-400 bg-white p-3 text-xs text-slate-600">
        Double the speed → <strong>four times</strong> the stopping distance (d ∝ v²). That&apos;s
        why speed limits matter.
      </div>
    </div>
  );
}

export default function KinematicsVizPremium() {
  const demos: DemoTab[] = [
    { id: "proj", title: "Projectile", emoji: "🎯", render: () => <ProjectileDemo /> },
    { id: "vt", title: "v–t graph", emoji: "📈", render: () => <VtGraphDemo /> },
    { id: "brake", title: "Braking", emoji: "🚗", render: () => <BrakingDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-sky-50 via-blue-50 to-indigo-50" />;
}
