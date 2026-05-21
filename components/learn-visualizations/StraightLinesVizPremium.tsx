"use client";
import { useState } from "react";

export default function StraightLinesVizPremium() {
  const [m, setM] = useState(1);
  const [c, setC] = useState(1);

  const W = 520, H = 400;
  const cx = 260, cy = 200, scale = 30;
  const xMin = -8, xMax = 8;

  // Clip the line to viewBox so it doesn't escape.
  const xToPx = (x: number) => cx + x * scale;
  const yToPx = (y: number) => cy - y * scale;

  const y1 = m * xMin + c;
  const y2 = m * xMax + c;
  const slopeAngle = (Math.atan(m) * 180) / Math.PI;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-50 via-zinc-50 to-stone-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Tune the slope and intercept</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none rounded-2xl bg-white shadow-inner">
        {/* gridlines */}
        {Array.from({ length: 17 }, (_, i) => i - 8).map((i) => (
          <line key={`vg${i}`} x1={cx + i * scale} y1={20} x2={cx + i * scale} y2={380} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {Array.from({ length: 13 }, (_, i) => i - 6).map((i) => (
          <line key={`hg${i}`} x1={20} y1={cy + i * scale} x2={500} y2={cy + i * scale} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {/* axes */}
        <line x1="20" y1={cy} x2="500" y2={cy} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={cx} y1="20" x2={cx} y2="380" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="504" y={cy + 4} fill="#64748b" fontSize="12">x</text>
        <text x={cx + 6} y="18" fill="#64748b" fontSize="12">y</text>
        {/* slope triangle: from x=0..1 */}
        {Math.abs(m) > 0.01 && (
          <g>
            <line x1={xToPx(0)} y1={yToPx(c)} x2={xToPx(1)} y2={yToPx(c)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={xToPx(1)} y1={yToPx(c)} x2={xToPx(1)} y2={yToPx(c + m)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
            <text x={xToPx(0.5)} y={yToPx(c) + 14} fill="#64748b" fontSize="11" textAnchor="middle">1</text>
            <text x={xToPx(1) + 6} y={yToPx(c + m / 2) + 4} fill="#64748b" fontSize="11">{m}</text>
          </g>
        )}
        {/* the line */}
        <line x1={xToPx(xMin)} y1={yToPx(y1)} x2={xToPx(xMax)} y2={yToPx(y2)} stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        {/* y-intercept dot */}
        <circle cx={cx} cy={yToPx(c)} r="7" fill="#52525b" stroke="#fff" strokeWidth="2.5" />
        <text x={cx + 12} y={yToPx(c) - 8} fill="#27272a" fontSize="13" fontWeight="700">(0, {c})</text>
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Slope m</span>
            <span className="font-mono text-sm text-slate-700">{m}</span>
          </div>
          <input type="range" min="-5" max="5" step="0.5" value={m} onChange={(e) => setM(Number(e.target.value))} className="mt-2 w-full accent-slate-600" />
        </label>
        <label className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Intercept c</span>
            <span className="font-mono text-sm text-zinc-700">{c}</span>
          </div>
          <input type="range" min="-5" max="5" step="0.5" value={c} onChange={(e) => setC(Number(e.target.value))} className="mt-2 w-full accent-zinc-600" />
        </label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-600">Slope angle</div>
          <div className="mt-1 text-2xl font-bold text-slate-700">{slopeAngle.toFixed(0)}°</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-600">y at x = 0</div>
          <div className="mt-1 text-2xl font-bold text-zinc-700">{c}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border-l-4 border-slate-500 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-700">Slope–intercept form</div>
        <div className="font-mono text-xl font-bold text-slate-900 sm:text-2xl">
          y = {m === 0 ? "" : m === 1 ? "" : m === -1 ? "−" : m}x {c >= 0 ? "+" : "−"} {Math.abs(c)}
        </div>
      </div>
    </div>
  );
}
