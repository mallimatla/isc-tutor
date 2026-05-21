"use client";
import { useState, useRef, useCallback } from "react";

// f(x) = -0.2x^3 + 0.6x  on [-2, 2]
// f'(x) = -0.6x^2 + 0.6  → zeros at x = -1 (local min), x = +1 (local max)
const f = (x: number) => -0.2 * x * x * x + 0.6 * x;
const df = (x: number) => -0.6 * x * x + 0.6;

const XMIN = -2, XMAX = 2, YMIN = -1.1, YMAX = 1.1;

export default function ApplicationDerivativesVizPremium() {
  const [xVal, setXVal] = useState(0.4);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 520, H = 360;
  const padX = 50, padY = 30;
  const chartW = W - 2 * padX, chartH = H - 2 * padY;
  const xToPx = (x: number) => padX + ((x - XMIN) / (XMAX - XMIN)) * chartW;
  const yToPx = (y: number) => padY + chartH - ((y - YMIN) / (YMAX - YMIN)) * chartH;

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
      const x = XMIN + ((local.x - padX) / chartW) * (XMAX - XMIN);
      setXVal(Math.max(XMIN + 0.05, Math.min(XMAX - 0.05, Math.round(x * 100) / 100)));
    },
    [dragging]
  );

  const yVal = f(xVal);
  const slope = df(xVal);
  const atExtremum = Math.abs(slope) < 0.05;
  const extremumType = atExtremum
    ? xVal < 0
      ? "Local minimum"
      : "Local maximum"
    : slope > 0
      ? "Increasing"
      : "Decreasing";

  // Tangent line: y = slope * (x - xVal) + yVal — clip to viewport
  const tangentY = (x: number) => slope * (x - xVal) + yVal;
  const tx1 = XMIN, tx2 = XMAX;
  const ty1 = tangentY(tx1), ty2 = tangentY(tx2);

  const STEPS = 200;
  const curvePath = Array.from({ length: STEPS + 1 }, (_, i) => {
    const x = XMIN + (i / STEPS) * (XMAX - XMIN);
    return `${i === 0 ? "M" : "L"}${xToPx(x)},${yToPx(f(x))}`;
  }).join(" ");

  // Critical-point markers
  const critical = [
    { x: -1, y: f(-1), label: "min" },
    { x: 1, y: f(1), label: "max" },
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Slide the point — the tangent shows f&apos;(x)</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        {/* y-axis ticks */}
        {[-1, -0.5, 0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={padX - 4} y1={yToPx(v)} x2={padX} y2={yToPx(v)} stroke="#94a3b8" strokeWidth="1" />
            <text x={padX - 8} y={yToPx(v) + 4} fill="#94a3b8" fontSize="11" textAnchor="end">{v}</text>
          </g>
        ))}
        {/* x ticks */}
        {[-2, -1, 0, 1, 2].map((v) => (
          <g key={v}>
            <line x1={xToPx(v)} y1={yToPx(0)} x2={xToPx(v)} y2={yToPx(0) + 4} stroke="#94a3b8" strokeWidth="1" />
            <text x={xToPx(v)} y={yToPx(0) + 16} fill="#94a3b8" fontSize="11" textAnchor="middle">{v}</text>
          </g>
        ))}
        {/* axes */}
        <line x1={padX} y1={yToPx(0)} x2={W - padX} y2={yToPx(0)} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={xToPx(0)} y1={padY} x2={xToPx(0)} y2={yToPx(YMIN)} stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Critical-point indicators */}
        {critical.map((c, i) => (
          <g key={i}>
            <circle cx={xToPx(c.x)} cy={yToPx(c.y)} r="6" fill="#fbbf24" stroke="#fff" strokeWidth="2" opacity="0.85" />
            <text x={xToPx(c.x)} y={yToPx(c.y) + (c.y > 0 ? -12 : 22)} fill="#92400e" fontSize="11" fontWeight="700" textAnchor="middle">{c.label}</text>
          </g>
        ))}

        {/* Tangent line */}
        <line x1={xToPx(tx1)} y1={yToPx(ty1)} x2={xToPx(tx2)} y2={yToPx(ty2)} stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" opacity="0.75" />

        {/* Curve */}
        <path d={curvePath} fill="none" stroke="#e11d48" strokeWidth="3" />

        {/* Draggable point */}
        <circle cx={xToPx(xVal)} cy={yToPx(yVal)} r="11" fill={atExtremum ? "#fbbf24" : "#f43f5e"} stroke="#fff" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
      </svg>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">x</div>
          <div className="mt-1 text-2xl font-bold text-rose-700">{xVal.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">f(x)</div>
          <div className="mt-1 text-2xl font-bold text-red-700">{yVal.toFixed(3)}</div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-rose-700">f &prime;(x)</div>
          <div className="mt-1 text-2xl font-bold text-rose-700">{slope.toFixed(3)}</div>
        </div>
        <div className="rounded-2xl border p-4 shadow-sm" style={{ borderColor: atExtremum ? "#fbbf24" : "#e2e8f0", backgroundColor: atExtremum ? "#fffbeb" : "#fff" }}>
          <div className="text-xs font-medium uppercase tracking-wide" style={{ color: atExtremum ? "#92400e" : "#475569" }}>State</div>
          <div className="mt-1 text-base font-bold" style={{ color: atExtremum ? "#b45309" : "#334155" }}>{extremumType}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border-l-4 border-rose-500 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-700">
          Derivative = slope of tangent
        </div>
        <div className="font-mono text-base text-slate-800 sm:text-lg">
          f(x) = −0.2x³ + 0.6x &nbsp;·&nbsp; f &prime;(x) = −0.6x² + 0.6
        </div>
        <div className="mt-2 text-xs text-slate-500">
          f &prime;(x) = 0 at x = ±1 → those are the local extrema. The tangent line is horizontal exactly there.
        </div>
      </div>
    </div>
  );
}
