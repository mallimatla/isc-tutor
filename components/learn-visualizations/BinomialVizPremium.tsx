"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

function binom(n: number, k: number): number {
  let v = 1;
  for (let i = 0; i < k; i++) v = (v * (n - i)) / (i + 1);
  return Math.round(v);
}

// ============================================================================
// Demo 1: Pascal's triangle highlighter
// ============================================================================
function PascalHighlightDemo() {
  const ROWS = 8;
  const [selectedRow, setSelectedRow] = useState(4);
  const W = 520, H = 360, cx = W / 2, rowGap = 38, cellGap = 44;
  const coefficients = Array.from({ length: selectedRow + 1 }, (_, k) => binom(selectedRow, k));
  const expansionTerms = coefficients.map((coef, k) => {
    const power = selectedRow - k;
    const aPart = power === 0 ? "" : power === 1 ? "a" : `a^${power}`;
    const bPart = k === 0 ? "" : k === 1 ? "b" : `b^${k}`;
    const coefPart = coef === 1 ? "" : `${coef}`;
    return `${coefPart}${aPart}${bPart}` || "1";
  });
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Tap any row of Pascal's triangle to see (a+b)ⁿ."}</h4>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none rounded-2xl bg-white shadow-inner">
        {Array.from({ length: ROWS }, (_, n) => {
          const y = 30 + n * rowGap;
          const isSelected = n === selectedRow;
          return (
            <g key={n}>
              {Array.from({ length: n + 1 }, (_, k) => {
                const x = cx + (k - n / 2) * cellGap;
                const value = binom(n, k);
                return (
                  <g key={`${n}-${k}`} className="cursor-pointer" onClick={() => setSelectedRow(n)}>
                    <circle cx={x} cy={y} r="17" fill={isSelected ? "#0ea5e9" : "#f1f5f9"} stroke={isSelected ? "#0369a1" : "#cbd5e1"} strokeWidth={isSelected ? "2.5" : "1.5"} />
                    <text x={x} y={y + 5} textAnchor="middle" fill={isSelected ? "#fff" : "#475569"} fontSize="14" fontWeight={isSelected ? "700" : "500"}>{value}</text>
                  </g>
                );
              })}
              <text x={W - 24} y={y + 5} fill="#94a3b8" fontSize="11" textAnchor="end">n={n}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-sky-50 p-3 text-center"><div className="text-[10px] uppercase text-sky-700">n</div><div className="text-2xl font-bold text-sky-700">{selectedRow}</div></div>
        <div className="rounded-xl bg-blue-50 p-3 text-center"><div className="text-[10px] uppercase text-blue-700">Sum = 2ⁿ</div><div className="text-2xl font-bold text-blue-700">{Math.pow(2, selectedRow)}</div></div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-sky-500 bg-white p-3 font-mono text-sm">
        (a + b)<sup>{selectedRow}</sup> = {expansionTerms.join(" + ").replace(/\^(\d+)/g, "^$1")}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Specific term finder (Tr+1)
// ============================================================================
function GeneralTermDemo() {
  const [n, setN] = useState(6);
  const [r, setR] = useState(2);
  const safeR = Math.min(r, n);
  const coef = binom(n, safeR);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Tᵣ₊₁ = ⁿCᵣ · aⁿ⁻ʳ · bʳ — slide r to see each term.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">n = {n}</span><input type="range" min={1} max={10} value={n} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-sky-500" /></div>
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">r = {safeR}</span><input type="range" min={0} max={n} value={safeR} onChange={(e) => setR(parseInt(e.target.value))} className="flex-1 accent-blue-500" /></div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="text-center font-mono text-lg text-slate-700">
          T<sub>{safeR + 1}</sub> = <span className="text-sky-600 font-bold">{coef}</span> · a<sup>{n - safeR}</sup> · b<sup>{safeR}</sup>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-sky-50 p-2 text-center"><div className="text-[10px] uppercase text-sky-700">Coefficient</div><div className="font-mono text-xl font-bold text-sky-700">{coef}</div></div>
          <div className="rounded-lg bg-blue-50 p-2 text-center"><div className="text-[10px] uppercase text-blue-700">Term position</div><div className="font-mono text-xl font-bold text-blue-700">{safeR + 1} of {n + 1}</div></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Sum of coefficients
// ============================================================================
function SumCoefDemo() {
  const [n, setN] = useState(5);
  const coefs = Array.from({ length: n + 1 }, (_, k) => binom(n, k));
  const sum = coefs.reduce((a, b) => a + b, 0);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Add up Pascal row n — it always equals 2ⁿ. (Plug in a=b=1!)</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">n =</span>
        <input type="range" min={0} max={10} value={n} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-sky-500" />
        <span className="w-8 text-center text-lg font-bold text-sky-600">{n}</span>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex flex-wrap justify-center gap-1.5">
          {coefs.map((c, i) => (<span key={i} className="rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 px-3 py-1.5 font-mono text-sm font-bold text-white shadow-sm">{c}</span>))}
        </div>
        <div className="mt-3 text-center font-mono">
          <span className="text-slate-500">Sum = </span>
          <span className="text-2xl font-bold text-sky-700">{sum.toLocaleString()}</span>
          <span className="text-slate-500"> = 2<sup>{n}</sup></span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Middle term identifier
// ============================================================================
function MiddleTermDemo() {
  const [n, setN] = useState(8);
  const isEven = n % 2 === 0;
  const middleIdx = isEven ? n / 2 : (n - 1) / 2;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">For (a+b)ⁿ: if n is even, one middle term; if odd, two middle terms.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">n =</span>
        <input type="range" min={2} max={12} value={n} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-sky-500" />
        <span className="w-8 text-center text-lg font-bold text-sky-600">{n}</span>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: n + 1 }, (_, k) => (
            <div key={k} className={"flex h-10 w-10 items-center justify-center rounded-lg font-mono text-sm font-bold transition " + ((isEven && k === middleIdx) || (!isEven && (k === middleIdx || k === middleIdx + 1)) ? "scale-110 bg-amber-500 text-white shadow-md" : "bg-sky-50 text-sky-700")}>{binom(n, k)}</div>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3 text-sm">
        {isEven ? (
          <span>{"n is even — there's "}<strong>one</strong> middle term: T<sub>{middleIdx + 1}</sub></span>
        ) : (
          <span>n is odd — <strong>two</strong> middle terms: T<sub>{middleIdx + 1}</sub> and T<sub>{middleIdx + 2}</sub></span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Area expansion (a+b)² visualized as square
// ============================================================================
function SquareExpansionDemo() {
  const [a, setA] = useState(60);
  const [b, setB] = useState(80);
  const total = a + b;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">(a + b)² = a² + 2ab + b² — see it as 4 pieces of a square.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">a = {a}</span><input type="range" min={20} max={120} value={a} onChange={(e) => setA(parseInt(e.target.value))} className="flex-1 accent-sky-500" /></div>
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">b = {b}</span><input type="range" min={20} max={120} value={b} onChange={(e) => setB(parseInt(e.target.value))} className="flex-1 accent-blue-500" /></div>
      </div>
      <svg viewBox="0 0 280 280" className="mx-auto rounded-2xl bg-white shadow-inner">
        <rect x="20" y="20" width={a} height={a} fill="#0ea5e9" opacity="0.8" />
        <text x={20 + a / 2} y={20 + a / 2 + 5} textAnchor="middle" fill="white" fontSize="16" fontWeight="700">a²</text>
        <rect x={20 + a} y="20" width={b} height={a} fill="#a78bfa" opacity="0.8" />
        <text x={20 + a + b / 2} y={20 + a / 2 + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="700">ab</text>
        <rect x="20" y={20 + a} width={a} height={b} fill="#a78bfa" opacity="0.8" />
        <text x={20 + a / 2} y={20 + a + b / 2 + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="700">ab</text>
        <rect x={20 + a} y={20 + a} width={b} height={b} fill="#ec4899" opacity="0.8" />
        <text x={20 + a + b / 2} y={20 + a + b / 2 + 5} textAnchor="middle" fill="white" fontSize="16" fontWeight="700">b²</text>
      </svg>
      <div className="mt-3 rounded-xl border-l-4 border-sky-500 bg-white p-3 text-center font-mono">
        ({a} + {b})² = {a * a} + 2·{a * b} + {b * b} = <span className="font-bold text-sky-700">{total * total}</span>
      </div>
    </div>
  );
}

export default function BinomialVizPremium() {
  const demos: DemoTab[] = [
    { id: "pascal", title: "Pascal's triangle", emoji: "🔺", render: () => <PascalHighlightDemo /> },
    { id: "general", title: "General term", emoji: "🎯", render: () => <GeneralTermDemo /> },
    { id: "sum", title: "Sum of coefs", emoji: "➕", render: () => <SumCoefDemo /> },
    { id: "middle", title: "Middle term", emoji: "🎪", render: () => <MiddleTermDemo /> },
    { id: "square", title: "(a+b)² area", emoji: "🟦", render: () => <SquareExpansionDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-sky-50 via-blue-50 to-indigo-50" />;
}
