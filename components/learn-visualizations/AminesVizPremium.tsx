"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Basic strength of ammonia and amines (aqueous phase)
// ============================================================================
interface Base {
  key: string;
  name: string;
  formula: string;
  pKb: number;
  note: string;
}

// Aqueous-phase basicity: 2° > 1° > 3° > NH₃ (approx pKb values)
const BASES: Base[] = [
  { key: "nh3", name: "Ammonia", formula: "NH₃", pKb: 4.75, note: "No alkyl groups to push electron density onto nitrogen, so it is the weakest base here." },
  { key: "prim", name: "1° amine", formula: "CH₃NH₂", pKb: 3.36, note: "One +I alkyl group raises the electron density on N, making it a better proton acceptor than ammonia." },
  { key: "sec", name: "2° amine", formula: "(CH₃)₂NH", pKb: 3.27, note: "Two alkyl groups give the highest basicity in water — a good balance of electron donation and solvation of the cation." },
  { key: "tert", name: "3° amine", formula: "(CH₃)₃N", pKb: 4.22, note: "Three bulky groups crowd the nitrogen and hinder solvation of the protonated ion, so basicity drops again." },
];

function BasicityDemo() {
  const [sel, setSel] = useState("sec");
  const chosen = BASES.find((b) => b.key === sel) ?? BASES[0];
  // lower pKb = stronger base → longer bar
  const barLen = (pKb: number) => {
    const frac = (5.0 - pKb) / (5.0 - 3.0);
    return Math.max(0.08, Math.min(1, frac));
  };
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        How readily does the nitrogen lone pair grab a proton? Lower pKb means a stronger base.
      </h4>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {BASES.map((b) => (
          <button
            key={b.key}
            onClick={() => setSel(b.key)}
            className={
              "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition " +
              (sel === b.key ? "bg-lime-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-lime-50")
            }
            aria-pressed={sel === b.key}
          >
            {b.name}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 320 150" className="h-auto w-full">
          {BASES.map((b, i) => {
            const y = 14 + i * 34;
            const w = barLen(b.pKb) * 210;
            const active = b.key === sel;
            return (
              <g key={b.key}>
                <text x={4} y={y + 13} fontSize="10" fill="#475569" fontWeight={active ? 700 : 400}>
                  {b.formula}
                </text>
                <rect x={92} y={y} width={210} height={18} rx={4} fill="#f1f5f9" />
                <rect x={92} y={y} width={w} height={18} rx={4} fill={active ? "#65a30d" : "#bef264"} />
                <text x={92 + w + 4} y={y + 13} fontSize="9" fill="#64748b">
                  pKb {b.pKb}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        {chosen.name}: pKb = <strong className="text-lime-600">{chosen.pKb}</strong>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-lime-400 bg-white p-3 text-xs text-slate-600">
        {chosen.note}
      </div>
      <div className="mt-2 text-center text-[11px] text-slate-500">
        Aqueous basicity order: 2° {">"} 1° {">"} 3° {">"} NH₃
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Diazonium salt formation and coupling
// ============================================================================
interface DStep {
  title: string;
  detail: string;
}

const DSTEPS: DStep[] = [
  { title: "Aniline", detail: "Start with aniline (C₆H₅NH₂), a primary aromatic amine." },
  { title: "Diazotisation", detail: "Treat with nitrous acid (NaNO₂ + HCl) at 0–5 °C to form benzenediazonium chloride (C₆H₅N₂⁺Cl⁻). Low temperature keeps the unstable salt from decomposing." },
  { title: "Coupling", detail: "The diazonium ion couples with phenol (in mild alkali) at the para position." },
  { title: "Azo dye", detail: "The product is a brightly coloured azo compound, C₆H₅−N=N−C₆H₄−OH, joined by the −N=N− azo linkage." },
];

function DiazoniumDemo() {
  const [step, setStep] = useState(0);
  const s = DSTEPS[step];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        From aniline to a coloured azo dye through a diazonium salt.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 320 130" className="h-auto w-full">
          {/* benzene ring drawn as a hexagon with circle */}
          <g transform="translate(60,65)">
            <polygon points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11" fill="none" stroke="#334155" strokeWidth={2} />
            <circle r={12} fill="none" stroke="#334155" strokeWidth={1.3} />
          </g>
          {/* substituent on the ring */}
          <line x1={79} y1={65} x2={110} y2={65} stroke="#334155" strokeWidth={2} />
          <text x={113} y={70} fontSize="13" fill={step >= 1 ? "#16a34a" : "#334155"} fontWeight={700}>
            {step === 0 ? "NH₂" : "N₂⁺"}
          </text>

          {step >= 1 && step < 3 && (
            <text x={160} y={70} fontSize="11" fill="#64748b">
              {step === 1 ? "Cl⁻" : "+ phenol"}
            </text>
          )}

          {step >= 3 && (
            <g>
              <text x={150} y={70} fontSize="12" fill="#16a34a" fontWeight={700}>N=N</text>
              <line x1={190} y1={65} x2={215} y2={65} stroke="#334155" strokeWidth={2} />
              <g transform="translate(240,65)">
                <polygon points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11" fill="none" stroke="#334155" strokeWidth={2} />
                <circle r={12} fill="none" stroke="#334155" strokeWidth={1.3} />
              </g>
              <line x1={259} y1={65} x2={282} y2={65} stroke="#334155" strokeWidth={2} />
              <text x={285} y={70} fontSize="12" fill="#dc2626" fontWeight={700}>OH</text>
            </g>
          )}
          <text x={160} y={118} textAnchor="middle" fontSize="9" fill="#94a3b8">
            {step === 1 ? "NaNO₂ / HCl, 0–5 °C" : step >= 3 ? "azo dye (coloured)" : ""}
          </text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-lime-600">{s.title}</span>
          <span className="text-[11px] text-slate-500">Step {step + 1} of {DSTEPS.length}</span>
        </div>
        <p className="text-xs text-slate-600">{s.detail}</p>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button
          onClick={() => setStep((v) => Math.max(0, v - 1))}
          disabled={step === 0}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium shadow-sm transition hover:bg-lime-50 disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep((v) => Math.min(DSTEPS.length - 1, v + 1))}
          disabled={step === DSTEPS.length - 1}
          className="rounded-full bg-lime-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-lime-700 disabled:opacity-40"
        >
          Next step →
        </button>
      </div>
    </div>
  );
}

export default function AminesVizPremium() {
  const demos: DemoTab[] = [
    { id: "basicity", title: "Basicity", emoji: "📊", render: () => <BasicityDemo /> },
    { id: "diazonium", title: "Diazonium", emoji: "🧫", render: () => <DiazoniumDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-lime-50 via-green-50 to-emerald-50" />;
}
