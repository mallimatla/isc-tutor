"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Young's double slit
// ============================================================================
function DoubleSlitDemo() {
  const [d, setD] = useState(50); // slit separation
  const [wl, setWl] = useState(50); // wavelength
  const beta = (wl / d) * 40; // fringe width β = λD/d
  const W = 300,
    H = 90;
  const bands = [];
  for (let x = 0; x <= W; x += 1) {
    const phase = ((x - W / 2) / beta) * Math.PI;
    const I = Math.cos(phase) * Math.cos(phase); // cos² fringes
    bands.push(I);
  }
  const wlColor = `hsl(${280 - (wl - 30) * 3}, 80%, 55%)`;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Two slits, one wave — where crests meet you get bright bands, where crest meets trough, dark.
      </h4>
      <div className="rounded-2xl bg-slate-900 p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {bands.map((I, x) => (
            <rect key={x} x={x} y={0} width={1.2} height={H} fill={wlColor} opacity={I} />
          ))}
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Slit separation d = <span className="font-bold text-purple-700">{(d / 50).toFixed(1)}×</span>
          <input type="range" min={25} max={90} value={d} onChange={(e) => setD(+e.target.value)} className="mt-1 w-full accent-purple-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Wavelength λ = <span className="font-bold text-purple-700">{(wl / 50).toFixed(1)}×</span>
          <input type="range" min={30} max={80} value={wl} onChange={(e) => setWl(+e.target.value)} className="mt-1 w-full accent-purple-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        fringe width β = λD/d → wider slits pack fringes closer; longer λ spreads them out.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Single-slit diffraction
// ============================================================================
function SingleSlitDemo() {
  const [width, setWidth] = useState(50);
  const spread = 2000 / width; // narrower slit → wider central max
  const W = 300,
    H = 90;
  const bars = [];
  for (let x = 0; x <= W; x += 1) {
    const u = ((x - W / 2) / spread) * 3;
    const I = u === 0 ? 1 : Math.pow(Math.sin(u) / u, 2); // sinc²
    bars.push(I);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Squeeze light through one narrow slit and it fans out — the narrower the slit, the wider the spread.
      </h4>
      <div className="rounded-2xl bg-slate-900 p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {bars.map((I, x) => (
            <rect key={x} x={x} y={0} width={1.2} height={H} fill="#22d3ee" opacity={I} />
          ))}
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Slit width a = <span className="font-bold text-cyan-700">{(width / 50).toFixed(1)}×</span>
          <input type="range" min={25} max={90} value={width} onChange={(e) => setWidth(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-cyan-500 bg-white p-3 text-xs text-slate-600">
        Central bright band width ∝ 1/a. This diffraction is what ultimately limits a telescope&apos;s
        or camera&apos;s resolution.
      </div>
    </div>
  );
}

export default function WaveOpticsVizPremium() {
  const demos: DemoTab[] = [
    { id: "double", title: "Double slit", emoji: "🎆", render: () => <DoubleSlitDemo /> },
    { id: "single", title: "Diffraction", emoji: "🔦", render: () => <SingleSlitDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-purple-50 via-fuchsia-50 to-cyan-50" />;
}
