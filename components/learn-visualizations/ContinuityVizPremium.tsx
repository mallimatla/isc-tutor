"use client";
import { useState, useRef, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Jump discontinuity slider
// ============================================================================
function JumpDemo() {
  const f = (x: number) => (x < 1 ? x + 1 : x + 3);
  const [xVal, setXVal] = useState(1);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 520, H = 360, padX = 50, padY = 30, chartW = W - 2 * padX, chartH = H - 2 * padY;
  const XMIN = -2, XMAX = 4, YMIN = -1, YMAX = 7;
  const xToPx = (x: number) => padX + ((x - XMIN) / (XMAX - XMIN)) * chartW;
  const yToPx = (y: number) => padY + chartH - ((y - YMIN) / (YMAX - YMIN)) * chartH;
  const onMove = useCallback((e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    const isTouch = "touches" in e;
    pt.x = isTouch ? e.touches[0].clientX : e.clientX;
    pt.y = isTouch ? e.touches[0].clientY : e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const x = XMIN + ((local.x - padX) / chartW) * (XMAX - XMIN);
    setXVal(Math.max(XMIN + 0.5, Math.min(XMAX - 0.5, Math.round(x * 20) / 20)));
  }, [dragging, XMIN, XMAX, padX, chartW]);
  const lVal = xVal < 1 ? xVal + 1 : xVal === 1 ? 2 : xVal + 3;
  const rVal = xVal < 1 ? xVal + 1 : xVal === 1 ? 4 : xVal + 3;
  const fVal = f(xVal);
  const cont = Math.abs(lVal - rVal) < 0.01 && Math.abs(fVal - lVal) < 0.01;
  const left = Array.from({ length: 151 }, (_, i) => { const x = XMIN + (i / 150) * (1 - XMIN); return `${i === 0 ? "M" : "L"}${xToPx(x)},${yToPx(f(x))}`; }).join(" ");
  const right = Array.from({ length: 151 }, (_, i) => { const x = 1 + (i / 150) * (XMAX - 1); return `${i === 0 ? "M" : "L"}${xToPx(x)},${yToPx(f(x))}`; }).join(" ");
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Slide x toward 1. LHL ≠ RHL at x=1 → jump discontinuity.</h4>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        <line x1={padX} y1={yToPx(0)} x2={W - padX} y2={yToPx(0)} stroke="#cbd5e1" />
        <line x1={xToPx(0)} y1={padY} x2={xToPx(0)} y2={yToPx(YMIN)} stroke="#cbd5e1" />
        <line x1={xToPx(xVal)} y1={padY} x2={xToPx(xVal)} y2={yToPx(YMIN)} stroke="#6366f1" strokeDasharray="4 4" />
        <path d={left} fill="none" stroke="#3b82f6" strokeWidth="3" />
        <path d={right} fill="none" stroke="#6366f1" strokeWidth="3" />
        <circle cx={xToPx(1)} cy={yToPx(2)} r="5" fill="#fff" stroke="#3b82f6" strokeWidth="2.5" />
        <circle cx={xToPx(1)} cy={yToPx(4)} r="5" fill="#6366f1" stroke="#fff" strokeWidth="2" />
        <circle cx={xToPx(xVal)} cy={yToPx(0)} r="10" fill="#6366f1" stroke="#fff" strokeWidth="2.5" className="cursor-grab" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
      </svg>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-blue-50 p-2"><div className="text-[10px] uppercase text-blue-700">LHL</div><div className="text-xl font-bold text-blue-700">{lVal.toFixed(2)}</div></div>
        <div className="rounded-xl bg-indigo-50 p-2"><div className="text-[10px] uppercase text-indigo-700">RHL</div><div className="text-xl font-bold text-indigo-700">{rVal.toFixed(2)}</div></div>
        <div className="rounded-xl bg-slate-50 p-2"><div className="text-[10px] uppercase text-slate-500">f(x)</div><div className="text-xl font-bold text-slate-700">{fVal.toFixed(2)}</div></div>
      </div>
      <div className={"mt-2 rounded-xl border-l-4 p-3 text-sm " + (cont ? "border-emerald-500 bg-emerald-50" : "border-amber-500 bg-amber-50")}>
        {cont ? "Continuous here — three values agree." : "Jump here — LHL ≠ RHL."}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Differentiability — sharp corners
// ============================================================================
function DifferentiabilityDemo() {
  const [type, setType] = useState<"smooth" | "corner" | "cusp">("corner");
  const cx = 200, cy = 220, scale = 50;
  const sX = (x: number) => cx + x * scale;
  const sY = (y: number) => cy - y * scale;
  const pts: string[] = [];
  if (type === "smooth") for (let x = -3; x <= 3; x += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${sX(x)},${sY(x * x * 0.3)}`);
  else if (type === "corner") for (let x = -3; x <= 3; x += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${sX(x)},${sY(Math.abs(x))}`);
  else for (let x = -3; x <= 3; x += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${sX(x)},${sY(Math.pow(Math.abs(x), 2 / 3))}`);
  const desc = type === "smooth" ? "Differentiable everywhere ✓" : type === "corner" ? "Continuous, but NOT differentiable at the corner" : "Continuous, but tangent is vertical at the cusp — not differentiable";
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Continuous ≠ differentiable. Sharp corners and cusps break differentiability.</h4>
      <div className="mb-3 flex gap-2">
        {(["smooth", "corner", "cusp"] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition " + (type === t ? "bg-indigo-600 text-white" : "bg-white text-slate-600")}>{t}</button>
        ))}
      </div>
      <svg viewBox="0 0 400 320" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="380" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="300" stroke="#cbd5e1" />
        <path d={pts.join(" ")} fill="none" stroke="#6366f1" strokeWidth="3" />
      </svg>
      <div className={"mt-3 rounded-xl border-l-4 p-3 text-sm " + (type === "smooth" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-amber-500 bg-amber-50 text-amber-800")}>
        {desc}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Mean Value Theorem visualization
// ============================================================================
function MVTDemo() {
  const [a, setA] = useState(-2);
  const [b, setB] = useState(2);
  const f = (x: number) => 0.3 * x * x * x - x;
  const fp = (x: number) => 0.9 * x * x - 1;
  // Find c where f'(c) = (f(b)-f(a))/(b-a)
  const slope = (f(b) - f(a)) / (b - a);
  // Solve 0.9c² - 1 = slope → c = ±√((slope+1)/0.9)
  const cArg = (slope + 1) / 0.9;
  const c = cArg >= 0 ? Math.sqrt(cArg) : NaN;
  const cValid = isFinite(c) && c >= a && c <= b;
  const cx = 200, cy = 200, scale = 30;
  const sX = (x: number) => cx + x * scale;
  const sY = (y: number) => cy - y * scale;
  const pts: string[] = [];
  for (let x = -4; x <= 4; x += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${sX(x)},${sY(f(x))}`);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">MVT: somewhere between a and b, the tangent is parallel to the chord.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">a = {a}</span><input type="range" min={-3} max={0} step={0.1} value={a} onChange={(e) => setA(parseFloat(e.target.value))} className="flex-1 accent-indigo-500" /></div>
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">b = {b}</span><input type="range" min={0} max={3} step={0.1} value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="flex-1 accent-blue-500" /></div>
      </div>
      <svg viewBox="0 0 400 300" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="380" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="280" stroke="#cbd5e1" />
        <path d={pts.join(" ")} fill="none" stroke="#6366f1" strokeWidth="2.5" />
        <line x1={sX(a)} y1={sY(f(a))} x2={sX(b)} y2={sY(f(b))} stroke="#3b82f6" strokeWidth="2.5" />
        <circle cx={sX(a)} cy={sY(f(a))} r="6" fill="#3b82f6" />
        <circle cx={sX(b)} cy={sY(f(b))} r="6" fill="#3b82f6" />
        {cValid && (
          <>
            <line x1={sX(c - 1.2)} y1={sY(f(c) - 1.2 * fp(c))} x2={sX(c + 1.2)} y2={sY(f(c) + 1.2 * fp(c))} stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx={sX(c)} cy={sY(f(c))} r="6" fill="#ef4444" />
          </>
        )}
      </svg>
      <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-center font-mono text-sm">
        Average slope = ({f(b).toFixed(2)} − {f(a).toFixed(2)}) / ({b} − {a}) = <strong className="text-indigo-700">{slope.toFixed(2)}</strong>
        {cValid && <div className="text-xs text-slate-600 mt-1">{`At c ≈ ${c.toFixed(2)}, f'(c) = ${fp(c).toFixed(2)} ✓`}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Removable vs essential discontinuity
// ============================================================================
function DiscontinuityTypesDemo() {
  const [type, setType] = useState<"removable" | "jump" | "infinite">("removable");
  const cx = 200, cy = 180, scale = 40;
  const sX = (x: number) => cx + x * scale;
  const sY = (y: number) => cy - y * scale;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Three flavors of discontinuity.</h4>
      <div className="mb-3 flex gap-2">
        {(["removable", "jump", "infinite"] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={"flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition " + (type === t ? "bg-indigo-600 text-white" : "bg-white text-slate-600")}>{t}</button>
        ))}
      </div>
      <svg viewBox="0 0 400 280" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="380" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="260" stroke="#cbd5e1" />
        {type === "removable" && (() => {
          const pts: string[] = [];
          for (let x = -4; x <= 4; x += 0.05) {
            if (Math.abs(x - 1) < 0.04) continue;
            pts.push(`${pts.length === 0 ? "M" : "L"}${sX(x)},${sY(x + 1)}`);
          }
          return <><path d={pts.join(" ")} fill="none" stroke="#6366f1" strokeWidth="3" /><circle cx={sX(1)} cy={sY(2)} r="6" fill="white" stroke="#6366f1" strokeWidth="2.5" /></>;
        })()}
        {type === "jump" && (() => {
          const left: string[] = []; for (let x = -4; x < 1; x += 0.05) left.push(`${left.length === 0 ? "M" : "L"}${sX(x)},${sY(x + 1)}`);
          const right: string[] = []; for (let x = 1; x <= 4; x += 0.05) right.push(`${right.length === 0 ? "M" : "L"}${sX(x)},${sY(x - 1)}`);
          return <><path d={left.join(" ")} fill="none" stroke="#6366f1" strokeWidth="3" /><path d={right.join(" ")} fill="none" stroke="#6366f1" strokeWidth="3" /><circle cx={sX(1)} cy={sY(2)} r="5" fill="white" stroke="#6366f1" strokeWidth="2.5" /><circle cx={sX(1)} cy={sY(0)} r="5" fill="#6366f1" /></>;
        })()}
        {type === "infinite" && (() => {
          const left: string[] = []; const right: string[] = [];
          for (let x = -4; x < 0.95; x += 0.05) { const y = 1 / (x - 1); if (Math.abs(y) < 5) left.push(`${left.length === 0 ? "M" : "L"}${sX(x)},${sY(y)}`); }
          for (let x = 1.05; x <= 4; x += 0.05) { const y = 1 / (x - 1); if (Math.abs(y) < 5) right.push(`${right.length === 0 ? "M" : "L"}${sX(x)},${sY(y)}`); }
          return <><path d={left.join(" ")} fill="none" stroke="#6366f1" strokeWidth="3" /><path d={right.join(" ")} fill="none" stroke="#6366f1" strokeWidth="3" /><line x1={sX(1)} y1={20} x2={sX(1)} y2={260} stroke="#a855f7" strokeDasharray="3 3" /></>;
        })()}
      </svg>
      <div className="mt-3 rounded-xl border-l-4 border-indigo-500 bg-white p-3 text-xs">
        {type === "removable" && "Removable: a single missing point — could be 'patched up'."}
        {type === "jump" && "Jump: function leaps; LHL ≠ RHL."}
        {type === "infinite" && "Infinite: f explodes to ±∞ (vertical asymptote)."}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Piecewise function builder
// ============================================================================
function PiecewiseDemo() {
  const [k, setK] = useState(3);
  // f(x) = x² for x ≤ 1, kx + 1 for x > 1
  // Continuous at 1 iff k(1) + 1 = 1² → k = 0
  // Actually: 1² = 1, k(1)+1 = k+1. So continuous iff k=0
  const cx = 200, cy = 200, scale = 50;
  const sX = (x: number) => cx + x * scale;
  const sY = (y: number) => cy - y * scale;
  const left: string[] = [];
  for (let x = -2; x <= 1; x += 0.05) left.push(`${left.length === 0 ? "M" : "L"}${sX(x)},${sY(x * x)}`);
  const right: string[] = [];
  for (let x = 1; x <= 3; x += 0.05) right.push(`${right.length === 0 ? "M" : "L"}${sX(x)},${sY(k * x + 1)}`);
  const cont = Math.abs(1 - (k + 1)) < 0.05;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Find k so the piecewise function is continuous. Try k = 0!</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">k = {k.toFixed(1)}</span>
        <input type="range" min={-2} max={3} step={0.1} value={k} onChange={(e) => setK(parseFloat(e.target.value))} className="flex-1 accent-indigo-500" />
      </div>
      <div className="text-xs text-slate-600 mb-2 font-mono">f(x) = x²  if x ≤ 1;  kx + 1  if x &gt; 1</div>
      <svg viewBox="0 0 400 300" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="380" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="280" stroke="#cbd5e1" />
        <path d={left.join(" ")} fill="none" stroke="#3b82f6" strokeWidth="3" />
        <path d={right.join(" ")} fill="none" stroke="#a855f7" strokeWidth="3" />
        <circle cx={sX(1)} cy={sY(1)} r="5" fill="#3b82f6" />
        <circle cx={sX(1)} cy={sY(k + 1)} r="5" fill={cont ? "#3b82f6" : "white"} stroke="#a855f7" strokeWidth="2.5" />
      </svg>
      <div className={"mt-3 rounded-xl border-l-4 p-3 text-sm " + (cont ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50")}>
        LHL(at 1) = 1, RHL(at 1) = {(k + 1).toFixed(1)} — {cont ? "matched ✓ continuous" : "mismatch ❌ discontinuous"}
      </div>
    </div>
  );
}

export default function ContinuityVizPremium() {
  const demos: DemoTab[] = [
    { id: "jump", title: "Jump", emoji: "🪜", render: () => <JumpDemo /> },
    { id: "diff", title: "Differentiable?", emoji: "✏️", render: () => <DifferentiabilityDemo /> },
    { id: "mvt", title: "MVT", emoji: "📐", render: () => <MVTDemo /> },
    { id: "types", title: "Disc. types", emoji: "❓", render: () => <DiscontinuityTypesDemo /> },
    { id: "piece", title: "Piecewise", emoji: "🧩", render: () => <PiecewiseDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-indigo-50 via-blue-50 to-slate-50" />;
}
