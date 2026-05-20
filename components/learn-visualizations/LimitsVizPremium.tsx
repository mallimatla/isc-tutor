"use client";
import { useState, useRef, useCallback } from "react";

export default function LimitsVizPremium() {
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

  const curvePath = Array.from({ length: 200 }, (_, i) => {
    const x = -5 + i * 0.05;
    if (Math.abs(x) < 0.01) return "";
    const y = f(x);
    if (isNaN(y)) return "";
    return `${i === 0 || Math.abs(x - 0.01) < 0.06 ? "M" : "L"}${toSvgX(x)},${toSvgY(y)}`;
  }).filter(Boolean).join(" ");

  const isNearZero = Math.abs(xVal) < 0.05;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Slide x toward 0 — what happens to f(x)?</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>
      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        <line x1="30" y1="340" x2="500" y2="340" stroke="#e2e8f0" strokeWidth="1" />
        <line x1="260" y1="20" x2="260" y2="380" stroke="#e2e8f0" strokeWidth="1" />
        <path d={curvePath} fill="none" stroke="#ec4899" strokeWidth="3" />
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
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-slate-500">x</div><div className="mt-1 text-3xl font-bold text-pink-600">{xVal.toFixed(2)}</div></div>
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50 to-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-rose-700">sin(x)/x</div><div className="mt-1 text-3xl font-bold text-rose-600">{isNearZero ? "undefined" : yVal.toFixed(4)}</div></div>
      </div>
      {isNearZero && (
        <div className="mt-4 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-800">f(x) is undefined at x = 0 — but the limit as x → 0 is exactly 1. The open circle shows the hole in the graph.</div>
      )}
    </div>
  );
}
