"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Area under a curve
// ============================================================================
function AreaUnderDemo() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(3);
  const f = (x: number) => Math.sin(x) + 1.5;
  const F = (x: number) => -Math.cos(x) + 1.5 * x;
  const area = F(b) - F(a);
  const cx = 40, cy = 200;
  const sX = (x: number) => cx + x * 80;
  const sY = (y: number) => cy - y * 50;
  const curve: string[] = [];
  for (let x = 0; x <= 6; x += 0.05) curve.push(`${curve.length === 0 ? "M" : "L"}${sX(x)},${sY(f(x))}`);
  const fill: string[] = [`M${sX(a)},${sY(0)}`];
  for (let x = a; x <= b; x += 0.05) fill.push(`L${sX(x)},${sY(f(x))}`);
  fill.push(`L${sX(b)},${sY(0)} Z`);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Area under y = sin x + 1.5 from a to b.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">a = {a.toFixed(1)}</span><input type="range" min={0} max={5} step={0.1} value={a} onChange={(e) => setA(parseFloat(e.target.value))} className="flex-1 accent-pink-500" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">b = {b.toFixed(1)}</span><input type="range" min={0.5} max={6} step={0.1} value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="flex-1 accent-rose-500" /></div>
      </div>
      <svg viewBox="0 0 540 240" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1={cy} x2="520" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="220" stroke="#cbd5e1" />
        <path d={fill.join(" ")} fill="#f43f5e" fillOpacity="0.35" />
        <path d={curve.join(" ")} fill="none" stroke="#e11d48" strokeWidth="3" />
      </svg>
      <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center font-mono">
        Area = <strong className="text-rose-700">{area.toFixed(3)}</strong> sq units
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Area between curves
// ============================================================================
function AreaBetweenDemo() {
  const f = (x: number) => x * x;
  const g = (x: number) => 2 * x;
  const F = (x: number) => x * x - (x * x * x) / 3;
  const area = F(2) - F(0);
  const cx = 100, cy = 220;
  const sX = (x: number) => cx + x * 80;
  const sY = (y: number) => cy - y * 50;
  const c1: string[] = []; const c2: string[] = []; const fill: string[] = [];
  for (let x = -0.5; x <= 2.5; x += 0.05) c1.push(`${c1.length === 0 ? "M" : "L"}${sX(x)},${sY(f(x))}`);
  for (let x = -0.5; x <= 2.5; x += 0.05) c2.push(`${c2.length === 0 ? "M" : "L"}${sX(x)},${sY(g(x))}`);
  for (let x = 0; x <= 2; x += 0.05) fill.push(`${fill.length === 0 ? "M" : "L"}${sX(x)},${sY(g(x))}`);
  for (let x = 2; x >= 0; x -= 0.05) fill.push(`L${sX(x)},${sY(f(x))}`);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Area between y = 2x (line) and y = x² (parabola).</h4>
      <svg viewBox="0 0 400 260" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="380" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="240" stroke="#cbd5e1" />
        <path d={fill.join(" ") + " Z"} fill="#fbbf24" fillOpacity="0.4" />
        <path d={c1.join(" ")} fill="none" stroke="#ef4444" strokeWidth="2.5" />
        <path d={c2.join(" ")} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
      </svg>
      <div className="mt-3 rounded-xl bg-amber-50 p-3 text-center font-mono">
        ∫₀² (2x − x²) dx = <strong className="text-amber-700">{area.toFixed(3)}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Area of a circle by integration
// ============================================================================
function CircleAreaDemo() {
  const [r, setR] = useState(3);
  const area = Math.PI * r * r;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Slide r. Area = 4·∫₀ʳ √(r² − x²) dx = πr²."}</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">r = {r}</span>
        <input type="range" min={1} max={5} value={r} onChange={(e) => setR(parseInt(e.target.value))} className="flex-1 accent-rose-500" />
      </div>
      <svg viewBox="0 0 300 300" className="mx-auto rounded-2xl bg-white shadow-inner">
        <line x1="20" y1="150" x2="280" y2="150" stroke="#cbd5e1" />
        <line x1="150" y1="20" x2="150" y2="280" stroke="#cbd5e1" />
        <circle cx="150" cy="150" r={r * 20} fill="#f43f5e" fillOpacity="0.3" stroke="#e11d48" strokeWidth="2" />
      </svg>
      <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center font-mono">
        Area = π · {r}² = <strong className="text-rose-700">{area.toFixed(3)}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Area of ellipse
// ============================================================================
function EllipseAreaDemo() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(2);
  const area = Math.PI * a * b;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Area of ellipse x²/a² + y²/b² = 1 is πab.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">a = {a}</span><input type="range" min={1} max={5} value={a} onChange={(e) => setA(parseInt(e.target.value))} className="flex-1 accent-rose-500" /></div>
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">b = {b}</span><input type="range" min={1} max={5} value={b} onChange={(e) => setB(parseInt(e.target.value))} className="flex-1 accent-orange-500" /></div>
      </div>
      <svg viewBox="0 0 400 240" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1="120" x2="380" y2="120" stroke="#cbd5e1" />
        <line x1="200" y1="20" x2="200" y2="220" stroke="#cbd5e1" />
        <ellipse cx="200" cy="120" rx={a * 25} ry={b * 25} fill="#f43f5e" fillOpacity="0.3" stroke="#e11d48" strokeWidth="2" />
      </svg>
      <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center font-mono">
        Area = π · {a} · {b} = <strong className="text-rose-700">{area.toFixed(3)}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Real-world — area of a road sign
// ============================================================================
function RealWorldDemo() {
  const [w, setW] = useState(2);
  const f = (x: number) => 4 - x * x;
  const area = (16 / 3); // 2 * integral of (4 - x²) from 0 to 2
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Surface area of a parabolic dish — integration solves real shapes.</h4>
      <svg viewBox="0 0 400 240" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1="200" x2="380" y2="200" stroke="#cbd5e1" />
        <line x1="200" y1="20" x2="200" y2="220" stroke="#cbd5e1" />
        {(() => {
          const pts: string[] = ["M40,200"];
          for (let x = -3; x <= 3; x += 0.1) { const y = f(x); if (y >= 0) pts.push(`L${200 + x * 50},${200 - y * 30}`); }
          pts.push("L360,200 Z");
          return <path d={pts.join(" ")} fill="#f43f5e" fillOpacity="0.4" stroke="#e11d48" strokeWidth="2" />;
        })()}
      </svg>
      <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center font-mono text-sm">
        Area = ∫₋₂² (4 − x²) dx = <strong className="text-rose-700">{area.toFixed(2)}</strong> sq units
      </div>
      <div className="mt-2 text-xs text-slate-500 text-center">For width w = ±2, height 4. Used in dish antenna design.</div>
      <div className="text-xs text-slate-400 mt-1 text-center">w slider just for show: {w}</div>
      <input type="range" min={0.5} max={3} step={0.1} value={w} onChange={(e) => setW(parseFloat(e.target.value))} className="mt-1 w-full accent-rose-400" />
    </div>
  );
}

export default function ApplicationsIntegralsVizPremium() {
  const demos: DemoTab[] = [
    { id: "area", title: "Area under curve", emoji: "📐", render: () => <AreaUnderDemo /> },
    { id: "between", title: "Between curves", emoji: "🥄", render: () => <AreaBetweenDemo /> },
    { id: "circle", title: "Circle = πr²", emoji: "⭕", render: () => <CircleAreaDemo /> },
    { id: "ellipse", title: "Ellipse = πab", emoji: "🥚", render: () => <EllipseAreaDemo /> },
    { id: "real", title: "Real-world", emoji: "📡", render: () => <RealWorldDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-rose-50 via-pink-50 to-red-50" />;
}
