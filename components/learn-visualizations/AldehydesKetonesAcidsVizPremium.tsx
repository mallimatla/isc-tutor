"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Nucleophilic addition to a carbonyl
// ============================================================================
interface AddStep {
  title: string;
  detail: string;
}

const ADD_STEPS: AddStep[] = [
  { title: "Polarised carbonyl", detail: "The C=O bond is polarised: carbon is δ+ (electrophilic) and oxygen is δ− (electron rich). The carbon is trigonal planar." },
  { title: "Nucleophile attacks", detail: "A nucleophile (Nu⁻) attacks the electrophilic carbonyl carbon from above the plane." },
  { title: "π electrons shift", detail: "The C=O π electrons move onto oxygen, forming a negatively charged alkoxide ion. Carbon is now tetrahedral (sp³)." },
  { title: "Protonation", detail: "The alkoxide oxygen picks up a proton (H⁺) to give the neutral addition product." },
];

function NucleophilicAdditionDemo() {
  const [step, setStep] = useState(0);
  const s = ADD_STEPS[step];
  // carbon centre at (150,70)
  const tetra = step >= 2;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Watch a nucleophile add to the carbonyl carbon, flipping it from flat to tetrahedral.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 150" className="h-auto w-full">
          {/* carbon centre */}
          <circle cx={150} cy={75} r={14} fill="#fef3c7" stroke="#f59e0b" strokeWidth={2} />
          <text x={150} y={80} textAnchor="middle" fontSize="13" fill="#334155" fontWeight={700}>C</text>
          {step < 2 && <text x={150} y={62} textAnchor="middle" fontSize="8" fill="#f59e0b">δ+</text>}

          {/* two R groups (left/lower) */}
          <line x1={150} y1={75} x2={112} y2={100} stroke="#334155" strokeWidth={2} />
          <text x={98} y={110} fontSize="11" fill="#64748b">R</text>
          <line x1={150} y1={75} x2={150} y2={120} stroke="#334155" strokeWidth={2} />
          <text x={145} y={135} fontSize="11" fill="#64748b">R{"′"}</text>

          {/* C=O to the right */}
          {step < 2 ? (
            <g>
              <line x1={164} y1={70} x2={210} y2={55} stroke="#334155" strokeWidth={2} />
              <line x1={166} y1={78} x2={212} y2={63} stroke="#334155" strokeWidth={2} />
            </g>
          ) : (
            <line x1={164} y1={70} x2={210} y2={55} stroke="#334155" strokeWidth={2} />
          )}
          <text x={214} y={55} fontSize="13" fill="#dc2626" fontWeight={700}>O{step >= 2 ? "⁻" : ""}</text>
          {step < 2 && <text x={214} y={42} fontSize="8" fill="#dc2626">δ−</text>}
          {step === 3 && (
            <g>
              <line x1={230} y1={50} x2={250} y2={38} stroke="#0ea5e9" strokeWidth={1.5} />
              <text x={252} y={40} fontSize="11" fill="#0ea5e9" fontWeight={600}>H</text>
            </g>
          )}

          {/* Nucleophile approaching from top */}
          {step === 0 && (
            <g>
              <text x={150} y={20} textAnchor="middle" fontSize="12" fill="#16a34a" fontWeight={700}>Nu⁻</text>
            </g>
          )}
          {step === 1 && (
            <g>
              <text x={150} y={24} textAnchor="middle" fontSize="12" fill="#16a34a" fontWeight={700}>Nu⁻</text>
              <path d="M150 30 L150 58" stroke="#16a34a" strokeWidth={1.5} markerEnd="url(#arrA)" />
            </g>
          )}
          {tetra && (
            <g>
              <line x1={150} y1={75} x2={150} y2={40} stroke="#16a34a" strokeWidth={2} />
              <text x={150} y={32} textAnchor="middle" fontSize="12" fill="#16a34a" fontWeight={700}>Nu</text>
            </g>
          )}
          <defs>
            <marker id="arrA" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="#16a34a" />
            </marker>
          </defs>
          <text x={150} y={148} textAnchor="middle" fontSize="9" fill="#94a3b8">
            {tetra ? "tetrahedral (sp³)" : "trigonal planar (sp²)"}
          </text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-600">{s.title}</span>
          <span className="text-[11px] text-slate-500">Step {step + 1} of {ADD_STEPS.length}</span>
        </div>
        <p className="text-xs text-slate-600">{s.detail}</p>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button
          onClick={() => setStep((v) => Math.max(0, v - 1))}
          disabled={step === 0}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium shadow-sm transition hover:bg-amber-50 disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep((v) => Math.min(ADD_STEPS.length - 1, v + 1))}
          disabled={step === ADD_STEPS.length - 1}
          className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-40"
        >
          Next step →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Carboxylic acid strength vs electron-withdrawing groups
// ============================================================================
interface CAcid {
  key: string;
  name: string;
  formula: string;
  pKa: number;
  cl: number;
}

const CACIDS: CAcid[] = [
  { key: "ace", name: "Acetic", formula: "CH₃COOH", pKa: 4.76, cl: 0 },
  { key: "mono", name: "Chloroacetic", formula: "CH₂ClCOOH", pKa: 2.86, cl: 1 },
  { key: "di", name: "Dichloroacetic", formula: "CHCl₂COOH", pKa: 1.29, cl: 2 },
  { key: "tri", name: "Trichloroacetic", formula: "CCl₃COOH", pKa: 0.65, cl: 3 },
];

function AcidStrengthDemo() {
  const [sel, setSel] = useState("ace");
  const chosen = CACIDS.find((a) => a.key === sel) ?? CACIDS[0];
  const barLen = (pKa: number) => {
    const frac = (5.2 - pKa) / 5.2;
    return Math.max(0.06, Math.min(1, frac));
  };
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Adding electron-withdrawing chlorines pulls the pKa down — the acid gets stronger.
      </h4>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {CACIDS.map((a) => (
          <button
            key={a.key}
            onClick={() => setSel(a.key)}
            className={
              "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition " +
              (sel === a.key ? "bg-amber-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-amber-50")
            }
            aria-pressed={sel === a.key}
          >
            {a.name}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 320 150" className="h-auto w-full">
          {CACIDS.map((a, i) => {
            const y = 14 + i * 34;
            const w = barLen(a.pKa) * 200;
            const active = a.key === sel;
            return (
              <g key={a.key}>
                <text x={4} y={y + 13} fontSize="9" fill="#475569" fontWeight={active ? 700 : 400}>
                  {a.formula}
                </text>
                <rect x={112} y={y} width={200} height={18} rx={4} fill="#f1f5f9" />
                <rect x={112} y={y} width={w} height={18} rx={4} fill={active ? "#d97706" : "#fcd34d"} />
                <text x={112 + w + 4} y={y + 13} fontSize="9" fill="#64748b">
                  pKa {a.pKa}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        {chosen.name} acid: pKa = <strong className="text-amber-600">{chosen.pKa}</strong>
        {chosen.cl > 0 && <span className="text-slate-500"> ({chosen.cl} Cl)</span>}
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-amber-400 bg-white p-3 text-xs text-slate-600">
        Each electronegative Cl withdraws electron density through the sigma bonds (the inductive
        effect). This spreads out and stabilises the negative charge of the carboxylate ion, so the
        acid ionises more readily and pKa falls.
      </div>
    </div>
  );
}

export default function AldehydesKetonesAcidsVizPremium() {
  const demos: DemoTab[] = [
    { id: "addition", title: "Nucleophilic addition", emoji: "➕", render: () => <NucleophilicAdditionDemo /> },
    { id: "acidstrength", title: "Acid strength", emoji: "📊", render: () => <AcidStrengthDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-amber-50 via-orange-50 to-yellow-50" />;
}
