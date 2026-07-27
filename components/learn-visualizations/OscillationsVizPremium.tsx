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
// Demo 1: Animated simple harmonic motion
// ============================================================================
function ShmDemo() {
  const t = useClock();
  const [A, setA] = useState(55); // pixel amplitude
  const [T, setT_] = useState(1.6); // period seconds
  const phase = (2 * Math.PI * t) / T;
  const x = A * Math.sin(phase);
  const W = 300,
    H = 200,
    cx = 150,
    trackY = 46;

  // sine trace across one period
  const pts: string[] = [];
  const gx0 = 20,
    gx1 = 280,
    gy = 140,
    gAmp = 42;
  for (let i = 0; i <= 60; i++) {
    const tau = (T * i) / 60;
    const px = gx0 + ((gx1 - gx0) * i) / 60;
    const py = gy - gAmp * Math.sin((2 * Math.PI * tau) / T);
    pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  const dotTau = ((t % T) + T) % T;
  const dotX = gx0 + ((gx1 - gx0) * dotTau) / T;
  const dotY = gy - gAmp * Math.sin((2 * Math.PI * dotTau) / T);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        A mass on a spring traces a sine wave. That&apos;s simple harmonic motion.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* spring */}
          <line x1={20} y1={trackY} x2={cx + x - 12} y2={trackY} stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 3" />
          <line x1={cx} y1={68} x2={cx} y2={30} stroke="#e2e8f0" strokeWidth={1} />
          {/* equilibrium marker */}
          <line x1={cx} y1={30} x2={cx} y2={62} stroke="#e2e8f0" strokeWidth={1} />
          {/* mass */}
          <rect x={cx + x - 12} y={trackY - 12} width={24} height={24} rx={4} fill="#7c3aed" />
          {/* graph axis */}
          <line x1={gx0} y1={gy} x2={gx1} y2={gy} stroke="#e2e8f0" strokeWidth={1.5} />
          <polyline points={pts.join(" ")} fill="none" stroke="#a855f7" strokeWidth={2.5} />
          <circle cx={dotX} cy={dotY} r={4} fill="#7c3aed" />
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Amplitude A = <span className="font-bold text-violet-700">{A}</span>
          <input type="range" min={20} max={70} value={A} onChange={(e) => setA(+e.target.value)} className="mt-1 w-full accent-violet-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Period T = <span className="font-bold text-violet-700">{T.toFixed(1)} s</span>
          <input type="range" min={0.6} max={3} step={0.1} value={T} onChange={(e) => setT_(+e.target.value)} className="mt-1 w-full accent-violet-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        x(t) = A·sin(2πt / T) &nbsp;•&nbsp; frequency f = 1/T = <strong className="text-violet-700">{(1 / T).toFixed(2)} Hz</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Energy in SHM
// ============================================================================
function EnergyDemo() {
  const [xPct, setXPct] = useState(40); // |x|/A as %
  const r = xPct / 100;
  const pe = r * r; // ∝ x²
  const ke = 1 - r * r; // ∝ (A² − x²)
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Energy sloshes between kinetic and potential — but the total never changes.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="flex items-end justify-center gap-8" style={{ height: 120 }}>
          <Bar label="KE" frac={ke} color="from-emerald-400 to-emerald-600" />
          <Bar label="PE" frac={pe} color="from-violet-400 to-violet-600" />
          <Bar label="Total" frac={1} color="from-slate-300 to-slate-500" />
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Displacement |x| = <span className="font-bold text-violet-700">{xPct}% of A</span>
          <input type="range" min={0} max={100} value={xPct} onChange={(e) => setXPct(+e.target.value)} className="mt-1 w-full accent-violet-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-violet-500 bg-white p-3 text-xs text-slate-600">
        At the centre (x=0): all kinetic, fastest. At the ends (x=±A): all potential, momentarily
        still. KE = ½k(A²−x²), PE = ½kx².
      </div>
    </div>
  );
}
function Bar({ label, frac, color }: { label: string; frac: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-[100px] w-9 items-end rounded-lg bg-slate-100">
        <div className={`w-full rounded-lg bg-gradient-to-t ${color} transition-all`} style={{ height: `${Math.max(2, frac * 100)}%` }} />
      </div>
      <span className="mt-1 text-[11px] font-semibold text-slate-600">{label}</span>
    </div>
  );
}

export default function OscillationsVizPremium() {
  const demos: DemoTab[] = [
    { id: "shm", title: "SHM in motion", emoji: "🌀", render: () => <ShmDemo /> },
    { id: "energy", title: "Energy swap", emoji: "⚡", render: () => <EnergyDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-violet-50 via-purple-50 to-fuchsia-50" />;
}
