"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Slope field for dy/dx = x
// ============================================================================
function SlopeFieldDemo() {
  const cx = 200, cy = 200, scale = 30;
  const sX = (x: number) => cx + x * scale;
  const sY = (y: number) => cy - y * scale;
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let x = -5; x <= 5; x += 1) {
    for (let y = -5; y <= 5; y += 1) {
      const slope = x; // dy/dx = x
      const dx = 0.4 / Math.sqrt(1 + slope * slope);
      const dy = slope * dx;
      lines.push({ x1: x - dx, y1: y - dy, x2: x + dx, y2: y + dy });
    }
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"dy/dx = x — slope field shows the direction of solutions everywhere."}</h4>
      <svg viewBox="0 0 400 400" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="380" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="380" stroke="#cbd5e1" />
        {lines.map((l, i) => (<line key={i} x1={sX(l.x1)} y1={sY(l.y1)} x2={sX(l.x2)} y2={sY(l.y2)} stroke="#6366f1" strokeWidth="1.5" />))}
        {/* solution curves y = x²/2 + C for a few C */}
        {[-2, 0, 2].map((C, ci) => {
          const pts: string[] = [];
          for (let x = -5; x <= 5; x += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${sX(x)},${sY(x * x / 2 + C)}`);
          return <path key={ci} d={pts.join(" ")} fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.7" />;
        })}
      </svg>
      <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-center font-mono text-sm">
        Solutions: y = x²/2 + C (pink curves through the slope field)
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Separation of variables walkthrough
// ============================================================================
function SeparationDemo() {
  const [step, setStep] = useState(0);
  const steps = [
    "dy/dx = ky",
    "dy/y = k dx          (separate variables)",
    "∫ dy/y = ∫ k dx     (integrate both sides)",
    "ln|y| = kx + C₁",
    "y = e^(kx + C₁) = C·e^(kx)    (exponentiate)",
  ];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Solve dy/dx = ky by separation of variables.</h4>
      <div className="space-y-2 rounded-2xl bg-white p-4 shadow-inner">
        {steps.map((s, i) => (
          <div key={i} className={"rounded-xl p-3 font-mono text-sm transition " + (i <= step ? "bg-indigo-50 text-indigo-900" : "bg-zinc-50 text-zinc-300")}>
            {s}
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button onClick={() => setStep(Math.max(0, step - 1))} className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow">← Back</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white">Next →</button>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Exponential growth / decay
// ============================================================================
function GrowthDecayDemo() {
  const [k, setK] = useState(0.5);
  const y0 = 10;
  const cx = 40, cy = 220;
  const sX = (t: number) => cx + t * 60;
  const sY = (y: number) => cy - y * 4;
  const pts: string[] = [];
  for (let t = 0; t <= 5; t += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${sX(t)},${sY(y0 * Math.exp(k * t))}`);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">y = y₀ · e^(kt). k &gt; 0 grows; k &lt; 0 decays.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">k = {k.toFixed(2)}</span>
        <input type="range" min={-1} max={1} step={0.05} value={k} onChange={(e) => setK(parseFloat(e.target.value))} className="flex-1 accent-indigo-500" />
      </div>
      <svg viewBox="0 0 400 240" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1={cy} x2="380" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="240" stroke="#cbd5e1" />
        <path d={pts.join(" ")} fill="none" stroke={k >= 0 ? "#10b981" : "#ef4444"} strokeWidth="3" />
      </svg>
      <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-center font-mono">
        {k > 0 ? "Growth — population, compound interest" : k < 0 ? "Decay — radioactive, cooling" : "Constant — equilibrium"}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Order & degree
// ============================================================================
function OrderDegreeDemo() {
  const equations = [
    { eq: "dy/dx = 2x", order: 1, degree: 1 },
    { eq: "d²y/dx² + 3 dy/dx = 0", order: 2, degree: 1 },
    { eq: "(d²y/dx²)³ + y = 0", order: 2, degree: 3 },
    { eq: "d³y/dx³ + (dy/dx)² = 0", order: 3, degree: 1 },
  ];
  const [idx, setIdx] = useState(0);
  const e = equations[idx];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Order = highest derivative. Degree = power of highest derivative.</h4>
      <div className="mb-3 flex flex-wrap gap-2">
        {equations.map((_, i) => (<button key={i} onClick={() => setIdx(i)} className={"rounded-full px-3 py-1.5 text-xs font-semibold " + (idx === i ? "bg-indigo-600 text-white" : "bg-white text-slate-600")}>Eqn {i + 1}</button>))}
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="text-center font-mono text-base text-slate-800">{e.eq}</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-indigo-50 p-3"><div className="text-[10px] uppercase text-indigo-700">Order</div><div className="text-2xl font-bold text-indigo-700">{e.order}</div></div>
          <div className="rounded-xl bg-blue-50 p-3"><div className="text-[10px] uppercase text-blue-700">Degree</div><div className="text-2xl font-bold text-blue-700">{e.degree}</div></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Initial-value problem
// ============================================================================
function IVPDemo() {
  const [C, setC] = useState(1);
  // dy/dx = 2x, general: y = x² + C. IVP: y(0) = ? → C
  const cx = 200, cy = 200, scale = 30;
  const sX = (x: number) => cx + x * scale;
  const sY = (y: number) => cy - y * scale;
  const pts: string[] = [];
  for (let x = -4; x <= 4; x += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${sX(x)},${sY(x * x + C)}`);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">General solution: y = x² + C. Slide C to find the one passing through y(0).</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">C = {C}</span>
        <input type="range" min={-4} max={4} value={C} onChange={(e) => setC(parseInt(e.target.value))} className="flex-1 accent-indigo-500" />
      </div>
      <svg viewBox="0 0 400 400" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="380" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="380" stroke="#cbd5e1" />
        <path d={pts.join(" ")} fill="none" stroke="#6366f1" strokeWidth="3" />
        <circle cx={sX(0)} cy={sY(C)} r="6" fill="#ec4899" />
        <text x={sX(0) + 12} y={sY(C)} fontSize="12" fill="#9d174d" fontWeight="700">y(0) = {C}</text>
      </svg>
      <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-center font-mono">
        Particular solution: y = x² + <strong className="text-indigo-700">{C}</strong>
      </div>
    </div>
  );
}

export default function DifferentialEquationsVizPremium() {
  const demos: DemoTab[] = [
    { id: "slope", title: "Slope field", emoji: "➡️", render: () => <SlopeFieldDemo /> },
    { id: "sep", title: "Separation", emoji: "✂️", render: () => <SeparationDemo /> },
    { id: "grow", title: "Growth / decay", emoji: "📈", render: () => <GrowthDecayDemo /> },
    { id: "od", title: "Order & degree", emoji: "🔢", render: () => <OrderDegreeDemo /> },
    { id: "ivp", title: "IVP", emoji: "🎯", render: () => <IVPDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-indigo-50 via-blue-50 to-cyan-50" />;
}
