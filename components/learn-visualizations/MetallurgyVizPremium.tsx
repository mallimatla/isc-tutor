"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Blast furnace temperature zones
// ============================================================================
interface Zone {
  frac: number; // vertical centre, 0 = bottom, 1 = top
  temp: number;
  label: string;
  reaction: string;
}
const ZONES: Zone[] = [
  { frac: 0.9, temp: 500, label: "Reduction zone (top)", reaction: "Fe₂O₃ + 3CO → 2Fe + 3CO₂" },
  { frac: 0.6, temp: 1100, label: "Regeneration of CO", reaction: "CO₂ + C → 2CO" },
  { frac: 0.35, temp: 1200, label: "Fusion / slag zone", reaction: "CaCO₃ → CaO + CO₂" },
  { frac: 0.1, temp: 2000, label: "Combustion zone (bottom)", reaction: "C + O₂ → CO₂" },
];

function nearestZone(frac: number): Zone {
  let best = ZONES[0];
  let bd = Infinity;
  for (const z of ZONES) {
    const d = Math.abs(z.frac - frac);
    if (d < bd) {
      bd = d;
      best = z;
    }
  }
  return best;
}

function BlastFurnaceDemo() {
  const [pos, setPos] = useState(90); // 0 bottom .. 100 top
  const frac = pos / 100;
  const zone = nearestZone(frac);
  const temp = Math.round(2000 - frac * 1500);

  const W = 200,
    H = 220;
  const topY = 14,
    botY = H - 14;
  const markerY = botY - frac * (botY - topY);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Slide the marker up the furnace — it gets cooler near the top, and a different reaction happens in each zone.
      </h4>
      <div className="flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-56 w-auto">
          <defs>
            <linearGradient id="furnace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          {/* furnace body */}
          <polygon points={`70,${topY} 130,${topY} 150,${botY} 50,${botY}`} fill="url(#furnace)" stroke="#475569" strokeWidth={2} />
          {/* zone lines */}
          {ZONES.map((z) => {
            const y = botY - z.frac * (botY - topY);
            return (
              <g key={z.temp}>
                <line x1={52} y1={y} x2={148} y2={y} stroke="#334155" strokeWidth={0.75} strokeDasharray="2 2" opacity={0.5} />
                <text x={158} y={y + 3} fontSize="8" fill="#475569">{z.temp}K</text>
              </g>
            );
          })}
          {/* marker */}
          <circle cx={100} cy={markerY} r={7} fill="#0f172a" stroke="#fff" strokeWidth={2} />
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Height in furnace — temperature ≈ <span className="font-bold text-slate-700">{temp} K</span>
          <input type="range" min={0} max={100} step={1} value={pos} onChange={(e) => setPos(+e.target.value)} className="mt-1 w-full accent-slate-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-slate-400 bg-white p-3 text-xs text-slate-600">
        <div className="font-semibold text-slate-700">{zone.label}</div>
        <div className="mt-1 font-mono text-slate-800">{zone.reaction}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Ellingham idea — can carbon reduce the oxide?
// ============================================================================
const T_MIN = 300;
const T_MAX = 2000;
// ΔG° (kJ) per mole O₂, simplified straight lines
// metal oxide: 2M + O₂ → 2MO  (positive slope, becomes less negative as T rises)
function gMetal(T: number) {
  return -560 + 0.16 * T;
}
// carbon: 2C + O₂ → 2CO  (negative slope, becomes more negative as T rises)
function gCO(T: number) {
  return -230 - 0.17 * T;
}
const T_CROSS = (() => {
  // solve gMetal = gCO
  // -560 + 0.16T = -230 - 0.17T -> 0.33T = 330 -> T = 1000
  return (-230 + 560) / (0.16 + 0.17);
})();

function EllinghamDemo() {
  const [T, setT] = useState(900);
  const reduces = gCO(T) < gMetal(T);

  const W = 300,
    H = 170,
    pad = 30;
  const gVals = [gMetal(T_MIN), gMetal(T_MAX), gCO(T_MIN), gCO(T_MAX)];
  const gMinV = Math.min(...gVals);
  const gMaxV = Math.max(...gVals);
  const sx = (t: number) => pad + ((t - T_MIN) / (T_MAX - T_MIN)) * (W - 2 * pad);
  const sy = (g: number) => pad + ((g - gMaxV) / (gMinV - gMaxV)) * (H - 2 * pad); // more negative lower
  const mLine = `${sx(T_MIN)},${sy(gMetal(T_MIN))} ${sx(T_MAX)},${sy(gMetal(T_MAX))}`;
  const cLine = `${sx(T_MIN)},${sy(gCO(T_MIN))} ${sx(T_MAX)},${sy(gCO(T_MAX))}`;
  const mtx = sx(T);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Below the crossover carbon cannot reduce the oxide. Above it the C→CO line drops lower, so carbon wins.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={mLine} fill="none" stroke="#64748b" strokeWidth={2.5} />
          <polyline points={cLine} fill="none" stroke="#0ea5e9" strokeWidth={2.5} />
          <circle cx={sx(T_CROSS)} cy={sy(gMetal(T_CROSS))} r={4} fill="#dc2626" />
          <line x1={mtx} y1={pad} x2={mtx} y2={H - pad} stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="3 3" />
          <text x={W - pad} y={H - pad + 14} textAnchor="end" fontSize="9" fill="#64748b">temperature →</text>
          <text x={pad - 6} y={pad + 2} textAnchor="end" fontSize="9" fill="#64748b">ΔG°</text>
          <text x={W - pad} y={pad + 8} textAnchor="end" fontSize="8" fill="#64748b">metal oxide</text>
          <text x={W - pad} y={H - pad - 6} textAnchor="end" fontSize="8" fill="#0ea5e9">C → CO</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Temperature T = <span className="font-bold text-sky-600">{T} K</span> (crossover ≈ {Math.round(T_CROSS)} K)
          <input type="range" min={T_MIN} max={T_MAX} step={10} value={T} onChange={(e) => setT(+e.target.value)} className="mt-1 w-full accent-slate-500" />
        </label>
      </div>
      <div className={"mt-3 rounded-xl border-l-4 bg-white p-3 text-xs " + (reduces ? "border-emerald-400 text-emerald-700" : "border-rose-400 text-rose-700")}>
        {reduces
          ? "C → CO line is lower (more negative ΔG°): carbon CAN reduce the metal oxide at this temperature."
          : "Metal-oxide line is lower here: carbon CANNOT reduce the oxide yet — raise the temperature."}
      </div>
    </div>
  );
}

export default function MetallurgyVizPremium() {
  const demos: DemoTab[] = [
    { id: "furnace", title: "Blast furnace", emoji: "🌡️", render: () => <BlastFurnaceDemo /> },
    { id: "ellingham", title: "Ellingham idea", emoji: "📉", render: () => <EllinghamDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-slate-50 via-gray-50 to-zinc-100" />;
}
