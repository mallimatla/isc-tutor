"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

const g = 9.8;

// ============================================================================
// Demo 1: Energy conservation on a track
// ============================================================================
function ConservationDemo() {
  const [pos, setPos] = useState(0); // 0 = top of hill, 100 = bottom
  const H0 = 20; // release height in metres
  const r = pos / 100;
  // Track: cosine dip from left hill down to valley and up.
  const W = 300,
    Hpx = 160;
  const trackY = (px: number) => 40 + 90 * (0.5 - 0.5 * Math.cos((px / W) * 2 * Math.PI * 0.5));
  const ballX = 20 + r * (W - 40);
  const ballY = trackY(ballX) - 8;
  const height = H0 * (1 - r); // metres above valley
  const pe = height / H0; // fraction
  const ke = 1 - pe;
  const v = Math.sqrt(2 * g * (H0 - height));
  const pts: string[] = [];
  for (let px = 10; px <= W - 10; px += 4) pts.push(`${px},${trackY(px).toFixed(1)}`);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Roll down a frictionless track: height becomes speed, and the total stays fixed.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${Hpx}`} className="h-auto w-full">
          <polyline points={pts.join(" ")} fill="none" stroke="#cbd5e1" strokeWidth={3} strokeLinecap="round" />
          <circle cx={ballX} cy={ballY} r={8} fill="#16a34a" />
        </svg>
      </div>
      <div className="mt-3 flex items-end justify-center gap-6 rounded-2xl bg-white p-3 shadow-inner" style={{ height: 96 }}>
        <MiniBar label="PE" frac={pe} color="from-violet-400 to-violet-600" />
        <MiniBar label="KE" frac={ke} color="from-emerald-400 to-emerald-600" />
        <MiniBar label="Total" frac={1} color="from-slate-300 to-slate-500" />
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Position down the track = <span className="font-bold text-emerald-700">{pos}%</span>
          <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(+e.target.value)} className="mt-1 w-full accent-emerald-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        speed at this point v = √(2g·drop) = <strong className="text-emerald-700">{v.toFixed(1)} m/s</strong>
      </div>
    </div>
  );
}
function MiniBar({ label, frac, color }: { label: string; frac: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-[72px] w-8 items-end rounded-lg bg-slate-100">
        <div className={`w-full rounded-lg bg-gradient-to-t ${color} transition-all`} style={{ height: `${Math.max(2, frac * 100)}%` }} />
      </div>
      <span className="mt-1 text-[11px] font-semibold text-slate-600">{label}</span>
    </div>
  );
}

// ============================================================================
// Demo 2: Work = F·d·cosθ
// ============================================================================
function WorkDemo() {
  const [F, setF] = useState(20);
  const [d, setD] = useState(5);
  const [deg, setDeg] = useState(0);
  const W = F * d * Math.cos((deg * Math.PI) / 180);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Only the part of the force along the motion does work: W = F·d·cosθ.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <svg viewBox="0 0 300 90" className="h-auto w-full">
          <line x1={30} y1={70} x2={270} y2={70} stroke="#e2e8f0" strokeWidth={2} />
          <rect x={40} y={54} width={26} height={16} rx={3} fill="#059669" />
          <line
            x1={53}
            y1={62}
            x2={53 + 50 * Math.cos((deg * Math.PI) / 180)}
            y2={62 - 50 * Math.sin((deg * Math.PI) / 180)}
            stroke="#e11d48"
            strokeWidth={3}
            markerEnd="url(#wep-a)"
          />
          <defs>
            <marker id="wep-a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#e11d48" />
            </marker>
          </defs>
          <text x={150} y={86} textAnchor="middle" fontSize="9" fill="#94a3b8">motion →</text>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-[11px] font-medium text-slate-600">
          F = <span className="font-bold text-emerald-700">{F} N</span>
          <input type="range" min={0} max={40} value={F} onChange={(e) => setF(+e.target.value)} className="mt-1 w-full accent-emerald-500" />
        </label>
        <label className="text-[11px] font-medium text-slate-600">
          d = <span className="font-bold text-emerald-700">{d} m</span>
          <input type="range" min={0} max={10} value={d} onChange={(e) => setD(+e.target.value)} className="mt-1 w-full accent-emerald-500" />
        </label>
        <label className="text-[11px] font-medium text-slate-600">
          θ = <span className="font-bold text-emerald-700">{deg}°</span>
          <input type="range" min={0} max={90} value={deg} onChange={(e) => setDeg(+e.target.value)} className="mt-1 w-full accent-emerald-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        W = <strong className="text-emerald-700">{W.toFixed(0)} J</strong>
        {deg === 90 && <span className="ml-2 text-xs text-rose-500">θ=90° ⇒ no work!</span>}
      </div>
    </div>
  );
}

export default function WorkEnergyPowerVizPremium() {
  const demos: DemoTab[] = [
    { id: "cons", title: "Energy swap", emoji: "🎢", render: () => <ConservationDemo /> },
    { id: "work", title: "W = F·d·cosθ", emoji: "💪", render: () => <WorkDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-emerald-50 via-teal-50 to-green-50" />;
}
