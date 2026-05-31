"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Riemann sum (more rectangles → convergence)
// ============================================================================
function RiemannDemo() {
  const f = (x: number) => -0.25 * x * x + 3;
  const A = 0, B = 4;
  const TRUE = -((B * B * B) / 12) + 3 * B - (-((A * A * A) / 12) + 3 * A);
  const [n, setN] = useState(8);
  const W = 520, H = 360, padX = 50, padY = 30, chartW = W - 2 * padX, chartH = H - 2 * padY;
  const xToPx = (x: number) => padX + ((x - A) / (B - A)) * chartW;
  const yToPx = (y: number) => padY + chartH - (y / 3.2) * chartH;
  const dx = (B - A) / n;
  let riemann = 0;
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  for (let i = 0; i < n; i++) {
    const xMid = A + (i + 0.5) * dx;
    const yH = f(xMid);
    riemann += yH * dx;
    rects.push({ x: xToPx(A + i * dx), y: yToPx(yH), w: xToPx(A + (i + 1) * dx) - xToPx(A + i * dx), h: yToPx(0) - yToPx(yH) });
  }
  const curve = Array.from({ length: 201 }, (_, i) => { const x = A + (i / 200) * (B - A); return `${i === 0 ? "M" : "L"}${xToPx(x)},${yToPx(f(x))}`; }).join(" ");
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">More rectangles → tighter approximation of the area under the curve.</h4>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-white shadow-inner">
        <line x1={padX} y1={yToPx(0)} x2={W - padX} y2={yToPx(0)} stroke="#cbd5e1" />
        <line x1={padX} y1={padY} x2={padX} y2={yToPx(0)} stroke="#cbd5e1" />
        {rects.map((r, i) => (<rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#f97316" fillOpacity={0.35} stroke="#f97316" />))}
        <path d={curve} fill="none" stroke="#ef4444" strokeWidth="3" />
      </svg>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <input type="range" min="2" max="60" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-orange-600" />
        <div className="mt-1 text-center text-xs text-slate-500">n = {n} rectangles</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-orange-50 p-2"><div className="text-[10px] uppercase text-orange-700">Sum</div><div className="text-xl font-bold text-orange-700">{riemann.toFixed(3)}</div></div>
        <div className="rounded-xl bg-red-50 p-2"><div className="text-[10px] uppercase text-red-700">True</div><div className="text-xl font-bold text-red-700">{TRUE.toFixed(3)}</div></div>
        <div className="rounded-xl bg-rose-50 p-2"><div className="text-[10px] uppercase text-rose-700">Error</div><div className="text-xl font-bold text-rose-700">{Math.abs(riemann - TRUE).toFixed(3)}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Definite integral with bounds slider
// ============================================================================
function DefiniteBoundsDemo() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(3);
  const f = (x: number) => Math.sin(x) + 1;
  // Antiderivative: -cos(x) + x
  const F = (x: number) => -Math.cos(x) + x;
  const I = F(b) - F(a);
  const cx = 60, cy = 240;
  const sX = (x: number) => cx + x * 60;
  const sY = (y: number) => cy - y * 60;
  const curve: string[] = [];
  for (let x = 0; x <= 6; x += 0.05) curve.push(`${curve.length === 0 ? "M" : "L"}${sX(x)},${sY(f(x))}`);
  // Fill region
  const fill: string[] = [`M${sX(a)},${sY(0)}`];
  for (let x = a; x <= b; x += 0.05) fill.push(`L${sX(x)},${sY(f(x))}`);
  fill.push(`L${sX(b)},${sY(0)} Z`);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Slide a, b. The shaded region's area is ∫ₐᵇ f dx."}</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">a = {a.toFixed(1)}</span><input type="range" min={0} max={5.5} step={0.1} value={a} onChange={(e) => setA(parseFloat(e.target.value))} className="flex-1 accent-orange-600" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">b = {b.toFixed(1)}</span><input type="range" min={0.5} max={6} step={0.1} value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="flex-1 accent-red-600" /></div>
      </div>
      <svg viewBox="0 0 420 280" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="400" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="260" stroke="#cbd5e1" />
        <path d={fill.join(" ")} fill="#f97316" fillOpacity="0.35" />
        <path d={curve.join(" ")} fill="none" stroke="#ef4444" strokeWidth="3" />
      </svg>
      <div className="mt-3 rounded-xl bg-orange-50 p-3 text-center font-mono">
        ∫<sub>{a.toFixed(1)}</sub><sup>{b.toFixed(1)}</sup> (sin x + 1) dx = <strong className="text-orange-700">{I.toFixed(3)}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Antiderivative gallery — pick base function
// ============================================================================
function AntiderivativeDemo() {
  const fns = [
    { name: "xⁿ", deriv: "n·xⁿ⁻¹", antideriv: "xⁿ⁺¹/(n+1)" },
    { name: "sin x", deriv: "cos x", antideriv: "−cos x" },
    { name: "cos x", deriv: "−sin x", antideriv: "sin x" },
    { name: "eˣ", deriv: "eˣ", antideriv: "eˣ" },
    { name: "1/x", deriv: "−1/x²", antideriv: "ln|x|" },
  ];
  const [idx, setIdx] = useState(0);
  const fn = fns[idx];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Each function and its antiderivative — these are your bread-and-butter integrals.</h4>
      <div className="mb-3 flex flex-wrap gap-2">
        {fns.map((f, i) => (<button key={f.name} onClick={() => setIdx(i)} className={"rounded-full px-3 py-1.5 text-xs font-semibold font-mono " + (idx === i ? "bg-red-600 text-white" : "bg-white text-slate-600")}>{f.name}</button>))}
      </div>
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-inner">
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
          <div className="text-[10px] uppercase text-orange-700">Function</div>
          <div className="font-mono text-2xl font-bold text-orange-800">{fn.name}</div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
          <div className="text-[10px] uppercase text-red-700">Derivative</div>
          <div className="font-mono text-2xl font-bold text-red-800">{fn.deriv}</div>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
          <div className="text-[10px] uppercase text-rose-700">Antiderivative (+ C)</div>
          <div className="font-mono text-2xl font-bold text-rose-800">{fn.antideriv}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Area between two curves
// ============================================================================
function AreaBetweenDemo() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(2);
  const f = (x: number) => x * x;
  const g = (x: number) => 2 * x;
  // ∫ (g - f) dx = x² - x³/3
  const F = (x: number) => x * x - x * x * x / 3;
  const I = F(b) - F(a);
  const cx = 60, cy = 240;
  const sX = (x: number) => cx + x * 80;
  const sY = (y: number) => cy - y * 40;
  const curve1: string[] = [], curve2: string[] = [];
  for (let x = -0.5; x <= 2.5; x += 0.05) curve1.push(`${curve1.length === 0 ? "M" : "L"}${sX(x)},${sY(f(x))}`);
  for (let x = -0.5; x <= 2.5; x += 0.05) curve2.push(`${curve2.length === 0 ? "M" : "L"}${sX(x)},${sY(g(x))}`);
  const fill: string[] = [];
  for (let x = a; x <= b; x += 0.05) fill.push(`${fill.length === 0 ? "M" : "L"}${sX(x)},${sY(g(x))}`);
  for (let x = b; x >= a; x -= 0.05) fill.push(`L${sX(x)},${sY(f(x))}`);
  fill.push("Z");
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Area between y = 2x and y = x² from a to b.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">a = {a.toFixed(1)}</span><input type="range" min={0} max={1.5} step={0.1} value={a} onChange={(e) => setA(parseFloat(e.target.value))} className="flex-1 accent-orange-600" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">b = {b.toFixed(1)}</span><input type="range" min={0.5} max={2} step={0.1} value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="flex-1 accent-red-600" /></div>
      </div>
      <svg viewBox="0 0 380 280" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="360" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="260" stroke="#cbd5e1" />
        <path d={fill.join(" ")} fill="#fbbf24" fillOpacity="0.4" />
        <path d={curve1.join(" ")} fill="none" stroke="#ef4444" strokeWidth="2.5" />
        <path d={curve2.join(" ")} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
      </svg>
      <div className="mt-3 rounded-xl bg-amber-50 p-3 text-center font-mono">
        Area = ∫ (g − f) dx = <strong className="text-amber-700">{I.toFixed(3)}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Volume of revolution (disk method)
// ============================================================================
function RevolutionDemo() {
  const [b, setB] = useState(2);
  const f = (x: number) => Math.sqrt(x);
  // V = π ∫₀ᵇ x dx = π b²/2
  const V = Math.PI * b * b / 2;
  const cx = 60, cy = 180;
  const sX = (x: number) => cx + x * 80;
  const sY = (y: number) => cy - y * 50;
  const curve: string[] = [];
  for (let x = 0; x <= 3; x += 0.05) curve.push(`${curve.length === 0 ? "M" : "L"}${sX(x)},${sY(f(x))}`);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Rotate y = √x around x-axis from 0 to b. Volume = π ∫ y² dx.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">b = {b.toFixed(1)}</span>
        <input type="range" min={0.5} max={3} step={0.1} value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="flex-1 accent-red-600" />
      </div>
      <svg viewBox="0 0 380 280" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="360" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="260" stroke="#cbd5e1" />
        {/* solid of revolution */}
        {Array.from({ length: 12 }, (_, i) => {
          const x = (i / 11) * b;
          const r = f(x) * 50;
          return <ellipse key={i} cx={sX(x)} cy={cy} rx="4" ry={r} fill="#fb923c" fillOpacity={0.3} stroke="#ea580c" strokeWidth="0.5" />;
        })}
        <path d={curve.join(" ")} fill="none" stroke="#ef4444" strokeWidth="2.5" />
        <line x1={sX(b)} y1={cy} x2={sX(b)} y2={sY(f(b))} stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" />
      </svg>
      <div className="mt-3 rounded-xl bg-red-50 p-3 text-center font-mono">
        V = π · b²/2 = π · {(b * b / 2).toFixed(2)} = <strong className="text-red-700">{V.toFixed(2)}</strong>
      </div>
    </div>
  );
}

export default function IntegralsVizPremium() {
  const demos: DemoTab[] = [
    { id: "riemann", title: "Riemann sums", emoji: "📊", render: () => <RiemannDemo /> },
    { id: "bounds", title: "Definite", emoji: "📐", render: () => <DefiniteBoundsDemo /> },
    { id: "anti", title: "Antiderivatives", emoji: "🔁", render: () => <AntiderivativeDemo /> },
    { id: "between", title: "Area between", emoji: "🥄", render: () => <AreaBetweenDemo /> },
    { id: "rev", title: "Volume of rev.", emoji: "🍷", render: () => <RevolutionDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-red-50 via-orange-50 to-rose-50" />;
}
