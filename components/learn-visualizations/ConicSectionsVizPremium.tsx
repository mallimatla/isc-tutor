"use client";
import { useState } from "react";

export default function ConicSectionsVizPremium() {
  const [e, setE] = useState(0.5);

  const W = 520, H = 400;
  const cx = 260, cy = 200;
  const l = 70; // semi-latus rectum in pixels
  const STEPS = 320;
  const MAX_X = 240, MAX_Y = 170;

  // Polar form r(θ) = l / (1 + e cos θ).  Focus at the centre of the canvas.
  // Negative r naturally produces the second branch of a hyperbola.
  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const theta = (i / STEPS) * 2 * Math.PI;
    const denom = 1 + e * Math.cos(theta);
    const breakHere = Math.abs(denom) < 0.04;
    if (!breakHere) {
      const r = l / denom;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      if (Math.abs(x) <= MAX_X && Math.abs(y) <= MAX_Y) {
        current.push({ x, y });
        continue;
      }
    }
    if (current.length > 1) segments.push(current);
    current = [];
  }
  if (current.length > 1) segments.push(current);

  const paths = segments.map((seg) =>
    seg.map((p, i) => `${i === 0 ? "M" : "L"}${cx + p.x},${cy - p.y}`).join(" ")
  );

  let typeLabel: string;
  let typeColor: string;
  if (e < 0.05) { typeLabel = "Circle"; typeColor = "#f97316"; }
  else if (e < 0.99) { typeLabel = "Ellipse"; typeColor = "#fb923c"; }
  else if (e < 1.01) { typeLabel = "Parabola"; typeColor = "#ef4444"; }
  else { typeLabel = "Hyperbola"; typeColor = "#dc2626"; }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 p-4 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Slide the eccentricity — watch the conic morph</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">Interactive</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none rounded-2xl bg-white shadow-inner">
        {/* axes */}
        <line x1="20" y1={cy} x2="500" y2={cy} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={cx} y1="20" x2={cx} y2="380" stroke="#e2e8f0" strokeWidth="1" />
        {/* conic */}
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={typeColor} strokeWidth="3.5" strokeLinecap="round" />
        ))}
        {/* focus at centre */}
        <circle cx={cx} cy={cy} r="6" fill="#7c2d12" stroke="#fff" strokeWidth="2" />
        <text x={cx + 10} y={cy + 16} fill="#7c2d12" fontSize="12" fontWeight="600">F</text>
      </svg>

      <div className="mt-4 rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
        <label>
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Eccentricity e</span>
            <span className="font-mono text-sm font-bold" style={{ color: typeColor }}>{e.toFixed(2)}</span>
          </div>
          <input type="range" min="0" max="2" step="0.05" value={e} onChange={(ev) => setE(Number(ev.target.value))} className="mt-2 w-full accent-orange-600" />
          <div className="mt-2 flex justify-between text-[10px] text-slate-400">
            <span>0 (circle)</span>
            <span>&lt;1 (ellipse)</span>
            <span>=1 (parabola)</span>
            <span>&gt;1 (hyperbola)</span>
          </div>
        </label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-orange-700">Conic type</div>
          <div className="mt-1 text-2xl font-bold" style={{ color: typeColor }}>{typeLabel}</div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-gradient-to-b from-red-50 to-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-red-700">Eccentricity</div>
          <div className="mt-1 text-2xl font-bold text-red-700">{e.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border-l-4 bg-white p-5 shadow-sm" style={{ borderColor: typeColor }}>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: typeColor }}>
          Focus–directrix form
        </div>
        <div className="font-mono text-base text-slate-800 sm:text-lg">
          r(θ) = l / (1 + e·cos θ)
        </div>
        <div className="mt-1 text-xs text-slate-500">
          One equation, four shapes — eccentricity decides which.
        </div>
      </div>
    </div>
  );
}
