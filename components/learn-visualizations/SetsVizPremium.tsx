"use client";
import { useState, useRef, useCallback } from "react";

export default function SetsVizPremium() {
  const [circleA, setCircleA] = useState({ x: 200, y: 200, r: 90 });
  const [circleB, setCircleB] = useState({ x: 340, y: 200, r: 90 });
  const [dragging, setDragging] = useState<"A" | "B" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const dx = circleB.x - circleA.x;
  const dy = circleB.y - circleA.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const sumR = circleA.r + circleB.r;
  const overlapRatio = Math.max(0, Math.min(1, 1 - distance / sumR));

  const nA = 50;
  const nB = 40;
  const nIntersection = Math.round(20 * overlapRatio);
  const nUnion = nA + nB - nIntersection;
  const nAOnly = nA - nIntersection;
  const nBOnly = nB - nIntersection;

  const startDrag = (which: "A" | "B") => () => setDragging(which);
  const stopDrag = () => setDragging(null);

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
      const setter = dragging === "A" ? setCircleA : setCircleB;
      setter((c) => ({ ...c, x: Math.max(c.r + 20, Math.min(500 - c.r - 20, local.x)), y: Math.max(c.r + 20, Math.min(380 - c.r - 20, local.y)) }));
    },
    [dragging]
  );

  return (
    <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Drag the circles to see how sets overlap</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>
      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={stopDrag} onMouseLeave={stopDrag} onTouchMove={onMove} onTouchEnd={stopDrag}>
        <rect x="20" y="20" width="480" height="360" fill="none" stroke="#cbd5e1" strokeDasharray="6 6" rx="16" />
        <text x="36" y="48" fill="#64748b" fontSize="14" fontWeight="500">U</text>
        <defs>
          <radialGradient id="gA" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0.45" /></radialGradient>
          <radialGradient id="gB" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#c084fc" stopOpacity="0.6" /><stop offset="100%" stopColor="#9333ea" stopOpacity="0.45" /></radialGradient>
        </defs>
        <circle cx={circleA.x} cy={circleA.y} r={circleA.r} fill="url(#gA)" stroke="#2563eb" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={startDrag("A")} onTouchStart={startDrag("A")} />
        <circle cx={circleB.x} cy={circleB.y} r={circleB.r} fill="url(#gB)" stroke="#7c3aed" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={startDrag("B")} onTouchStart={startDrag("B")} />
        <text x={circleA.x - circleA.r + 20} y={circleA.y - circleA.r + 30} fill="#1e40af" fontSize="28" fontWeight="700">A</text>
        <text x={circleB.x + circleB.r - 30} y={circleB.y - circleB.r + 30} fill="#6d28d9" fontSize="28" fontWeight="700">B</text>
      </svg>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-slate-500">Only in A</div><div className="mt-1 text-3xl font-bold text-blue-600">{nAOnly}</div></div>
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50 to-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-violet-700">A ∩ B</div><div className="mt-1 text-3xl font-bold text-violet-600">{nIntersection}</div></div>
        <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-slate-500">Only in B</div><div className="mt-1 text-3xl font-bold text-purple-600">{nBOnly}</div></div>
      </div>
      <div className="mt-5 rounded-2xl border-l-4 border-emerald-500 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">Inclusion-Exclusion</div>
        <div className="font-mono text-base text-slate-800 sm:text-lg">|A ∪ B| = |A| + |B| − |A ∩ B|</div>
        <div className="mt-2 font-mono text-xl font-bold text-slate-900 sm:text-2xl">{nA} + {nB} − {nIntersection} = <span className="text-emerald-600">{nUnion}</span></div>
      </div>
    </div>
  );
}
