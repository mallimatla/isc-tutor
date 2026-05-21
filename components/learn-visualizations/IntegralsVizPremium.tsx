"use client";
import { useState } from "react";

// f(x) = -0.25x^2 + 3  on [0, 4] (a concave parabola staying positive)
const f = (x: number) => -0.25 * x * x + 3;
const A = 0, B = 4;
const TRUE_INTEGRAL = -((B * B * B) / 12) + 3 * B - (-((A * A * A) / 12) + 3 * A);
// = -(64/12) + 12 = -5.333… + 12 = 6.667

export default function IntegralsVizPremium() {
  const [n, setN] = useState(8);

  const W = 520, H = 360;
  const padX = 50, padY = 30;
  const chartW = W - 2 * padX, chartH = H - 2 * padY;
  const xToPx = (x: number) => padX + ((x - A) / (B - A)) * chartW;
  const yToPx = (y: number) => padY + chartH - (y / 3.2) * chartH;

  const dx = (B - A) / n;
  // Right-endpoint Riemann sum (a common ISC choice; for a concave function it underestimates)
  let riemann = 0;
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  for (let i = 0; i < n; i++) {
    const xLeft = A + i * dx;
    const xRight = xLeft + dx;
    const xMid = (xLeft + xRight) / 2; // mid-point gives nicer convergence; show that
    const yH = f(xMid);
    riemann += yH * dx;
    rects.push({
      x: xToPx(xLeft),
      y: yToPx(yH),
      w: xToPx(xRight) - xToPx(xLeft),
      h: yToPx(0) - yToPx(yH),
    });
  }
  const error = Math.abs(riemann - TRUE_INTEGRAL);

  const STEPS = 200;
  const curvePath = Array.from({ length: STEPS + 1 }, (_, i) => {
    const x = A + (i / STEPS) * (B - A);
    return `${i === 0 ? "M" : "L"}${xToPx(x)},${yToPx(f(x))}`;
  }).join(" ");

  return (
    <div className="rounded-3xl bg-gradient-to-br from-red-50 via-orange-50 to-rose-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">More rectangles → area converges to the integral</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none rounded-2xl bg-white shadow-inner">
        {/* y-axis ticks */}
        {[0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={padX - 4} y1={yToPx(v)} x2={padX} y2={yToPx(v)} stroke="#94a3b8" strokeWidth="1" />
            <text x={padX - 8} y={yToPx(v) + 4} fill="#94a3b8" fontSize="11" textAnchor="end">{v}</text>
          </g>
        ))}
        {/* x-axis ticks */}
        {[0, 1, 2, 3, 4].map((v) => (
          <g key={v}>
            <line x1={xToPx(v)} y1={yToPx(0)} x2={xToPx(v)} y2={yToPx(0) + 4} stroke="#94a3b8" strokeWidth="1" />
            <text x={xToPx(v)} y={yToPx(0) + 16} fill="#94a3b8" fontSize="11" textAnchor="middle">{v}</text>
          </g>
        ))}
        {/* axes */}
        <line x1={padX} y1={yToPx(0)} x2={W - padX} y2={yToPx(0)} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={padX} y1={padY} x2={padX} y2={yToPx(0)} stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Rectangles */}
        {rects.map((r, i) => (
          <rect
            key={i}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            fill="#f97316"
            fillOpacity={0.35}
            stroke="#f97316"
            strokeWidth="1"
          />
        ))}

        {/* Curve */}
        <path d={curvePath} fill="none" stroke="#ef4444" strokeWidth="3" />

        <text x={W - padX - 6} y={padY + 14} fill="#7f1d1d" fontSize="13" fontWeight="700" textAnchor="end">y = −0.25x² + 3</text>
      </svg>

      <div className="mt-4 rounded-2xl border border-orange-200 bg-white p-3 shadow-sm">
        <label>
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Rectangles n</span>
            <span className="font-mono text-sm text-orange-700">{n}</span>
          </div>
          <input type="range" min="2" max="50" step="1" value={n} onChange={(e) => setN(Number(e.target.value))} className="mt-2 w-full accent-orange-600" />
        </label>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-orange-700">Riemann sum</div>
          <div className="mt-1 text-2xl font-bold text-orange-700">{riemann.toFixed(3)}</div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-gradient-to-b from-red-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-red-700">True ∫ f dx</div>
          <div className="mt-1 text-2xl font-bold text-red-700">{TRUE_INTEGRAL.toFixed(3)}</div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-rose-700">Error</div>
          <div className="mt-1 text-2xl font-bold text-rose-700">{error.toFixed(3)}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border-l-4 border-red-500 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-700">
          The integral as a limit
        </div>
        <div className="font-mono text-base text-slate-800 sm:text-lg">
          ∫<sub>0</sub><sup>4</sup> f(x) dx = lim<sub>n→∞</sub> Σ f(xᵢ*) · Δx
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Δx = 4/n = {dx.toFixed(3)}; as n grows, the rectangles fill the region under the curve exactly.
        </div>
      </div>
    </div>
  );
}
