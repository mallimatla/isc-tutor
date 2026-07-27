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

const W = 300,
  H = 150,
  MID = 75;

function wavePath(fn: (x: number) => number) {
  const pts: string[] = [];
  for (let px = 8; px <= W - 8; px += 3) {
    pts.push(`${px},${(MID - fn(px)).toFixed(1)}`);
  }
  return pts.join(" ");
}

// ============================================================================
// Demo 1: Travelling wave — v = f·λ
// ============================================================================
function TravellingDemo() {
  const t = useClock();
  const [f, setF] = useState(1.2); // Hz (relative)
  const [amp, setAmp] = useState(34);
  const waves = 2.2; // wavelengths shown across the box
  const k = (2 * Math.PI * waves) / (W - 16);
  const omega = 2 * Math.PI * f;
  const path = wavePath((px) => amp * Math.sin(k * (px - 8) - omega * t));
  const lambda = (W - 16) / waves;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        A wave carries energy, not matter. Speed = frequency × wavelength.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={8} y1={MID} x2={W - 8} y2={MID} stroke="#e2e8f0" strokeWidth={1} />
          <polyline points={path} fill="none" stroke="#0891b2" strokeWidth={2.5} strokeLinecap="round" />
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Frequency f = <span className="font-bold text-cyan-700">{f.toFixed(1)} Hz</span>
          <input type="range" min={0.3} max={3} step={0.1} value={f} onChange={(e) => setF(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Amplitude = <span className="font-bold text-cyan-700">{amp}</span>
          <input type="range" min={8} max={55} value={amp} onChange={(e) => setAmp(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        v = f·λ → higher frequency, same medium ⇒ shorter wavelength. λ ≈ <strong className="text-cyan-700">{lambda.toFixed(0)} px</strong>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-cyan-500 bg-white p-3 text-xs text-slate-600">
        Amplitude sets loudness/brightness; frequency sets pitch/colour. They&apos;re independent.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Superposition & beats
// ============================================================================
function SuperpositionDemo() {
  const t = useClock();
  const [detune, setDetune] = useState(8); // % frequency difference
  const f1 = 1.4;
  const f2 = f1 * (1 + detune / 100);
  const k1 = (2 * Math.PI * 2) / (W - 16);
  const k2 = k1 * (1 + detune / 100);
  const a = 20;
  const w1 = (x: number) => a * Math.sin(k1 * (x - 8) - 2 * Math.PI * f1 * t);
  const w2 = (x: number) => a * Math.sin(k2 * (x - 8) - 2 * Math.PI * f2 * t);
  const beat = Math.abs(f2 - f1);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Add two nearby frequencies → they swell and fade. That throb is a beat.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} 60`} className="h-auto w-full">
          <polyline points={wavePathAt(w1, 30)} fill="none" stroke="#94a3b8" strokeWidth={1.3} />
          <polyline points={wavePathAt(w2, 30)} fill="none" stroke="#cbd5e1" strokeWidth={1.3} />
        </svg>
        <div className="my-1 text-center text-[10px] font-semibold text-slate-400">＋ add them ＝</div>
        <svg viewBox={`0 0 ${W} 90`} className="h-auto w-full">
          <line x1={8} y1={45} x2={W - 8} y2={45} stroke="#e2e8f0" strokeWidth={1} />
          <polyline
            points={(() => {
              const pts: string[] = [];
              for (let px = 8; px <= W - 8; px += 2) pts.push(`${px},${(45 - (w1(px) + w2(px))).toFixed(1)}`);
              return pts.join(" ");
            })()}
            fill="none"
            stroke="#0891b2"
            strokeWidth={2.5}
          />
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Frequency difference = <span className="font-bold text-cyan-700">{detune}%</span>
          <input type="range" min={0} max={20} value={detune} onChange={(e) => setDetune(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        beat frequency = |f₁ − f₂| = <strong className="text-cyan-700">{beat.toFixed(2)} Hz</strong>
      </div>
    </div>
  );
}
function wavePathAt(fn: (x: number) => number, mid: number) {
  const pts: string[] = [];
  for (let px = 8; px <= W - 8; px += 3) pts.push(`${px},${(mid - fn(px)).toFixed(1)}`);
  return pts.join(" ");
}

export default function WavesVizPremium() {
  const demos: DemoTab[] = [
    { id: "trav", title: "Travelling wave", emoji: "🌊", render: () => <TravellingDemo /> },
    { id: "beats", title: "Beats", emoji: "🔊", render: () => <SuperpositionDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-cyan-50 via-sky-50 to-blue-50" />;
}
