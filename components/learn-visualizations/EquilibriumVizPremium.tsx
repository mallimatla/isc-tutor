"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Le Chatelier — N₂ + 3H₂ ⇌ 2NH₃ (exothermic)
// ============================================================================
type Stress = "reactant" | "product" | "pressure" | "temperature";

const STRESS_INFO: Record<Stress, { label: string; dir: "left" | "right"; why: string }> = {
  reactant: {
    label: "Add N₂ / H₂",
    dir: "right",
    why: "Adding reactant shifts right to use it up, making more NH₃.",
  },
  product: {
    label: "Add NH₃",
    dir: "left",
    why: "Adding product shifts left to consume the extra NH₃.",
  },
  pressure: {
    label: "Raise pressure",
    dir: "right",
    why: "Higher pressure shifts to the side with fewer gas moles (4 → 2), so right.",
  },
  temperature: {
    label: "Raise temperature",
    dir: "left",
    why: "This reaction is exothermic, so heating favours the reverse (endothermic) direction.",
  },
};

function LeChatelierDemo() {
  const [stress, setStress] = useState<Stress>("reactant");
  const info = STRESS_INFO[stress];
  const shiftRight = info.dir === "right";
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        {"Le Chatelier's principle: a system at equilibrium resists change. Apply a stress and watch it shift."}
      </h4>
      <div className="rounded-2xl bg-white p-4 text-center shadow-inner">
        <div className="font-mono text-lg text-slate-800">
          N₂ + 3H₂ ⇌ 2NH₃
        </div>
        <div className="mt-1 text-xs text-slate-500">forward reaction is exothermic (ΔH &lt; 0)</div>
        <div className="mt-4 flex items-center justify-center gap-4">
          <span className={"rounded-xl px-3 py-2 text-sm font-semibold " + (shiftRight ? "bg-slate-100 text-slate-500" : "bg-teal-100 text-teal-700")}>
            N₂ + 3H₂
          </span>
          <svg viewBox="0 0 80 40" className="h-10 w-20">
            <line x1={shiftRight ? 8 : 72} y1={20} x2={shiftRight ? 68 : 12} y2={20} stroke="#0d9488" strokeWidth={4} strokeLinecap="round" />
            <polygon points={shiftRight ? "72,20 62,14 62,26" : "8,20 18,14 18,26"} fill="#0d9488" />
          </svg>
          <span className={"rounded-xl px-3 py-2 text-sm font-semibold " + (shiftRight ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500")}>
            2NH₃
          </span>
        </div>
        <div className="mt-2 text-sm font-bold text-teal-600">
          Shifts {info.dir === "right" ? "RIGHT →" : "← LEFT"}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {(Object.keys(STRESS_INFO) as Stress[]).map((s) => (
          <button
            key={s}
            onClick={() => setStress(s)}
            className={
              "rounded-xl px-3 py-2 text-xs font-semibold transition " +
              (s === stress ? "bg-teal-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-teal-50")
            }
            aria-pressed={s === stress}
          >
            {STRESS_INFO[s].label}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-teal-400 bg-white p-3 text-xs text-slate-600">
        {info.why}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Reaching equilibrium — rates converge, concentrations level off
// ============================================================================
function ReachingEquilibriumDemo() {
  const [k, setK] = useState(3);
  const W = 300,
    H = 160,
    pad = 26;
  const tMax = 5;
  // product builds up as P = Peq(1 − e^(−k t)); reactant falls to Req
  const Peq = 0.65;
  const R0 = 1;
  const Req = R0 - Peq;
  const px = (t: number) => pad + (t / tMax) * (W - 2 * pad);
  const py = (c: number) => H - pad - c * (H - 2 * pad);
  const fwdPts: string[] = [];
  const revPts: string[] = [];
  const rPts: string[] = [];
  const pPts: string[] = [];
  for (let t = 0; t <= tMax; t += 0.1) {
    const P = Peq * (1 - Math.exp(-k * t));
    const R = R0 - P;
    const rateF = R; // forward rate ∝ [reactant]
    const rateR = P; // reverse rate ∝ [product]
    fwdPts.push(`${px(t)},${py(rateF)}`);
    revPts.push(`${px(t)},${py(rateR)}`);
    rPts.push(`${px(t)},${py(R)}`);
    pPts.push(`${px(t)},${py(P)}`);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Equilibrium is reached when the forward and reverse rates become equal — concentrations then stop changing.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <div className="mb-1 text-xs font-semibold text-slate-600">Reaction rates</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={fwdPts.join(" ")} fill="none" stroke="#0d9488" strokeWidth={2.5} />
          <polyline points={revPts.join(" ")} fill="none" stroke="#0284c7" strokeWidth={2.5} />
          <text x={W - pad} y={H - pad + 14} textAnchor="end" fontSize="9" fill="#64748b">time →</text>
          <text x={pad + 6} y={pad + 10} fontSize="9" fill="#0d9488">forward rate</text>
          <text x={pad + 6} y={pad + 22} fontSize="9" fill="#0284c7">reverse rate</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <div className="mb-1 text-xs font-semibold text-slate-600">Concentrations</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={rPts.join(" ")} fill="none" stroke="#0d9488" strokeWidth={2.5} />
          <polyline points={pPts.join(" ")} fill="none" stroke="#0284c7" strokeWidth={2.5} />
          <text x={W - pad} y={H - pad + 14} textAnchor="end" fontSize="9" fill="#64748b">time →</text>
          <text x={pad + 6} y={pad + 10} fontSize="9" fill="#0d9488">[reactant]</text>
          <text x={pad + 6} y={pad + 22} fontSize="9" fill="#0284c7">[product]</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Rate constant k = <span className="font-bold text-teal-600">{k.toFixed(1)}</span> (bigger k → equilibrium reached sooner)
          <input type="range" min={0.5} max={8} step={0.1} value={k} onChange={(e) => setK(+e.target.value)} className="mt-1 w-full accent-teal-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-xs text-slate-700">
        at equilibrium: rate_forward = rate_reverse, so [reactant] = {Req.toFixed(2)}, [product] = {Peq.toFixed(2)}
      </div>
    </div>
  );
}

export default function EquilibriumVizPremium() {
  const demos: DemoTab[] = [
    { id: "lechatelier", title: "Le Chatelier", emoji: "⚖️", render: () => <LeChatelierDemo /> },
    { id: "reaching", title: "Reaching equilibrium", emoji: "📈", render: () => <ReachingEquilibriumDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-teal-50 via-cyan-50 to-sky-50" />;
}
