"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Acidity ladder — ethanol < water < phenol < carboxylic acid
// ============================================================================
interface Acid {
  key: string;
  name: string;
  formula: string;
  pKa: number;
  note: string;
}

const ACIDS: Acid[] = [
  { key: "eth", name: "Ethanol", formula: "C₂H₅OH", pKa: 16, note: "Weakest — the ethoxide ion is not stabilised, so ethanol barely gives up its H." },
  { key: "wat", name: "Water", formula: "H₂O", pKa: 15.7, note: "Slightly more acidic than ethanol; the alkyl group of ethanol pushes electron density onto O." },
  { key: "phe", name: "Phenol", formula: "C₆H₅OH", pKa: 10, note: "More acidic than alcohols because the phenoxide ion is resonance-stabilised over the ring." },
  { key: "ace", name: "Acetic acid", formula: "CH₃COOH", pKa: 4.76, note: "Strongest here; the carboxylate ion spreads the charge over two equivalent oxygens." },
];

function AcidityLadderDemo() {
  const [sel, setSel] = useState("phe");
  const chosen = ACIDS.find((a) => a.key === sel) ?? ACIDS[0];
  // lower pKa = stronger acid → longer bar. Map pKa 4..16 to bar length.
  const barLen = (pKa: number) => {
    const frac = (16.5 - pKa) / (16.5 - 4);
    return Math.max(0.08, Math.min(1, frac));
  };
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Which loses its −OH proton most easily? Lower pKa means a stronger acid.
      </h4>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {ACIDS.map((a) => (
          <button
            key={a.key}
            onClick={() => setSel(a.key)}
            className={
              "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition " +
              (sel === a.key ? "bg-pink-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-pink-50")
            }
            aria-pressed={sel === a.key}
          >
            {a.name}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 320 150" className="h-auto w-full">
          {ACIDS.map((a, i) => {
            const y = 14 + i * 34;
            const w = barLen(a.pKa) * 250;
            const active = a.key === sel;
            return (
              <g key={a.key}>
                <text x={4} y={y + 13} fontSize="10" fill="#475569" fontWeight={active ? 700 : 400}>
                  {a.formula}
                </text>
                <rect x={70} y={y} width={250} height={18} rx={4} fill="#f1f5f9" />
                <rect x={70} y={y} width={w} height={18} rx={4} fill={active ? "#db2777" : "#f9a8d4"} />
                <text x={70 + w + 4} y={y + 13} fontSize="9" fill="#64748b">
                  pKa {a.pKa}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        {chosen.name}: pKa = <strong className="text-pink-600">{chosen.pKa}</strong>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-pink-400 bg-white p-3 text-xs text-slate-600">
        {chosen.note}
      </div>
      <div className="mt-2 text-center text-[11px] text-slate-500">
        Acidity increases: ethanol {"<"} water {"<"} phenol {"<"} carboxylic acid
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Dehydration of ethanol → ethene
// ============================================================================
interface Step {
  title: string;
  detail: string;
}

const STEPS: Step[] = [
  { title: "Start", detail: "Ethanol (C₂H₅OH) is heated with excess conc. H₂SO₄ at about 443 K." },
  { title: "1. Protonation", detail: "The lone pair on oxygen grabs a proton, giving a protonated alcohol (−OH₂⁺), a much better leaving group." },
  { title: "2. Loss of water", detail: "Water departs, leaving a primary carbocation CH₃−CH₂⁺." },
  { title: "3. Loss of H⁺", detail: "A proton is lost from the neighbouring carbon; the electrons form the C=C double bond of ethene." },
  { title: "Product", detail: "Ethene (CH₂=CH₂) plus water. Overall: C₂H₅OH → CH₂=CH₂ + H₂O." },
];

function DehydrationDemo() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Acid-catalysed dehydration of ethanol to ethene. Step through the mechanism.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 320 120" className="h-auto w-full">
          {/* Molecule drawing changes with step */}
          {step <= 1 && (
            <g>
              <text x={30} y={55} fontSize="14" fill="#334155" fontWeight={600}>CH₃</text>
              <line x1={70} y1={50} x2={95} y2={50} stroke="#334155" strokeWidth={2} />
              <text x={98} y={55} fontSize="14" fill="#334155" fontWeight={600}>CH₂</text>
              <line x1={138} y1={50} x2={163} y2={50} stroke="#334155" strokeWidth={2} />
              <text x={166} y={55} fontSize="14" fill={step === 1 ? "#db2777" : "#334155"} fontWeight={700}>
                {step === 1 ? "OH₂⁺" : "OH"}
              </text>
            </g>
          )}
          {step === 2 && (
            <g>
              <text x={30} y={55} fontSize="14" fill="#334155" fontWeight={600}>CH₃</text>
              <line x1={70} y1={50} x2={95} y2={50} stroke="#334155" strokeWidth={2} />
              <text x={98} y={55} fontSize="14" fill="#db2777" fontWeight={700}>CH₂⁺</text>
              <text x={170} y={55} fontSize="12" fill="#0ea5e9" fontWeight={600}>+ H₂O</text>
            </g>
          )}
          {step >= 3 && (
            <g>
              <text x={60} y={55} fontSize="14" fill="#334155" fontWeight={600}>CH₂</text>
              <line x1={100} y1={46} x2={128} y2={46} stroke="#db2777" strokeWidth={2} />
              <line x1={100} y1={54} x2={128} y2={54} stroke="#db2777" strokeWidth={2} />
              <text x={131} y={55} fontSize="14" fill="#334155" fontWeight={600}>CH₂</text>
              {step === 4 && <text x={185} y={55} fontSize="12" fill="#0ea5e9" fontWeight={600}>+ H₂O</text>}
            </g>
          )}
          <text x={160} y={100} textAnchor="middle" fontSize="11" fill="#94a3b8">
            conc. H₂SO₄, 443 K
          </text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-pink-600">{s.title}</span>
          <span className="text-[11px] text-slate-500">Step {step + 1} of {STEPS.length}</span>
        </div>
        <p className="text-xs text-slate-600">{s.detail}</p>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button
          onClick={() => setStep((v) => Math.max(0, v - 1))}
          disabled={step === 0}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium shadow-sm transition hover:bg-pink-50 disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep((v) => Math.min(STEPS.length - 1, v + 1))}
          disabled={step === STEPS.length - 1}
          className="rounded-full bg-pink-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-pink-700 disabled:opacity-40"
        >
          Next step →
        </button>
      </div>
    </div>
  );
}

export default function AlcoholsPhenolsEthersVizPremium() {
  const demos: DemoTab[] = [
    { id: "acidity", title: "Acidity ladder", emoji: "🧪", render: () => <AcidityLadderDemo /> },
    { id: "dehydration", title: "Dehydration", emoji: "💧", render: () => <DehydrationDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-pink-50 via-rose-50 to-red-50" />;
}
