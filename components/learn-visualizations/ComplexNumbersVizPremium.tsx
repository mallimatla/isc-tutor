"use client";
import { useState, useRef, useCallback } from "react";

export default function ComplexNumbersVizPremium() {
  const [point, setPoint] = useState({ x: 3, y: 2 });
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const cx = 260, cy = 200, scale = 40;
  const px = cx + point.x * scale;
  const py = cy - point.y * scale;
  const modulus = Math.sqrt(point.x * point.x + point.y * point.y);
  const argDeg = (Math.atan2(point.y, point.x) * 180) / Math.PI;

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
      const x = Math.max(-5, Math.min(5, Math.round(((local.x - cx) / scale) * 10) / 10));
      const y = Math.max(-4, Math.min(4, Math.round(((cy - local.y) / scale) * 10) / 10));
      setPoint({ x, y });
    },
    [dragging]
  );

  const sign = point.y >= 0 ? "+" : "−";
  const absY = Math.abs(point.y).toFixed(1);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Drag the point on the Argand plane</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>
      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        {/* gridlines */}
        {Array.from({ length: 11 }, (_, i) => i - 5).map((i) => (
          <line key={`vg${i}`} x1={cx + i * scale} y1={20} x2={cx + i * scale} y2={380} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {Array.from({ length: 9 }, (_, i) => i - 4).map((i) => (
          <line key={`hg${i}`} x1={40} y1={cy + i * scale} x2={480} y2={cy + i * scale} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {/* axes */}
        <line x1="40" y1={cy} x2="480" y2={cy} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={cx} y1="20" x2={cx} y2="380" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="486" y={cy + 4} fill="#64748b" fontSize="12">Re</text>
        <text x={cx + 6} y="18" fill="#64748b" fontSize="12">Im</text>
        {/* modulus line + argument arc */}
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d={`M ${cx + 30} ${cy} A 30 30 0 ${argDeg >= 180 || argDeg <= -180 ? 1 : 0} ${point.y >= 0 ? 0 : 1} ${cx + 30 * Math.cos((argDeg * Math.PI) / 180)} ${cy - 30 * Math.sin((argDeg * Math.PI) / 180)}`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
        />
        {/* dashed drop lines */}
        <line x1={px} y1={py} x2={px} y2={cy} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={cx} y1={py} x2={px} y2={py} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={px} cy={py} r="11" fill="#6366f1" stroke="#fff" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
        <text x={px + 14} y={py - 8} fill="#312e81" fontSize="14" fontWeight="700">z</text>
      </svg>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Real</div>
          <div className="mt-1 text-2xl font-bold text-indigo-600">{point.x.toFixed(1)}</div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Imag</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{point.y.toFixed(1)}</div>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-indigo-700">|z|</div>
          <div className="mt-1 text-2xl font-bold text-indigo-700">{modulus.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-blue-700">arg(z)</div>
          <div className="mt-1 text-2xl font-bold text-blue-700">{argDeg.toFixed(0)}°</div>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border-l-4 border-indigo-500 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">z = a + bi</div>
        <div className="font-mono text-xl font-bold text-slate-900 sm:text-2xl">
          z = {point.x.toFixed(1)} {sign} {absY}i
        </div>
      </div>
    </div>
  );
}
