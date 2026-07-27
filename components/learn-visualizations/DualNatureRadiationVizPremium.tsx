"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Photoelectric effect
// ============================================================================
function PhotoelectricDemo() {
  const [freq, setFreq] = useState(60); // relative frequency
  const threshold = 40; // work function threshold
  const emits = freq >= threshold;
  const ke = Math.max(0, (freq - threshold) * 0.05); // KE ∝ (f − f₀)
  const lightColor = `hsl(${280 - (freq - 30) * 3}, 85%, 55%)`;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Dim red light never ejects electrons; faint blue light does. It&apos;s about frequency, not brightness.
      </h4>
      <div className="rounded-2xl bg-slate-900 p-3 shadow-inner">
        <svg viewBox="0 0 260 100" className="h-auto w-full">
          {[...Array(4)].map((_, i) => (
            <line key={i} x1={10} y1={25 + i * 15} x2={120} y2={40 + i * 12} stroke={lightColor} strokeWidth={2} />
          ))}
          <rect x={120} y={20} width={16} height={70} fill="#94a3b8" />
          {emits &&
            [...Array(3)].map((_, i) => (
              <circle key={i} cx={145 + i * 30 + ke * 40} cy={35 + i * 18} r={4} fill="#fde047" />
            ))}
        </svg>
        <div className="text-center text-[10px] text-slate-400">light hits metal · {emits ? "electrons ejected →" : "no electrons"}</div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Light frequency f = <span className="font-bold" style={{ color: lightColor }}>{freq}</span>
          <input type="range" min={20} max={100} value={freq} onChange={(e) => setFreq(+e.target.value)} className="mt-1 w-full accent-indigo-500" />
        </label>
      </div>
      <div className={"mt-3 rounded-xl border-l-4 bg-white p-3 text-xs font-semibold " + (emits ? "border-emerald-500 text-emerald-700" : "border-rose-500 text-rose-700")}>
        {emits
          ? `Above the threshold f₀ → electrons fly out. KE = hf − φ (more frequency, more KE).`
          : `Below the threshold frequency f₀ → nothing happens, however bright the light.`}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: de Broglie wavelength
// ============================================================================
function DeBroglieDemo() {
  const [mass, setMass] = useState(30); // log-ish scale
  // λ = h/(mv). Bigger mass ⇒ tinier wavelength. Show relative.
  const wl = 100 / mass;
  const items = [
    { at: 10, label: "electron", emoji: "⚛️" },
    { at: 40, label: "dust speck", emoji: "•" },
    { at: 80, label: "cricket ball", emoji: "🏏" },
  ];
  const nearest = items.reduce((a, b) => (Math.abs(b.at - mass) < Math.abs(a.at - mass) ? b : a));
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Everything has a wavelength — but for anything bigger than an atom it&apos;s absurdly, unmeasurably tiny.
      </h4>
      <div className="rounded-2xl bg-white p-4 text-center shadow-inner">
        <div className="text-4xl">{nearest.emoji}</div>
        <div className="mt-1 text-sm font-semibold text-slate-600">{nearest.label}</div>
        <div className="mt-2 flex h-6 items-center justify-center">
          <div className="rounded-full bg-gradient-to-r from-teal-400 to-emerald-500" style={{ width: `${Math.min(220, wl * 2.2)}px`, height: 6 }} />
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Mass of the object (small → large)
          <input type="range" min={5} max={95} value={mass} onChange={(e) => setMass(+e.target.value)} className="mt-1 w-full accent-teal-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        λ = h / (m·v) → heavier ⇒ <strong className="text-teal-700">shorter wavelength</strong>
      </div>
    </div>
  );
}

export default function DualNatureRadiationVizPremium() {
  const demos: DemoTab[] = [
    { id: "photo", title: "Photoelectric", emoji: "🔦", render: () => <PhotoelectricDemo /> },
    { id: "debroglie", title: "Matter waves", emoji: "🌀", render: () => <DeBroglieDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-indigo-50 via-violet-50 to-teal-50" />;
}
