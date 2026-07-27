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
// Demo 1: E and B fields, perpendicular, in step
// ============================================================================
function EMWaveDemo() {
  const t = useClock();
  const W = 300,
    mid = 60;
  const E: string[] = [];
  const B: string[] = [];
  for (let px = 10; px <= W - 10; px += 3) {
    const phase = (px - 10) / 22 - t * 3;
    E.push(`${px},${(mid - 34 * Math.sin(phase)).toFixed(1)}`);
    B.push(`${px},${(mid - 18 * Math.sin(phase)).toFixed(1)}`);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Light is a self-propelling ripple: an electric field and a magnetic field, at right angles, in step.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} 120`} className="h-auto w-full">
          <line x1={10} y1={mid} x2={W - 10} y2={mid} stroke="#e2e8f0" strokeWidth={1} />
          <polyline points={E.join(" ")} fill="none" stroke="#e11d48" strokeWidth={2.5} />
          <polyline points={B.join(" ")} fill="none" stroke="#2563eb" strokeWidth={2} opacity={0.7} />
          <text x={16} y={20} fontSize="10" fill="#e11d48" fontWeight="bold">E field</text>
          <text x={16} y={108} fontSize="10" fill="#2563eb" fontWeight="bold">B field →</text>
        </svg>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-rose-500 bg-white p-3 text-xs text-slate-600">
        No medium needed — E and B keep regenerating each other, racing through vacuum at
        c = 3×10⁸ m/s. c = 1/√(µ₀ε₀).
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: The electromagnetic spectrum
// ============================================================================
const SPECTRUM = [
  { name: "Radio", eg: "FM, TV, Wi-Fi", color: "#7c3aed", wl: "> 1 m" },
  { name: "Microwave", eg: "ovens, radar", color: "#2563eb", wl: "1 mm–1 m" },
  { name: "Infrared", eg: "remotes, heat", color: "#dc2626", wl: "700 nm–1 mm" },
  { name: "Visible", eg: "what we see", color: "#16a34a", wl: "400–700 nm" },
  { name: "Ultraviolet", eg: "sunburn", color: "#7e22ce", wl: "10–400 nm" },
  { name: "X-ray", eg: "medical scans", color: "#0891b2", wl: "0.01–10 nm" },
  { name: "Gamma", eg: "nuclear, cancer therapy", color: "#334155", wl: "< 0.01 nm" },
];
function SpectrumDemo() {
  const [i, setI] = useState(3);
  const s = SPECTRUM[i];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Same physics, wildly different wavelengths — from radio waves to gamma rays.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex overflow-hidden rounded-lg">
          {SPECTRUM.map((x, j) => (
            <button
              key={x.name}
              onClick={() => setI(j)}
              className="h-8 flex-1 transition"
              style={{ background: x.color, opacity: i === j ? 1 : 0.4 }}
              aria-label={x.name}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-slate-400">
          <span>long λ, low energy</span>
          <span>short λ, high energy</span>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-4 text-center shadow-inner">
        <div className="text-lg font-bold" style={{ color: s.color }}>{s.name}</div>
        <div className="mt-1 font-mono text-xs text-slate-500">λ ≈ {s.wl}</div>
        <div className="mt-1 text-sm text-slate-600">{s.eg}</div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <input type="range" min={0} max={SPECTRUM.length - 1} value={i} onChange={(e) => setI(+e.target.value)} className="w-full accent-slate-600" />
      </div>
    </div>
  );
}

export default function ElectromagneticWavesVizPremium() {
  const demos: DemoTab[] = [
    { id: "wave", title: "E & B in step", emoji: "📡", render: () => <EMWaveDemo /> },
    { id: "spectrum", title: "The spectrum", emoji: "🌈", render: () => <SpectrumDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-fuchsia-50 via-purple-50 to-blue-50" />;
}
