"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Glucose — open chain vs cyclic Haworth ring
// ============================================================================
function GlucoseFormsDemo() {
  const [cyclic, setCyclic] = useState(false);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Glucose flips between an open-chain aldehyde and a six-membered ring. Toggle the form.
      </h4>
      <div className="mb-3 flex justify-center gap-2">
        <button
          onClick={() => setCyclic(false)}
          className={
            "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
            (!cyclic ? "bg-emerald-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-emerald-50")
          }
          aria-pressed={!cyclic}
        >
          Open chain
        </button>
        <button
          onClick={() => setCyclic(true)}
          className={
            "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
            (cyclic ? "bg-emerald-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-emerald-50")
          }
          aria-pressed={cyclic}
        >
          Cyclic (Haworth)
        </button>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 170" className="h-auto w-full">
          {!cyclic ? (
            <g>
              {/* open chain: CHO at top, then chain of C-OH, CH2OH at bottom */}
              <text x={150} y={20} textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight={700}>CHO</text>
              <line x1={150} y1={24} x2={150} y2={38} stroke="#334155" strokeWidth={1.5} />
              {["H−C−OH", "HO−C−H", "H−C−OH", "H−C−OH"].map((lbl, i) => {
                const y = 50 + i * 26;
                return (
                  <g key={i}>
                    <text x={150} y={y} textAnchor="middle" fontSize="11" fill="#334155">{lbl}</text>
                    <line x1={150} y1={y + 4} x2={150} y2={y + 18} stroke="#334155" strokeWidth={1.5} />
                  </g>
                );
              })}
              <text x={150} y={162} textAnchor="middle" fontSize="12" fill="#0ea5e9" fontWeight={700}>CH₂OH</text>
            </g>
          ) : (
            <g>
              {/* Haworth ring: hexagon with O at top-right */}
              <polygon points="90,70 150,50 210,70 210,120 150,140 90,120" fill="#ecfdf5" stroke="#059669" strokeWidth={2} />
              <text x={210} y={62} fontSize="12" fill="#dc2626" fontWeight={700}>O</text>
              {/* ring carbons and substituents */}
              <text x={225} y={78} fontSize="10" fill="#0ea5e9" fontWeight={600}>CH₂OH</text>
              <text x={215} y={135} fontSize="10" fill="#334155">OH</text>
              <text x={140} y={158} fontSize="10" fill="#334155">OH</text>
              <text x={62} y={135} fontSize="10" fill="#334155">OH</text>
              <text x={64} y={70} fontSize="10" fill="#334155">OH</text>
              <text x={150} y={98} textAnchor="middle" fontSize="9" fill="#94a3b8">pyranose ring</text>
            </g>
          )}
        </svg>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        Glucose = <strong className="text-emerald-600">C₆H₁₂O₆</strong> (an aldohexose)
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-400 bg-white p-3 text-xs text-slate-600">
        {cyclic
          ? "The −OH on C5 attacks the C1 aldehyde, closing a six-membered ring and creating a new −OH at C1 (the anomeric carbon)."
          : "In the open chain the aldehyde group (−CHO) sits on C1, with hydroxyl groups down the carbon backbone and a −CH₂OH at C6."}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: DNA base pairing
// ============================================================================
function DnaPairingDemo() {
  const [pair, setPair] = useState<"AT" | "GC">("AT");
  const bonds = pair === "AT" ? 2 : 3;
  const left = pair === "AT" ? "A" : "G";
  const right = pair === "AT" ? "T" : "C";
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        The two DNA strands are held together by base pairs. Toggle the pairing rule.
      </h4>
      <div className="mb-3 flex justify-center gap-2">
        <button
          onClick={() => setPair("AT")}
          className={
            "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
            (pair === "AT" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-emerald-50")
          }
          aria-pressed={pair === "AT"}
        >
          A–T (2 bonds)
        </button>
        <button
          onClick={() => setPair("GC")}
          className={
            "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
            (pair === "GC" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-emerald-50")
          }
          aria-pressed={pair === "GC"}
        >
          G–C (3 bonds)
        </button>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 170" className="h-auto w-full">
          {/* two backbones */}
          <line x1={40} y1={10} x2={40} y2={160} stroke="#059669" strokeWidth={5} strokeLinecap="round" />
          <line x1={260} y1={10} x2={260} y2={160} stroke="#059669" strokeWidth={5} strokeLinecap="round" />
          <text x={40} y={172} textAnchor="middle" fontSize="8" fill="#94a3b8">backbone</text>
          <text x={260} y={172} textAnchor="middle" fontSize="8" fill="#94a3b8">backbone</text>
          {/* four rungs, the middle one highlighted */}
          {[0, 1, 2, 3].map((i) => {
            const y = 35 + i * 32;
            const highlight = i === 1;
            const l = highlight ? left : ["T", "A", "C", "G"][i];
            const r = highlight ? right : ["A", "T", "G", "C"][i];
            const nb = highlight ? bonds : (l === "A" || l === "T" ? 2 : 3);
            return (
              <g key={i} opacity={highlight ? 1 : 0.35}>
                <rect x={48} y={y - 9} width={26} height={18} rx={4} fill="#a7f3d0" />
                <text x={61} y={y + 4} textAnchor="middle" fontSize="11" fill="#065f46" fontWeight={700}>{l}</text>
                <rect x={226} y={y - 9} width={26} height={18} rx={4} fill="#a7f3d0" />
                <text x={239} y={y + 4} textAnchor="middle" fontSize="11" fill="#065f46" fontWeight={700}>{r}</text>
                {Array.from({ length: nb }).map((_, k) => {
                  const yy = y - (nb - 1) * 3 + k * 6;
                  return <line key={k} x1={78} y1={yy} x2={222} y2={yy} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />;
                })}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        {left}–{right}: <strong className="text-emerald-600">{bonds} hydrogen bonds</strong>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-400 bg-white p-3 text-xs text-slate-600">
        Adenine always pairs with thymine through 2 hydrogen bonds; guanine pairs with cytosine
        through 3. The sugar (deoxyribose) and phosphate groups form the two backbones on the outside.
      </div>
    </div>
  );
}

export default function BiomoleculesVizPremium() {
  const demos: DemoTab[] = [
    { id: "glucose", title: "Glucose forms", emoji: "🍬", render: () => <GlucoseFormsDemo /> },
    { id: "dna", title: "DNA base pairing", emoji: "🧬", render: () => <DnaPairingDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-emerald-50 via-green-50 to-teal-50" />;
}
