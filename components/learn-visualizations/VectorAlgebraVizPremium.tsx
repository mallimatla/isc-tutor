"use client";
import { useState, useRef, useCallback } from "react";

type V = { x: number; y: number };

export default function VectorAlgebraVizPremium() {
  const [a, setA] = useState<V>({ x: 3, y: 1 });
  const [b, setB] = useState<V>({ x: 1, y: 2 });
  const [dragging, setDragging] = useState<"a" | "b" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const ox = 260, oy = 200, scale = 40;
  const toSx = (x: number) => ox + x * scale;
  const toSy = (y: number) => oy - y * scale;

  const sum = { x: a.x + b.x, y: a.y + b.y };
  const magA = Math.sqrt(a.x * a.x + a.y * a.y);
  const magB = Math.sqrt(b.x * b.x + b.y * b.y);
  const dot = a.x * b.x + a.y * b.y;
  const angleRad = Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB || 1))));
  const angleDeg = (angleRad * 180) / Math.PI;

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
      const x = Math.max(-5, Math.min(5, Math.round(((local.x - ox) / scale) * 10) / 10));
      const y = Math.max(-4, Math.min(4, Math.round(((oy - local.y) / scale) * 10) / 10));
      if (dragging === "a") setA({ x, y });
      else setB({ x, y });
    },
    [dragging]
  );

  const ap = { x: toSx(a.x), y: toSy(a.y) };
  const bp = { x: toSx(b.x), y: toSy(b.y) };
  const sp = { x: toSx(sum.x), y: toSy(sum.y) };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Drag vectors a and b — see their sum</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)} onTouchMove={onMove} onTouchEnd={() => setDragging(null)}>
        <defs>
          <marker id="arrowA" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#a855f7" />
          </marker>
          <marker id="arrowB" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#8b5cf6" />
          </marker>
          <marker id="arrowS" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#d946ef" />
          </marker>
        </defs>
        {Array.from({ length: 11 }, (_, i) => i - 5).map((i) => (
          <line key={`vg${i}`} x1={toSx(i)} y1="20" x2={toSx(i)} y2="380" stroke="#f5f3ff" strokeWidth="1" />
        ))}
        {Array.from({ length: 9 }, (_, i) => i - 4).map((i) => (
          <line key={`hg${i}`} x1="40" y1={toSy(i)} x2="480" y2={toSy(i)} stroke="#f5f3ff" strokeWidth="1" />
        ))}
        <line x1="40" y1={oy} x2="480" y2={oy} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={ox} y1="20" x2={ox} y2="380" stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Parallelogram completion (dashed) */}
        <line x1={ap.x} y1={ap.y} x2={sp.x} y2={sp.y} stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
        <line x1={bp.x} y1={bp.y} x2={sp.x} y2={sp.y} stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

        {/* Resultant a+b */}
        <line x1={ox} y1={oy} x2={sp.x} y2={sp.y} stroke="#d946ef" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#arrowS)" />
        {/* Vector a */}
        <line x1={ox} y1={oy} x2={ap.x} y2={ap.y} stroke="#a855f7" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrowA)" />
        {/* Vector b */}
        <line x1={ox} y1={oy} x2={bp.x} y2={bp.y} stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrowB)" />

        <circle cx={ap.x} cy={ap.y} r="11" fill="#a855f7" stroke="#fff" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging("a")} onTouchStart={() => setDragging("a")} />
        <circle cx={bp.x} cy={bp.y} r="11" fill="#8b5cf6" stroke="#fff" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging("b")} onTouchStart={() => setDragging("b")} />

        <text x={ap.x + 12} y={ap.y - 6} fill="#6b21a8" fontSize="14" fontWeight="700">a</text>
        <text x={bp.x + 12} y={bp.y - 6} fill="#5b21b6" fontSize="14" fontWeight="700">b</text>
        <text x={sp.x + 12} y={sp.y - 6} fill="#a21caf" fontSize="14" fontWeight="700">a + b</text>
      </svg>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">|a|</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{magA.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">|b|</div>
          <div className="mt-1 text-2xl font-bold text-violet-600">{magB.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-purple-700">a · b</div>
          <div className="mt-1 text-2xl font-bold text-purple-700">{dot.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-fuchsia-200 bg-gradient-to-b from-fuchsia-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-fuchsia-700">angle</div>
          <div className="mt-1 text-2xl font-bold text-fuchsia-700">{angleDeg.toFixed(0)}°</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border-l-4 border-purple-500 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-700">
          Parallelogram law
        </div>
        <div className="font-mono text-base text-slate-800 sm:text-lg">
          a + b = ({a.x.toFixed(1)} + {b.x.toFixed(1)}, {a.y.toFixed(1)} + {b.y.toFixed(1)}) = ({sum.x.toFixed(1)}, {sum.y.toFixed(1)})
        </div>
        <div className="mt-2 text-xs text-slate-500">
          cos θ = (a · b) / (|a| |b|) = {(dot / (magA * magB || 1)).toFixed(3)}
          {Math.abs(dot) < 0.05 && <>  ·  vectors are perpendicular (a · b = 0)</>}
        </div>
      </div>
    </div>
  );
}
