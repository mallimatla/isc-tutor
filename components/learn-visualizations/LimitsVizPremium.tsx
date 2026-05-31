"use client";
import { useState, useRef, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: sin x / x limit
// ============================================================================
function SinxOverXDemo() {
  const [xVal, setXVal] = useState(1.5);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const f = (x: number) => (x === 0 ? NaN : Math.sin(x) / x);
  const toSvgX = (x: number) => 260 + x * 50;
  const toSvgY = (y: number) => 200 - y * 150;
  const yVal = f(xVal);

  const onMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
      if (!dragging || !svgRef.current) return;
      const pt = svgRef.current.createSVGPoint();
      const isTouch = "touches" in e;
      pt.x = isTouch ? e.touches[0].clientX : e.clientX;
      pt.y = isTouch ? e.touches[0].clientY : e.clientY;
      const ctm = svgRef.current.getScreenCTM();
      if (!ctm) return;
      const local = pt.matrixTransform(ctm.inverse());
      const x = (local.x - 260) / 50;
      setXVal(Math.max(-4.5, Math.min(4.5, Math.round(x * 100) / 100)));
    },
    [dragging]
  );

  const pts = [];
  for (let x = -5; x <= 5; x += 0.05) {
    if (Math.abs(x) < 0.01) continue;
    const y = f(x);
    pts.push(`${pts.length === 0 || Math.abs(x - 0.01) < 0.06 ? "M" : "L"}${toSvgX(x)},${toSvgY(y)}`);
  }
  const isNearZero = Math.abs(xVal) < 0.05;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Drag x toward 0 — sin(x)/x approaches 1.</h4>
      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        <line x1="30" y1="340" x2="500" y2="340" stroke="#e2e8f0" />
        <line x1="260" y1="20" x2="260" y2="380" stroke="#e2e8f0" />
        <path d={pts.join(" ")} fill="none" stroke="#ec4899" strokeWidth="3" />
        <circle cx="260" cy={toSvgY(1)} r="5" fill="none" stroke="#ec4899" strokeWidth="2" />
        {!isNearZero && (
          <>
            <line x1={toSvgX(xVal)} y1={toSvgY(yVal)} x2={toSvgX(xVal)} y2="340" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx={toSvgX(xVal)} cy={toSvgY(yVal)} r="6" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
          </>
        )}
        <circle cx={toSvgX(xVal)} cy="340" r="10" fill="#ec4899" stroke="#fff" strokeWidth="2" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
        <text x="265" y={toSvgY(1) + 4} fill="#64748b" fontSize="11">limit = 1</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white p-3 text-center"><div className="text-[10px] uppercase text-slate-500">x</div><div className="text-xl font-bold text-pink-600">{xVal.toFixed(2)}</div></div>
        <div className="rounded-xl bg-rose-50 p-3 text-center"><div className="text-[10px] uppercase text-rose-700">sin(x)/x</div><div className="text-xl font-bold text-rose-600">{isNearZero ? "undefined" : yVal.toFixed(4)}</div></div>
      </div>
      {isNearZero && (<div className="mt-2 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3 text-xs">Open circle = hole. f(0) is undefined but limit is 1.</div>)}
    </div>
  );
}

// ============================================================================
// Demo 2: Secant → Tangent
// ============================================================================
function SecantTangentDemo() {
  const [h, setH] = useState(1.5);
  const x0 = 1;
  const f = (x: number) => x * x;
  const cx = 80, cy = 280;
  const sX = (x: number) => cx + x * 50;
  const sY = (y: number) => cy - y * 30;
  const pts = [];
  for (let x = -1; x <= 5; x += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${sX(x)},${sY(f(x))}`);
  const slope = (f(x0 + h) - f(x0)) / h;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Secant → tangent. Slide h toward 0 and watch the slope settle on f'(1) = 2."}</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">h =</span>
        <input type="range" min={0.05} max={3} step={0.05} value={h} onChange={(e) => setH(parseFloat(e.target.value))} className="flex-1 accent-pink-500" />
        <span className="w-12 text-center font-mono text-pink-600">{h.toFixed(2)}</span>
      </div>
      <svg viewBox="0 0 380 320" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="360" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="300" stroke="#cbd5e1" />
        <path d={pts.join(" ")} fill="none" stroke="#ec4899" strokeWidth="3" />
        <line x1={sX(x0)} y1={sY(f(x0))} x2={sX(x0 + h)} y2={sY(f(x0 + h))} stroke="#3b82f6" strokeWidth="2" />
        <circle cx={sX(x0)} cy={sY(f(x0))} r="6" fill="#3b82f6" />
        <circle cx={sX(x0 + h)} cy={sY(f(x0 + h))} r="6" fill="#a855f7" />
      </svg>
      <div className="mt-3 rounded-xl bg-pink-50 p-3 text-center font-mono">
        slope = [({x0 + h})² − {x0}²] / {h.toFixed(2)} = <strong className="text-pink-700">{slope.toFixed(3)}</strong>
        <div className="text-[10px] text-slate-500">limit as h→0 is 2</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Left-hand vs right-hand limit
// ============================================================================
function OneSidedDemo() {
  const [x, setX] = useState(0.5);
  const f = (xv: number) => xv >= 1 ? xv + 1 : xv;
  const cx = 60, cy = 200;
  const sX = (xv: number) => cx + xv * 80;
  const sY = (yv: number) => cy - yv * 40;
  const ptsL = [];
  for (let xv = -1; xv < 1; xv += 0.05) ptsL.push(`${ptsL.length === 0 ? "M" : "L"}${sX(xv)},${sY(f(xv))}`);
  const ptsR = [];
  for (let xv = 1; xv <= 3; xv += 0.05) ptsR.push(`${ptsR.length === 0 ? "M" : "L"}${sX(xv)},${sY(f(xv))}`);
  const yL = 1, yR = 2;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Jump discontinuity at x = 1. Left limit ≠ right limit ⇒ limit doesn't exist."}</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <input type="range" min={-0.5} max={2.5} step={0.05} value={x} onChange={(e) => setX(parseFloat(e.target.value))} className="flex-1 accent-pink-500" />
        <span className="w-12 text-center font-mono">x={x.toFixed(2)}</span>
      </div>
      <svg viewBox="0 0 380 280" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="360" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="260" stroke="#cbd5e1" />
        <path d={ptsL.join(" ")} fill="none" stroke="#ec4899" strokeWidth="3" />
        <path d={ptsR.join(" ")} fill="none" stroke="#ec4899" strokeWidth="3" />
        <circle cx={sX(1)} cy={sY(yL)} r="5" fill="white" stroke="#ec4899" strokeWidth="2" />
        <circle cx={sX(1)} cy={sY(yR)} r="6" fill="#ec4899" stroke="white" strokeWidth="2" />
        <line x1={sX(x)} y1="20" x2={sX(x)} y2="260" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-blue-50 p-3 text-center"><div className="text-[10px] uppercase text-blue-700">x → 1⁻</div><div className="font-mono text-xl font-bold text-blue-700">1</div></div>
        <div className="rounded-xl bg-violet-50 p-3 text-center"><div className="text-[10px] uppercase text-violet-700">x → 1⁺</div><div className="font-mono text-xl font-bold text-violet-700">2</div></div>
      </div>
      <div className="mt-2 rounded-xl border-l-4 border-rose-500 bg-rose-50 p-3 text-sm">1 ≠ 2 ⇒ limit at x=1 does <strong>not</strong> exist.</div>
    </div>
  );
}

// ============================================================================
// Demo 4: Derivative rules — sum, product, chain
// ============================================================================
function DerivRulesDemo() {
  const [rule, setRule] = useState<"sum" | "product" | "chain">("sum");
  const rules = {
    sum: { name: "Sum Rule", formula: "(f + g)' = f' + g'", example: "(x² + sin x)' = 2x + cos x" },
    product: { name: "Product Rule", formula: "(f · g)' = f'g + fg'", example: "(x² · sin x)' = 2x sin x + x² cos x" },
    chain: { name: "Chain Rule", formula: "(f(g(x)))' = f'(g(x)) · g'(x)", example: "(sin(x²))' = cos(x²) · 2x" },
  };
  const r = rules[rule];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">The three big derivative rules.</h4>
      <div className="mb-3 flex gap-2">
        {(["sum", "product", "chain"] as const).map((k) => (
          <button key={k} onClick={() => setRule(k)} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition " + (rule === k ? "bg-pink-600 text-white" : "bg-white text-slate-600")}>{k}</button>
        ))}
      </div>
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-inner">
        <div className="text-lg font-bold text-pink-700">{r.name}</div>
        <div className="rounded-xl bg-pink-50 p-3 font-mono text-base text-pink-800">{r.formula}</div>
        <div className="text-xs uppercase text-slate-500">Example</div>
        <div className="rounded-xl border border-rose-200 bg-white p-3 font-mono text-sm text-slate-700">{r.example}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Tangent line slope at any x
// ============================================================================
function TangentDemo() {
  const [x0, setX0] = useState(1);
  const f = (x: number) => x * x;
  const fp = (x: number) => 2 * x;
  const cx = 200, cy = 260, scale = 30;
  const sX = (x: number) => cx + x * scale;
  const sY = (y: number) => cy - y * scale;
  const pts = [];
  for (let x = -4; x <= 4; x += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${sX(x)},${sY(f(x))}`);
  const slope = fp(x0);
  const intercept = f(x0) - slope * x0;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">y = x², slope at x = 2x. Slide x and see the tangent rotate.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <input type="range" min={-3} max={3} step={0.1} value={x0} onChange={(e) => setX0(parseFloat(e.target.value))} className="flex-1 accent-pink-500" />
        <span className="w-12 text-center font-mono">x={x0.toFixed(1)}</span>
      </div>
      <svg viewBox="0 0 400 300" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="380" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="280" stroke="#cbd5e1" />
        <path d={pts.join(" ")} fill="none" stroke="#ec4899" strokeWidth="3" />
        <line x1={sX(-4)} y1={sY(slope * -4 + intercept)} x2={sX(4)} y2={sY(slope * 4 + intercept)} stroke="#a855f7" strokeWidth="2.5" />
        <circle cx={sX(x0)} cy={sY(f(x0))} r="7" fill="#a855f7" stroke="white" strokeWidth="2" />
      </svg>
      <div className="mt-3 rounded-xl bg-pink-50 p-3 text-center font-mono">
        {`f'(${x0.toFixed(1)}) = 2·${x0.toFixed(1)} = `}<strong className="text-pink-700">{slope.toFixed(2)}</strong>
      </div>
    </div>
  );
}

export default function LimitsVizPremium() {
  const demos: DemoTab[] = [
    { id: "sinx", title: "sin x / x → 1", emoji: "🎯", render: () => <SinxOverXDemo /> },
    { id: "sec", title: "Secant→tangent", emoji: "📐", render: () => <SecantTangentDemo /> },
    { id: "side", title: "Left vs right", emoji: "↔️", render: () => <OneSidedDemo /> },
    { id: "rules", title: "Deriv. rules", emoji: "📋", render: () => <DerivRulesDemo /> },
    { id: "tan", title: "Tangent line", emoji: "📏", render: () => <TangentDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-pink-50 via-rose-50 to-fuchsia-50" />;
}
