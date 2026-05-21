"use client";
import { useState, useRef, useCallback } from "react";

// Piecewise:
//   f(x) = x + 1        for x < 1
//   f(x) = (x - 1)^2 + 2 for x >= 1
// This has a jump at x = 1: lhl = 2, rhl = 2 (actually continuous in this case).
//
// Use a true jump instead:
//   f(x) = x + 1        for x < 1
//   f(x) = x + 3        for x >= 1
// Then lhl at 1 = 2, rhl at 1 = 4, f(1) = 4 → jump discontinuity.
const f = (x: number) => (x < 1 ? x + 1 : x + 3);
const lhl = (x0: number) => (x0 < 1 ? x0 + 1 : x0 === 1 ? 2 : x0 + 3);
const rhl = (x0: number) => (x0 < 1 ? x0 + 1 : x0 === 1 ? 4 : x0 + 3);

export default function ContinuityVizPremium() {
  const [xVal, setXVal] = useState(1);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 520, H = 360;
  const padX = 50, padY = 30;
  const chartW = W - 2 * padX, chartH = H - 2 * padY;
  const XMIN = -2, XMAX = 4, YMIN = -1, YMAX = 7;
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
      setXVal(Math.max(XMIN + 0.5, Math.min(XMAX - 0.5, Math.round(x * 20) / 20)));
    },
    [dragging]
  );

  const fVal = f(xVal);
  const lVal = lhl(xVal);
  const rVal = rhl(xVal);
  const continuousHere = Math.abs(lVal - rVal) < 0.01 && Math.abs(fVal - lVal) < 0.01;

  const STEPS = 150;
  // Left branch path: x in [XMIN, 1)
  const leftPath = Array.from({ length: STEPS + 1 }, (_, i) => {
    const x = XMIN + (i / STEPS) * (1 - XMIN);
    return `${i === 0 ? "M" : "L"}${xToPx(x)},${yToPx(f(x))}`;
  }).join(" ");
  // Right branch path: x in [1, XMAX]
  const rightPath = Array.from({ length: STEPS + 1 }, (_, i) => {
    const x = 1 + (i / STEPS) * (XMAX - 1);
    return `${i === 0 ? "M" : "L"}${xToPx(x)},${yToPx(f(x))}`;
  }).join(" ");

  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Slide x — when do the two limits meet?</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        {/* y ticks */}
        {[0, 2, 4, 6].map((v) => (
          <g key={v}>
            <line x1={padX - 4} y1={yToPx(v)} x2={padX} y2={yToPx(v)} stroke="#94a3b8" strokeWidth="1" />
            <text x={padX - 8} y={yToPx(v) + 4} fill="#94a3b8" fontSize="11" textAnchor="end">{v}</text>
          </g>
        ))}
        {/* x ticks */}
        {[-2, -1, 0, 1, 2, 3, 4].map((v) => (
          <g key={v}>
            <line x1={xToPx(v)} y1={yToPx(0)} x2={xToPx(v)} y2={yToPx(0) + 4} stroke="#94a3b8" strokeWidth="1" />
            <text x={xToPx(v)} y={yToPx(0) + 16} fill="#94a3b8" fontSize="11" textAnchor="middle">{v}</text>
          </g>
        ))}
        <line x1={padX} y1={yToPx(0)} x2={W - padX} y2={yToPx(0)} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={xToPx(0)} y1={padY} x2={xToPx(0)} y2={yToPx(YMIN)} stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Vertical x line */}
        <line x1={xToPx(xVal)} y1={padY} x2={xToPx(xVal)} y2={yToPx(YMIN)} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Branches */}
        <path d={leftPath} fill="none" stroke="#3b82f6" strokeWidth="3" />
        <path d={rightPath} fill="none" stroke="#6366f1" strokeWidth="3" />

        {/* Jump discontinuity markers at x = 1 */}
        <circle cx={xToPx(1)} cy={yToPx(2)} r="5" fill="#fff" stroke="#3b82f6" strokeWidth="2.5" />
        <circle cx={xToPx(1)} cy={yToPx(4)} r="5" fill="#6366f1" stroke="#fff" strokeWidth="2" />

        {/* Marker on x-axis */}
        <circle cx={xToPx(xVal)} cy={yToPx(0)} r="10" fill="#6366f1" stroke="#fff" strokeWidth="2.5" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
      </svg>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">x</div>
          <div className="mt-1 text-2xl font-bold text-indigo-700">{xVal.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">LHL</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{lVal.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">RHL</div>
          <div className="mt-1 text-2xl font-bold text-indigo-600">{rVal.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">f(x)</div>
          <div className="mt-1 text-2xl font-bold text-slate-700">{fVal.toFixed(2)}</div>
        </div>
      </div>

      <div
        className="mt-5 rounded-2xl border-l-4 bg-white p-5 shadow-sm"
        style={{ borderColor: continuousHere ? "#10b981" : "#f59e0b" }}
      >
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: continuousHere ? "#065f46" : "#92400e" }}>
          {continuousHere ? "Continuous here" : "Jump / break here"}
        </div>
        <div className="font-mono text-base text-slate-800 sm:text-lg">
          {continuousHere
            ? <>LHL = RHL = f(x) = {fVal.toFixed(2)} — all three agree.</>
            : <>LHL ({lVal.toFixed(2)}) ≠ RHL ({rVal.toFixed(2)}) — the two one-sided limits disagree, so the limit doesn&apos;t exist.</>}
        </div>
      </div>
    </div>
  );
}
