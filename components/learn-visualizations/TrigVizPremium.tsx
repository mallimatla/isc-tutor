"use client";
import { useState, useRef, useCallback } from "react";

export default function TrigVizPremium() {
  const [angle, setAngle] = useState(Math.PI / 4);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const cx = 200, cy = 200, r = 140;
  const px = cx + r * Math.cos(angle);
  const py = cy - r * Math.sin(angle);
  const sinVal = Math.sin(angle);
  const cosVal = Math.cos(angle);
  const deg = ((angle * 180) / Math.PI) % 360;

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
      setAngle(Math.atan2(cy - local.y, local.x - cx));
    },
    [dragging]
  );

  return (
    <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Drag the point around the unit circle</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>
      <svg ref={svgRef} viewBox="0 0 400 400" className="mx-auto w-full max-w-md touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        <line x1="40" y1={cy} x2="360" y2={cy} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={cx} y1="40" x2={cx} y2="360" stroke="#e2e8f0" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#f59e0b" strokeWidth="2" />
        <line x1={px} y1={py} x2={px} y2={cy} stroke="#ef4444" strokeWidth="3" strokeDasharray="6 4" />
        <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 4" />
        <text x={px + 4} y={(py + cy) / 2} fill="#ef4444" fontSize="13" fontWeight="600">sin</text>
        <text x={(cx + px) / 2 - 10} y={cy + 18} fill="#3b82f6" fontSize="13" fontWeight="600">cos</text>
        <circle cx={px} cy={py} r="12" fill="#f59e0b" stroke="#fff" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
      </svg>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-slate-500">Angle</div><div className="mt-1 text-2xl font-bold text-amber-600">{deg.toFixed(0)}°</div></div>
        <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-red-600">sin θ</div><div className="mt-1 text-2xl font-bold text-red-500">{sinVal.toFixed(3)}</div></div>
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-blue-600">cos θ</div><div className="mt-1 text-2xl font-bold text-blue-500">{cosVal.toFixed(3)}</div></div>
      </div>
    </div>
  );
}
