"use client";
import { useState } from "react";

type Pt = { x: number; y: number };

// Constraints:
//   x ≥ 0,  y ≥ 0,  x + y ≤ C1,  2x + y ≤ C2
// Objective: maximize Z = 3x + 2y

export default function LinearProgrammingVizPremium() {
  const [c1, setC1] = useState(6);
  const [c2, setC2] = useState(8);

  const sat = (p: Pt) =>
    p.x >= -1e-6 && p.y >= -1e-6 && p.x + p.y <= c1 + 1e-6 && 2 * p.x + p.y <= c2 + 1e-6;

  const candidates: Pt[] = [
    { x: 0, y: 0 },
    { x: 0, y: c1 },
    { x: c1, y: 0 },
    { x: 0, y: c2 },
    { x: c2 / 2, y: 0 },
    { x: c2 - c1, y: 2 * c1 - c2 },
  ];
  const corners = candidates
    .filter((p) => isFinite(p.x) && isFinite(p.y))
    .filter(sat)
    // dedupe
    .filter((p, i, arr) => arr.findIndex((q) => Math.abs(q.x - p.x) < 1e-4 && Math.abs(q.y - p.y) < 1e-4) === i);

  // Order corners CCW around centroid for polygon drawing
  const cxC = corners.reduce((s, p) => s + p.x, 0) / (corners.length || 1);
  const cyC = corners.reduce((s, p) => s + p.y, 0) / (corners.length || 1);
  const ordered = [...corners].sort(
    (a, b) => Math.atan2(a.y - cyC, a.x - cxC) - Math.atan2(b.y - cyC, b.x - cxC)
  );

  const Z = (p: Pt) => 3 * p.x + 2 * p.y;
  const bestCorner = corners.reduce((best, p) => (Z(p) > Z(best) ? p : best), corners[0] ?? { x: 0, y: 0 });
  const bestZ = corners.length > 0 ? Z(bestCorner) : 0;

  // Canvas
  const W = 520, H = 380;
  const padX = 50, padY = 30;
  const XMAX = 14, YMAX = 14;
  const chartW = W - 2 * padX, chartH = H - 2 * padY;
  const xToPx = (x: number) => padX + (x / XMAX) * chartW;
  const yToPx = (y: number) => padY + chartH - (y / YMAX) * chartH;

  const polyPts = ordered.map((p) => `${xToPx(p.x)},${yToPx(p.y)}`).join(" ");

  // Boundary lines clipped to viewport
  const line1Y = (x: number) => c1 - x;       // x + y = c1  → y = c1 - x
  const line2Y = (x: number) => c2 - 2 * x;   // 2x + y = c2 → y = c2 - 2x

  // For the objective line Z = bestZ → y = (bestZ - 3x) / 2
  const objY = (x: number) => (bestZ - 3 * x) / 2;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Tune the constraints — find the optimal corner</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none rounded-2xl bg-white shadow-inner">
        {/* gridlines */}
        {Array.from({ length: XMAX + 1 }, (_, i) => i).map((i) => (
          <line key={`vg${i}`} x1={xToPx(i)} y1={padY} x2={xToPx(i)} y2={yToPx(0)} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {Array.from({ length: YMAX + 1 }, (_, i) => i).map((i) => (
          <line key={`hg${i}`} x1={padX} y1={yToPx(i)} x2={W - padX} y2={yToPx(i)} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {/* axes + ticks */}
        <line x1={padX} y1={yToPx(0)} x2={W - padX} y2={yToPx(0)} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={xToPx(0)} y1={padY} x2={xToPx(0)} y2={yToPx(0)} stroke="#cbd5e1" strokeWidth="1.5" />
        {[0, 4, 8, 12].map((v) => (
          <text key={`xt${v}`} x={xToPx(v)} y={yToPx(0) + 16} fill="#94a3b8" fontSize="11" textAnchor="middle">{v}</text>
        ))}
        {[4, 8, 12].map((v) => (
          <text key={`yt${v}`} x={padX - 8} y={yToPx(v) + 4} fill="#94a3b8" fontSize="11" textAnchor="end">{v}</text>
        ))}

        {/* Feasible region */}
        {ordered.length >= 3 && (
          <polygon points={polyPts} fill="#22c55e" fillOpacity="0.22" stroke="none" />
        )}

        {/* Constraint lines */}
        <line x1={xToPx(0)} y1={yToPx(line1Y(0))} x2={xToPx(XMAX)} y2={yToPx(line1Y(XMAX))} stroke="#16a34a" strokeWidth="2.5" />
        <line x1={xToPx(0)} y1={yToPx(line2Y(0))} x2={xToPx(XMAX)} y2={yToPx(line2Y(XMAX))} stroke="#059669" strokeWidth="2.5" />

        {/* Objective level line through best corner */}
        {corners.length > 0 && (
          <line
            x1={xToPx(0)}
            y1={yToPx(objY(0))}
            x2={xToPx(XMAX)}
            y2={yToPx(objY(XMAX))}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )}

        {/* Corner markers */}
        {ordered.map((p, i) => {
          const isBest = Math.abs(p.x - bestCorner.x) < 1e-4 && Math.abs(p.y - bestCorner.y) < 1e-4;
          return (
            <g key={i}>
              <circle cx={xToPx(p.x)} cy={yToPx(p.y)} r={isBest ? "10" : "6"} fill={isBest ? "#f59e0b" : "#10b981"} stroke="#fff" strokeWidth="2.5" />
              <text x={xToPx(p.x) + 10} y={yToPx(p.y) - 8} fill={isBest ? "#92400e" : "#065f46"} fontSize="11" fontWeight="700">
                ({p.x.toFixed(1)}, {p.y.toFixed(1)})
              </text>
            </g>
          );
        })}

        <text x={W - 12} y={yToPx(line1Y(XMAX)) + 4} fill="#15803d" fontSize="11" fontWeight="600" textAnchor="end">x + y ≤ {c1}</text>
        <text x={W - 12} y={yToPx(line2Y(XMAX)) + 16} fill="#047857" fontSize="11" fontWeight="600" textAnchor="end">2x + y ≤ {c2}</text>
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="rounded-2xl border border-green-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>x + y ≤ C₁</span>
            <span className="font-mono text-sm text-green-700">{c1}</span>
          </div>
          <input type="range" min="2" max="12" step="1" value={c1} onChange={(e) => setC1(Number(e.target.value))} className="mt-2 w-full accent-green-600" />
        </label>
        <label className="rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>2x + y ≤ C₂</span>
            <span className="font-mono text-sm text-emerald-700">{c2}</span>
          </div>
          <input type="range" min="4" max="18" step="1" value={c2} onChange={(e) => setC2(Number(e.target.value))} className="mt-2 w-full accent-emerald-600" />
        </label>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-green-200 bg-gradient-to-b from-green-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-green-700">Corner points</div>
          <div className="mt-1 text-2xl font-bold text-green-700">{ordered.length}</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-amber-700">Optimal corner</div>
          <div className="mt-1 font-mono text-lg font-bold text-amber-700">({bestCorner.x.toFixed(1)}, {bestCorner.y.toFixed(1)})</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">Max Z</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">{bestZ.toFixed(1)}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border-l-4 border-emerald-500 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Maximise Z = 3x + 2y
        </div>
        <div className="font-mono text-base text-slate-800 sm:text-lg">
          subject to &nbsp; x ≥ 0, &nbsp; y ≥ 0, &nbsp; x + y ≤ {c1}, &nbsp; 2x + y ≤ {c2}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          The optimum always sits at a corner of the feasible region — this is the corner-point method.
        </div>
      </div>
    </div>
  );
}
