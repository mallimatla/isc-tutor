"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

const MOLAR_MASSES = [
  { label: "H₂O", M: 18 },
  { label: "CO₂", M: 44 },
  { label: "NaCl", M: 58.5 },
];

// ============================================================================
// Demo 1: Mole ↔ mass ↔ particles
// ============================================================================
function MoleMassDemo() {
  const [n, setN] = useState(1);
  const [mi, setMi] = useState(0);
  const M = MOLAR_MASSES[mi].M;
  const mass = n * M;
  const particles = n * 6.022;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        One mole is a counting unit — {"6.022×10²³"} particles. Moles link mass and number.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {MOLAR_MASSES.map((m, i) => (
            <button
              key={m.label}
              onClick={() => setMi(i)}
              className={
                "flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition " +
                (i === mi ? "bg-emerald-600 text-white shadow" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100")
              }
              aria-pressed={i === mi}
            >
              {m.label} = {m.M} g/mol
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-emerald-50 p-2">
            <div className="text-[10px] font-medium text-slate-500">moles n</div>
            <div className="text-lg font-bold text-emerald-600">{n.toFixed(1)}</div>
            <div className="text-[10px] text-slate-500">mol</div>
          </div>
          <div className="rounded-xl bg-teal-50 p-2">
            <div className="text-[10px] font-medium text-slate-500">mass = n × M</div>
            <div className="text-lg font-bold text-teal-600">{mass.toFixed(1)}</div>
            <div className="text-[10px] text-slate-500">g</div>
          </div>
          <div className="rounded-xl bg-cyan-50 p-2">
            <div className="text-[10px] font-medium text-slate-500">particles</div>
            <div className="text-lg font-bold text-cyan-600">{particles.toFixed(2)}</div>
            <div className="text-[10px] text-slate-500">{"×10²³"}</div>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Amount n = <span className="font-bold text-emerald-600">{n.toFixed(1)} mol</span>
          <input type="range" min={0} max={5} step={0.1} value={n} onChange={(e) => setN(+e.target.value)} className="mt-1 w-full accent-emerald-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        mass = n × M &nbsp;·&nbsp; N = n × {"6.022×10²³"}
      </div>
    </div>
  );
}

function ReagentBar({ label, used, total, color }: { label: string; used: number; total: number; color: string }) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  return (
    <div className="mb-2">
      <div className="mb-0.5 flex justify-between text-[11px] text-slate-600">
        <span className="font-semibold">{label}</span>
        <span>{used.toFixed(1)} / {total.toFixed(1)} mol used</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Limiting reagent — 2H₂ + O₂ → 2H₂O
// ============================================================================
function LimitingReagentDemo() {
  const [h2, setH2] = useState(4);
  const [o2, setO2] = useState(1);
  // H₂ needs ratio 2 per O₂
  const h2Needed = o2 * 2; // H₂ required to consume all O₂
  const h2Limiting = h2 < h2Needed;
  const water = h2Limiting ? h2 : o2 * 2; // 2 H₂O per 2 H₂ = 1:1 with H₂ used
  const h2Used = h2Limiting ? h2 : o2 * 2;
  const o2Used = h2Limiting ? h2 / 2 : o2;
  const h2Left = h2 - h2Used;
  const o2Left = o2 - o2Used;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        The limiting reagent runs out first and caps the product. 2H₂ + O₂ → 2H₂O.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <ReagentBar label="H₂" used={h2Used} total={h2} color="#0d9488" />
        <ReagentBar label="O₂" used={o2Used} total={o2} color="#0891b2" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white p-3 shadow-inner">
          <label className="text-xs font-medium text-slate-600">
            H₂ = <span className="font-bold text-teal-600">{h2.toFixed(1)}</span> mol
            <input type="range" min={0} max={8} step={0.5} value={h2} onChange={(e) => setH2(+e.target.value)} className="mt-1 w-full accent-teal-500" />
          </label>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-inner">
          <label className="text-xs font-medium text-slate-600">
            O₂ = <span className="font-bold text-cyan-600">{o2.toFixed(1)}</span> mol
            <input type="range" min={0} max={4} step={0.25} value={o2} onChange={(e) => setO2(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
          </label>
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-400 bg-white p-3 text-xs text-slate-600">
        Limiting reagent: <strong className="text-emerald-600">{h2Limiting ? "H₂" : "O₂"}</strong>. Forms{" "}
        <strong className="text-teal-600">{water.toFixed(1)} mol H₂O</strong>. Left over:{" "}
        <strong>{h2Left > 0.001 ? `${h2Left.toFixed(1)} mol H₂` : o2Left > 0.001 ? `${o2Left.toFixed(1)} mol O₂` : "nothing"}</strong>.
      </div>
    </div>
  );
}

export default function BasicConceptsVizPremium() {
  const demos: DemoTab[] = [
    { id: "mole", title: "Mole ↔ mass", emoji: "🧮", render: () => <MoleMassDemo /> },
    { id: "limiting", title: "Limiting reagent", emoji: "⚖️", render: () => <LimitingReagentDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-emerald-50 via-teal-50 to-cyan-50" />;
}
