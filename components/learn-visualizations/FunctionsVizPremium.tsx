"use client";
import { useState, useRef, useCallback } from "react";

export default function FunctionsVizPremium() {
  const [inputX, setInputX] = useState(2);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const f = (x: number) => 0.15 * x * x + 0.5;
  const outputY = f(inputX);

  const toSvgX = (x: number) => 60 + (x + 5) * 40;
  const toSvgY = (y: number) => 340 - y * 40;

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
      const x = Math.max(-4.5, Math.min(4.5, (local.x - 60) / 40 - 5));
      setInputX(Math.round(x * 10) / 10);
    },
    [dragging]
  );

  const curvePath = Array.from({ length: 100 }, (_, i) => {
    const x = -5 + i * 0.1;
    return `${i === 0 ? "M" : "L"}${toSvgX(x)},${toSvgY(f(x))}`;
  }).join(" ");

  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Move the input — watch the output respond</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>
      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        <line x1="60" y1="340" x2="460" y2="340" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="260" y1="20" x2="260" y2="380" stroke="#cbd5e1" strokeWidth="1" />
        <text x="465" y="344" fill="#94a3b8" fontSize="12">x</text>
        <text x="264" y="18" fill="#94a3b8" fontSize="12">y</text>
        <path d={curvePath} fill="none" stroke="#10b981" strokeWidth="3" />
        <line x1={toSvgX(inputX)} y1={toSvgY(outputY)} x2={toSvgX(inputX)} y2="340" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="260" y1={toSvgY(outputY)} x2={toSvgX(inputX)} y2={toSvgY(outputY)} stroke="#14b8a6" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={toSvgX(inputX)} cy={toSvgY(outputY)} r="8" fill="#10b981" stroke="#fff" strokeWidth="2" />
        <circle cx={toSvgX(inputX)} cy="340" r="10" fill="#14b8a6" stroke="#fff" strokeWidth="2" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
      </svg>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-slate-500">Input x</div><div className="mt-1 text-3xl font-bold text-emerald-600">{inputX.toFixed(1)}</div></div>
        <div className="rounded-2xl border border-teal-200 bg-gradient-to-b from-teal-50 to-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-teal-700">f(x) = 0.15x² + 0.5</div><div className="mt-1 text-3xl font-bold text-teal-600">{outputY.toFixed(2)}</div></div>
      </div>
    </div>
  );
}
