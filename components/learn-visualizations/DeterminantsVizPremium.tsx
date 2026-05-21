"use client";
import { useState, useRef, useCallback } from "react";

type V = { x: number; y: number };

export default function DeterminantsVizPremium() {
  const [col1, setCol1] = useState<V>({ x: 3, y: 1 });
  const [col2, setCol2] = useState<V>({ x: 1, y: 2 });
  const [dragging, setDragging] = useState<"c1" | "c2" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const ox = 260, oy = 200, scale = 40;
  const toSx = (x: number) => ox + x * scale;
  const toSy = (y: number) => oy - y * scale;

  const det = col1.x * col2.y - col1.y * col2.x;
  const absArea = Math.abs(det);
  const sign = det > 0 ? "+" : det < 0 ? "−" : "0";

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
      if (dragging === "c1") setCol1({ x, y });
      else setCol2({ x, y });
    },
    [dragging]
  );

  const p0 = { x: ox, y: oy };
  const p1 = { x: toSx(col1.x), y: toSy(col1.y) };
  const p2 = { x: toSx(col1.x + col2.x), y: toSy(col1.y + col2.y) };
  const p3 = { x: toSx(col2.x), y: toSy(col2.y) };

  const parallelogram = `${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
  const fillColor = det >= 0 ? "rgba(75, 85, 99, 0.25)" : "rgba(244, 63, 94, 0.25)";

  return (
    <div className="rounded-3xl bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">det A = the signed area of the parallelogram</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)} onTouchMove={onMove} onTouchEnd={() => setDragging(null)}>
        {Array.from({ length: 11 }, (_, i) => i - 5).map((i) => (
          <line key={`vg${i}`} x1={toSx(i)} y1="20" x2={toSx(i)} y2="380" stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {Array.from({ length: 9 }, (_, i) => i - 4).map((i) => (
          <line key={`hg${i}`} x1="40" y1={toSy(i)} x2="480" y2={toSy(i)} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        <line x1="40" y1={oy} x2="480" y2={oy} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={ox} y1="20" x2={ox} y2="380" stroke="#cbd5e1" strokeWidth="1.5" />

        <polygon points={parallelogram} fill={fillColor} stroke="none" />

        {/* col1 vector */}
        <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#4b5563" strokeWidth="3" strokeLinecap="round" />
        {/* col2 vector */}
        <line x1={p0.x} y1={p0.y} x2={p3.x} y2={p3.y} stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        {/* completing edges of parallelogram (dashed) */}
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1={p3.x} y1={p3.y} x2={p2.x} y2={p2.y} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />

        <circle cx={p1.x} cy={p1.y} r="11" fill="#4b5563" stroke="#fff" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging("c1")} onTouchStart={() => setDragging("c1")} />
        <circle cx={p3.x} cy={p3.y} r="11" fill="#64748b" stroke="#fff" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging("c2")} onTouchStart={() => setDragging("c2")} />

        <text x={p1.x + 12} y={p1.y - 6} fill="#1f2937" fontSize="14" fontWeight="700">a</text>
        <text x={p3.x + 12} y={p3.y - 6} fill="#334155" fontSize="14" fontWeight="700">b</text>
      </svg>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Column a</div>
          <div className="mt-1 font-mono text-lg font-bold text-gray-700">({col1.x}, {col1.y})</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Column b</div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-700">({col2.x}, {col2.y})</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-700">|det A|</div>
          <div className="mt-1 text-2xl font-bold text-gray-800">{absArea.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border p-4 shadow-sm" style={{ borderColor: det >= 0 ? "#cbd5e1" : "#fda4af", backgroundColor: det >= 0 ? "#fff" : "#fff1f2" }}>
          <div className="text-xs font-medium uppercase tracking-wide" style={{ color: det >= 0 ? "#475569" : "#be123c" }}>Sign</div>
          <div className="mt-1 text-2xl font-bold" style={{ color: det >= 0 ? "#334155" : "#e11d48" }}>{sign}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border-l-4 border-slate-500 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-700">det A = ad − bc</div>
        <div className="font-mono text-base text-slate-800 sm:text-lg">
          ({col1.x})({col2.y}) − ({col1.y})({col2.x}) = <span className="font-bold text-slate-900">{det.toFixed(2)}</span>
        </div>
        {det < 0 && (
          <div className="mt-2 text-xs text-rose-600">
            Negative → the vectors have swapped orientation (b is now to the right of a).
          </div>
        )}
        {Math.abs(det) < 0.05 && (
          <div className="mt-2 text-xs text-amber-600">
            Zero → the columns are parallel; the parallelogram collapses to a line. The matrix is singular.
          </div>
        )}
      </div>
    </div>
  );
}
