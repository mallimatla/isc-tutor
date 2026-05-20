"use client";
import { useState, useRef, useCallback } from "react";

const PRESETS: Record<string, [number, number, number, number]> = {
  Identity: [1, 0, 0, 1],
  "Rotate 90°": [0, -1, 1, 0],
  "Scale 2×": [2, 0, 0, 2],
  Reflect: [-1, 0, 0, 1],
};

export default function MatricesVizPremium() {
  const [[a, b, c, d], setMatrix] = useState<[number, number, number, number]>([1, 0, 0, 1]);
  const [point, setPoint] = useState({ x: 2, y: 1 });
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const tx = a * point.x + b * point.y;
  const ty = c * point.x + d * point.y;
  const scale = 30;
  const ox = 250, oy = 200;
  const toSx = (x: number) => ox + x * scale;
  const toSy = (y: number) => oy - y * scale;

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
      setPoint({ x: Math.round((local.x - ox) / scale * 10) / 10, y: Math.round((oy - local.y) / scale * 10) / 10 });
    },
    [dragging]
  );

  const setVal = (idx: number, val: string) => {
    const n = parseFloat(val) || 0;
    setMatrix((prev) => { const m = [...prev] as [number, number, number, number]; m[idx] = n; return m; });
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-50 via-zinc-50 to-gray-100 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">A matrix is a transformation — see it act</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-zinc-200 bg-white p-2">
          {[a, b, c, d].map((v, i) => (
            <input key={i} type="number" value={v} onChange={(e) => setVal(i, e.target.value)} className="w-14 rounded-lg border border-zinc-200 px-2 py-1 text-center text-sm font-mono" step="0.5" />
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(PRESETS).map(([name, m]) => (
            <button key={name} onClick={() => setMatrix(m)} className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100">{name}</button>
          ))}
        </div>
      </div>

      <svg ref={svgRef} viewBox="0 0 500 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        {/* Grid */}
        {Array.from({ length: 17 }, (_, i) => i - 8).map((n) => (
          <g key={n}>
            <line x1={toSx(n)} y1="20" x2={toSx(n)} y2="380" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="20" y1={toSy(n)} x2="480" y2={toSy(n)} stroke="#f1f5f9" strokeWidth="1" />
          </g>
        ))}
        <line x1="20" y1={oy} x2="480" y2={oy} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={ox} y1="20" x2={ox} y2="380" stroke="#cbd5e1" strokeWidth="1" />
        {/* Transformed vector */}
        <line x1={ox} y1={oy} x2={toSx(tx)} y2={toSy(ty)} stroke="#ef4444" strokeWidth="2" />
        <circle cx={toSx(tx)} cy={toSy(ty)} r="6" fill="#ef4444" stroke="#fff" strokeWidth="2" />
        {/* Input vector */}
        <line x1={ox} y1={oy} x2={toSx(point.x)} y2={toSy(point.y)} stroke="#3b82f6" strokeWidth="2" />
        <circle cx={toSx(point.x)} cy={toSy(point.y)} r="10" fill="#3b82f6" stroke="#fff" strokeWidth="2" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
      </svg>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-blue-600">Input</div><div className="mt-1 font-mono text-xl font-bold text-blue-600">({point.x}, {point.y})</div></div>
        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-red-600">Output</div><div className="mt-1 font-mono text-xl font-bold text-red-500">({tx.toFixed(1)}, {ty.toFixed(1)})</div></div>
      </div>
    </div>
  );
}
