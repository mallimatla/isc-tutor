"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Number line for one-variable inequality
// ============================================================================
function NumberLineDemo() {
  const [op, setOp] = useState<"≤" | "<" | "≥" | ">">("<");
  const [val, setVal] = useState(2);
  const closed = op === "≤" || op === "≥";
  const rightward = op === ">" || op === "≥";
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Pick the operator & value. Open circle = strict (< or >), closed = ≤ or ≥."}</h4>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["<", "≤", ">", "≥"] as const).map((o) => (
          <button key={o} onClick={() => setOp(o)} className={"rounded-full px-3 py-1.5 text-sm font-bold font-mono " + (op === o ? "bg-rose-600 text-white" : "bg-white text-slate-600")}>x {o} {val}</button>
        ))}
      </div>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">value = {val}</span>
        <input type="range" min={-5} max={5} value={val} onChange={(e) => setVal(parseInt(e.target.value))} className="flex-1 accent-rose-500" />
      </div>
      <svg viewBox="0 0 420 100" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1="50" x2="400" y2="50" stroke="#cbd5e1" strokeWidth="2" />
        {Array.from({ length: 11 }, (_, i) => i - 5).map((n) => (
          <g key={n}>
            <line x1={210 + n * 30} y1="44" x2={210 + n * 30} y2="56" stroke="#94a3b8" />
            <text x={210 + n * 30} y="78" textAnchor="middle" fontSize="11" fill="#64748b">{n}</text>
          </g>
        ))}
        {rightward ? (
          <line x1={210 + val * 30} y1="50" x2="400" y2="50" stroke="#f43f5e" strokeWidth="5" />
        ) : (
          <line x1="20" y1="50" x2={210 + val * 30} y2="50" stroke="#f43f5e" strokeWidth="5" />
        )}
        <circle cx={210 + val * 30} cy="50" r="8" fill={closed ? "#f43f5e" : "#fff"} stroke="#f43f5e" strokeWidth="3" />
      </svg>
      <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center font-mono">
        Solution: {rightward ? (closed ? `[${val}, ∞)` : `(${val}, ∞)`) : (closed ? `(−∞, ${val}]` : `(−∞, ${val})`)}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Half-plane for 2D inequality
// ============================================================================
function HalfPlaneDemo() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [c, setC] = useState(3);
  const [op, setOp] = useState<"≤" | "≥">("≤");
  const sX = (x: number) => 200 + x * 30;
  const sY = (y: number) => 180 - y * 30;
  const lineY = (x: number) => (c - a * x) / (b || 0.0001);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">ax + by ≤ c — shaded region is the solution.</h4>
      <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl bg-white p-3 shadow-inner text-xs">
        <div className="flex items-center gap-2"><span className="w-12 font-mono">a={a}</span><input type="range" min={-3} max={3} value={a} onChange={(e) => setA(parseInt(e.target.value) || 1)} className="flex-1 accent-rose-500" /></div>
        <div className="flex items-center gap-2"><span className="w-12 font-mono">b={b}</span><input type="range" min={-3} max={3} value={b} onChange={(e) => setB(parseInt(e.target.value) || 1)} className="flex-1 accent-rose-500" /></div>
        <div className="flex items-center gap-2"><span className="w-12 font-mono">c={c}</span><input type="range" min={-5} max={5} value={c} onChange={(e) => setC(parseInt(e.target.value))} className="flex-1 accent-rose-500" /></div>
        <div className="flex gap-1">
          <button onClick={() => setOp("≤")} className={"flex-1 rounded-full px-2 py-1 text-xs font-bold " + (op === "≤" ? "bg-rose-600 text-white" : "bg-white text-slate-600")}>≤</button>
          <button onClick={() => setOp("≥")} className={"flex-1 rounded-full px-2 py-1 text-xs font-bold " + (op === "≥" ? "bg-rose-600 text-white" : "bg-white text-slate-600")}>≥</button>
        </div>
      </div>
      <svg viewBox="0 0 400 360" className="w-full rounded-2xl bg-white shadow-inner">
        <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#fb7185" strokeWidth="1.5" opacity="0.5" /></pattern></defs>
        <line x1="20" y1="180" x2="380" y2="180" stroke="#cbd5e1" />
        <line x1="200" y1="20" x2="200" y2="340" stroke="#cbd5e1" />
        {/* Fill region based on op */}
        <polygon points={op === "≤" ? `${sX(-6)},${sY(lineY(-6))} ${sX(6)},${sY(lineY(6))} ${sX(6)},340 ${sX(-6)},340` : `${sX(-6)},${sY(lineY(-6))} ${sX(6)},${sY(lineY(6))} ${sX(6)},20 ${sX(-6)},20`} fill="url(#hatch)" />
        <line x1={sX(-6)} y1={sY(lineY(-6))} x2={sX(6)} y2={sY(lineY(6))} stroke="#f43f5e" strokeWidth="3" />
      </svg>
      <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center font-mono">
        {a}x + {b}y {op} {c}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: System of inequalities (intersection)
// ============================================================================
function SystemDemo() {
  const sX = (x: number) => 40 + x * 35;
  const sY = (y: number) => 280 - y * 35;
  // x ≥ 0, y ≥ 0, x + y ≤ 6, 2x + y ≤ 8
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Multiple inequalities — solution = intersection of all half-planes."}</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner space-y-1 font-mono text-xs text-slate-700">
        <div>x ≥ 0</div>
        <div>y ≥ 0</div>
        <div>x + y ≤ 6</div>
        <div>2x + y ≤ 8</div>
      </div>
      <svg viewBox="0 0 380 320" className="mt-3 w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1="280" x2="360" y2="280" stroke="#cbd5e1" />
        <line x1="40" y1="20" x2="40" y2="280" stroke="#cbd5e1" />
        <polygon points={`${sX(0)},${sY(0)} ${sX(4)},${sY(0)} ${sX(2)},${sY(4)} ${sX(0)},${sY(6)}`} fill="#22c55e" fillOpacity="0.4" stroke="#16a34a" strokeWidth="2" />
        <text x={sX(0) - 10} y={sY(0) + 12} fontSize="10" fill="#475569">O</text>
        <text x={sX(4)} y={sY(0) + 16} fontSize="10" fill="#475569">(4,0)</text>
        <text x={sX(2) + 5} y={sY(4)} fontSize="10" fill="#475569">(2,4)</text>
        <text x={sX(0) - 24} y={sY(6) + 4} fontSize="10" fill="#475569">(0,6)</text>
      </svg>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm">
        4 corner points: (0,0), (4,0), (2,4), (0,6).
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Solving an inequality step-by-step
// ============================================================================
function SolveStepsDemo() {
  const steps = [
    "3x − 5 < 7",
    "3x < 12          (add 5 both sides)",
    "x < 4            (divide by 3, positive so flip stays)",
  ];
  const [step, setStep] = useState(0);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Solve 3x − 5 &lt; 7 — watch each move.</h4>
      <div className="space-y-2 rounded-2xl bg-white p-4 shadow-inner">
        {steps.map((s, i) => (
          <div key={i} className={"rounded-xl p-3 font-mono text-sm transition " + (i <= step ? "bg-rose-50 text-rose-900" : "bg-zinc-50 text-zinc-300")}>
            {s}
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button onClick={() => setStep(Math.max(0, step - 1))} className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow">← Back</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white">Next step →</button>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Flip rule — negative coefficient
// ============================================================================
function FlipRuleDemo() {
  const [k, setK] = useState(-2);
  const flip = k < 0;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Multiplying/dividing by a negative number flips the inequality.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">multiplier k = {k}</span>
        <input type="range" min={-5} max={5} value={k} onChange={(e) => setK(parseInt(e.target.value) || 1)} className="flex-1 accent-rose-500" />
      </div>
      <div className="space-y-2 rounded-2xl bg-white p-4 shadow-inner font-mono text-sm">
        <div className="rounded-lg bg-zinc-50 p-2">x &lt; 5</div>
        <div className={"rounded-lg p-2 " + (flip ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800")}>
          Multiply by {k} → {k}x {flip ? ">" : "<"} {k * 5}
        </div>
        <div className={"rounded-lg border-l-4 p-2 text-xs " + (flip ? "border-amber-500 bg-amber-50" : "border-emerald-500 bg-emerald-50")}>
          {flip ? "⚠️ negative → flip the inequality sign" : "✓ positive → sign stays the same"}
        </div>
      </div>
    </div>
  );
}

export default function LinearInequalitiesVizPremium() {
  const demos: DemoTab[] = [
    { id: "line", title: "Number line", emoji: "📏", render: () => <NumberLineDemo /> },
    { id: "plane", title: "Half-plane", emoji: "🟥", render: () => <HalfPlaneDemo /> },
    { id: "sys", title: "System (2D)", emoji: "⛶", render: () => <SystemDemo /> },
    { id: "solve", title: "Solve steps", emoji: "🧮", render: () => <SolveStepsDemo /> },
    { id: "flip", title: "Flip rule", emoji: "🔄", render: () => <FlipRuleDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-rose-50 via-pink-50 to-red-50" />;
}
