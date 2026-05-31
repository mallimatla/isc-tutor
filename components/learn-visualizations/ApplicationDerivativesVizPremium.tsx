"use client";
import { useState, useRef, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Tangent slider with maxima/minima
// ============================================================================
function TangentSliderDemo() {
  const f = (x: number) => -0.2 * x * x * x + 0.6 * x;
  const df = (x: number) => -0.6 * x * x + 0.6;
  const [xVal, setXVal] = useState(0.4);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 520, H = 360, padX = 50, padY = 30, chartW = W - 2 * padX, chartH = H - 2 * padY;
  const XMIN = -2, XMAX = 2, YMIN = -1.1, YMAX = 1.1;
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
    setXVal(Math.max(XMIN + 0.05, Math.min(XMAX - 0.05, Math.round(x * 100) / 100)));
  }, [dragging, XMIN, XMAX, padX, chartW]);

  const yVal = f(xVal);
  const slope = df(xVal);
  const atExt = Math.abs(slope) < 0.05;
  const state = atExt ? (xVal < 0 ? "Local min" : "Local max") : slope > 0 ? "Increasing" : "Decreasing";
  const ty1 = slope * (XMIN - xVal) + yVal, ty2 = slope * (XMAX - xVal) + yVal;
  const path = Array.from({ length: 201 }, (_, i) => { const x = XMIN + (i / 200) * (XMAX - XMIN); return `${i === 0 ? "M" : "L"}${xToPx(x)},${yToPx(f(x))}`; }).join(" ");
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Drag the dot — tangent rotates. Yellow dots = critical points.</h4>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        <line x1={padX} y1={yToPx(0)} x2={W - padX} y2={yToPx(0)} stroke="#cbd5e1" />
        <line x1={xToPx(0)} y1={padY} x2={xToPx(0)} y2={yToPx(YMIN)} stroke="#cbd5e1" />
        <circle cx={xToPx(-1)} cy={yToPx(f(-1))} r="6" fill="#fbbf24" />
        <circle cx={xToPx(1)} cy={yToPx(f(1))} r="6" fill="#fbbf24" />
        <line x1={xToPx(XMIN)} y1={yToPx(ty1)} x2={xToPx(XMAX)} y2={yToPx(ty2)} stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" />
        <path d={path} fill="none" stroke="#e11d48" strokeWidth="3" />
        <circle cx={xToPx(xVal)} cy={yToPx(yVal)} r="11" fill={atExt ? "#fbbf24" : "#f43f5e"} stroke="#fff" strokeWidth="3" className="cursor-grab" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
      </svg>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-rose-50 p-2"><div className="text-[10px] uppercase text-rose-700">x</div><div className="text-lg font-bold text-rose-700">{xVal.toFixed(2)}</div></div>
        <div className="rounded-xl bg-red-50 p-2"><div className="text-[10px] uppercase text-red-700">{"f'(x)"}</div><div className="text-lg font-bold text-red-700">{slope.toFixed(2)}</div></div>
        <div className={"rounded-xl p-2 " + (atExt ? "bg-amber-50" : "bg-white")}><div className="text-[10px] uppercase text-slate-500">State</div><div className={"text-sm font-bold " + (atExt ? "text-amber-700" : "text-slate-700")}>{state}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Increasing / Decreasing intervals
// ============================================================================
function IncDecDemo() {
  const f = (x: number) => x * x * x - 3 * x + 1;
  const cx = 200, cy = 200, scale = 25;
  const sX = (x: number) => cx + x * scale;
  const sY = (y: number) => cy - y * scale;
  const pts: string[] = [];
  for (let x = -3; x <= 3; x += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${sX(x)},${sY(f(x))}`);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"f(x) = x³ − 3x + 1. f'(x) > 0 ⇒ rising, f'(x) < 0 ⇒ falling."}</h4>
      <svg viewBox="0 0 400 320" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="380" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="300" stroke="#cbd5e1" />
        <rect x={sX(-3)} y={20} width={sX(-1) - sX(-3)} height={280} fill="#dcfce7" opacity="0.4" />
        <rect x={sX(-1)} y={20} width={sX(1) - sX(-1)} height={280} fill="#fee2e2" opacity="0.4" />
        <rect x={sX(1)} y={20} width={sX(3) - sX(1)} height={280} fill="#dcfce7" opacity="0.4" />
        <path d={pts.join(" ")} fill="none" stroke="#e11d48" strokeWidth="3" />
        <circle cx={sX(-1)} cy={sY(f(-1))} r="6" fill="#fbbf24" />
        <circle cx={sX(1)} cy={sY(f(1))} r="6" fill="#fbbf24" />
        <text x={sX(-2)} y={50} textAnchor="middle" fontSize="11" fill="#065f46" fontWeight="700">↗ inc</text>
        <text x={cx} y={50} textAnchor="middle" fontSize="11" fill="#991b1b" fontWeight="700">↘ dec</text>
        <text x={sX(2)} y={50} textAnchor="middle" fontSize="11" fill="#065f46" fontWeight="700">↗ inc</text>
      </svg>
      <div className="mt-3 rounded-xl border-l-4 border-rose-500 bg-white p-3 text-xs font-mono">
        {"f'(x) = 3x² − 3 = 0 at x = ±1. Sign of f' decides whether f is rising or falling."}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Optimization (max area of rectangle from fixed perimeter)
// ============================================================================
function OptimizationDemo() {
  const P = 20;
  const [w, setW] = useState(3);
  const h = P / 2 - w;
  const area = w * h;
  const maxA = (P / 4) * (P / 4);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Rectangle with perimeter {P}. Find width that maximizes area.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">w = {w}</span>
        <input type="range" min={1} max={9} step={0.5} value={w} onChange={(e) => setW(parseFloat(e.target.value))} className="flex-1 accent-rose-500" />
      </div>
      <svg viewBox="0 0 400 240" className="w-full rounded-2xl bg-white shadow-inner">
        <rect x="80" y={120 - h * 10} width={w * 30} height={h * 20} fill="#fda4af" stroke="#e11d48" strokeWidth="2" />
        <text x={80 + w * 15} y={140 + h * 10} textAnchor="middle" fontSize="13" fill="#991b1b" fontWeight="700">w = {w}</text>
        <text x={80 + w * 30 + 30} y={120 + h * 5} fontSize="13" fill="#991b1b" fontWeight="700">h = {h.toFixed(1)}</text>
        <text x="270" y="60" fontSize="14" fill="#7f1d1d" fontWeight="700">Area = {area.toFixed(2)}</text>
        <text x="270" y="90" fontSize="13" fill="#475569">Max = {maxA.toFixed(2)} at w = 5</text>
      </svg>
      <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm">
        At w = h = {P / 4} (a square!), area is maximized to {maxA.toFixed(2)}. dA/dw = P/2 − 2w = 0 ⇒ w = P/4.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Related rates (ladder sliding)
// ============================================================================
function RelatedRatesDemo() {
  const [t, setT] = useState(2);
  // Ladder of length 5, foot slides at 1 m/s. x = t, y = √(25 - t²)
  const L = 5;
  const safeT = Math.min(L - 0.1, t);
  const x = safeT;
  const y = Math.sqrt(L * L - x * x);
  const dy_dt = -x / y; // since dx/dt = 1
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">5m ladder against wall. Bottom slides at 1 m/s. How fast does the top fall?</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">t = {safeT.toFixed(1)}s</span>
        <input type="range" min={0.5} max={4.9} step={0.1} value={t} onChange={(e) => setT(parseFloat(e.target.value))} className="flex-1 accent-rose-500" />
      </div>
      <svg viewBox="0 0 320 260" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1="220" x2="280" y2="220" stroke="#475569" strokeWidth="3" />
        <line x1="40" y1="20" x2="40" y2="220" stroke="#475569" strokeWidth="3" />
        <line x1={40 + x * 30} y1="220" x2="40" y2={220 - y * 30} stroke="#e11d48" strokeWidth="4" />
        <circle cx={40 + x * 30} cy="220" r="6" fill="#3b82f6" />
        <circle cx="40" cy={220 - y * 30} r="6" fill="#a855f7" />
        <text x={40 + x * 15} y="240" fontSize="12" textAnchor="middle">x = {x.toFixed(1)}</text>
        <text x="20" y={220 - y * 15} fontSize="12" textAnchor="end">y = {y.toFixed(1)}</text>
      </svg>
      <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center font-mono">
        dy/dt = −(x/y)·(dx/dt) = −({x.toFixed(1)}/{y.toFixed(1)}) = <strong className="text-rose-700">{dy_dt.toFixed(2)} m/s</strong>
        <div className="text-xs text-slate-500 mt-1">(negative because top falls)</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Marginal cost / Newton method approximation
// ============================================================================
function ApproximationDemo() {
  const [x, setX] = useState(1.05);
  const f = (xv: number) => Math.sqrt(xv);
  const approx = 1 + 0.5 * (x - 1);
  const actual = f(x);
  const error = Math.abs(approx - actual);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Approximate √x near x=1 using linear approx (tangent). Useful for small Δx.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">x = {x.toFixed(3)}</span>
        <input type="range" min={0.8} max={1.5} step={0.01} value={x} onChange={(e) => setX(parseFloat(e.target.value))} className="flex-1 accent-rose-500" />
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="space-y-2">
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2">
            <span className="text-xs text-emerald-700">Linear approx:</span>{" "}
            <span className="font-mono font-bold text-emerald-800">1 + 0.5({x.toFixed(3)} − 1) = {approx.toFixed(4)}</span>
          </div>
          <div className="rounded-lg border border-rose-300 bg-rose-50 p-2">
            <span className="text-xs text-rose-700">Actual √x:</span>{" "}
            <span className="font-mono font-bold text-rose-800">{actual.toFixed(4)}</span>
          </div>
          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-2">
            <span className="text-xs text-amber-700">Error:</span>{" "}
            <span className="font-mono font-bold text-amber-800">{error.toFixed(5)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationDerivativesVizPremium() {
  const demos: DemoTab[] = [
    { id: "tan", title: "Tangent slider", emoji: "📈", render: () => <TangentSliderDemo /> },
    { id: "incdec", title: "Inc / Dec", emoji: "↗↘", render: () => <IncDecDemo /> },
    { id: "opt", title: "Max area", emoji: "🎯", render: () => <OptimizationDemo /> },
    { id: "rates", title: "Related rates", emoji: "🪜", render: () => <RelatedRatesDemo /> },
    { id: "approx", title: "Linear approx", emoji: "📏", render: () => <ApproximationDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-rose-50 via-red-50 to-pink-50" />;
}
