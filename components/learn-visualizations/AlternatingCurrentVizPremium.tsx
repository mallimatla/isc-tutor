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
// Demo 1: AC waveform & RMS
// ============================================================================
function WaveformDemo() {
  const t = useClock();
  const [amp, setAmp] = useState(40);
  const [f, setF] = useState(1);
  const rms = (amp / Math.SQRT2).toFixed(0);
  const W = 300,
    H = 130,
    mid = 65;
  const pts: string[] = [];
  for (let px = 10; px <= W - 10; px += 3) {
    const y = mid - amp * Math.sin(((px - 10) / 40) * f - t * 3);
    pts.push(`${px},${y.toFixed(1)}`);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Mains electricity flips direction 50 times a second. Its &quot;effective&quot; value is the RMS.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={10} y1={mid} x2={W - 10} y2={mid} stroke="#e2e8f0" strokeWidth={1} />
          <line x1={10} y1={mid - amp / Math.SQRT2} x2={W - 10} y2={mid - amp / Math.SQRT2} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" />
          <polyline points={pts.join(" ")} fill="none" stroke="#0891b2" strokeWidth={2.5} />
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Peak V₀ = <span className="font-bold text-cyan-700">{amp}</span>
          <input type="range" min={15} max={55} value={amp} onChange={(e) => setAmp(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Frequency = <span className="font-bold text-cyan-700">{f.toFixed(1)}×</span>
          <input type="range" min={0.5} max={3} step={0.1} value={f} onChange={(e) => setF(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        V_rms = V₀/√2 = <strong className="text-amber-600">{rms}</strong> (dashed line)
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: LCR resonance
// ============================================================================
function ResonanceDemo() {
  const [f, setF] = useState(50); // driving frequency %
  const f0 = 50; // resonance
  const Q = 8;
  const current = 1 / Math.sqrt(1 + Q * Q * Math.pow(f / f0 - f0 / f, 2));
  const W = 300,
    H = 130,
    pad = 22;
  const pts: string[] = [];
  for (let x = 10; x <= 100; x += 1.5) {
    const cur = 1 / Math.sqrt(1 + Q * Q * Math.pow(x / f0 - f0 / x, 2));
    pts.push(`${pad + (x / 100) * (W - 2 * pad)},${H - pad - cur * (H - 2 * pad)}`);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Tune a circuit to its resonant frequency and the current peaks — that&apos;s how a radio picks a station.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={pts.join(" ")} fill="none" stroke="#0891b2" strokeWidth={2.5} />
          <line x1={pad + 0.5 * (W - 2 * pad)} y1={pad} x2={pad + 0.5 * (W - 2 * pad)} y2={H - pad} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={pad + (f / 100) * (W - 2 * pad)} cy={H - pad - current * (H - 2 * pad)} r={5} fill="#0e7490" />
          <text x={pad + 0.5 * (W - 2 * pad)} y={H - 6} textAnchor="middle" fontSize="8" fill="#64748b">f₀</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Driving frequency = <span className="font-bold text-cyan-700">{f}%</span> of f₀
          <input type="range" min={15} max={95} value={f} onChange={(e) => setF(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        At f = f₀ = 1/(2π√LC), impedance is minimum ⇒ current is <strong className="text-cyan-700">maximum</strong>.
      </div>
    </div>
  );
}

export default function AlternatingCurrentVizPremium() {
  const demos: DemoTab[] = [
    { id: "wave", title: "AC & RMS", emoji: "〰️", render: () => <WaveformDemo /> },
    { id: "res", title: "Resonance", emoji: "📻", render: () => <ResonanceDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-cyan-50 via-teal-50 to-blue-50" />;
}
