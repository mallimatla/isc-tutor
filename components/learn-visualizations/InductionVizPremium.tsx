"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Domino chain (the heart of induction)
// ============================================================================
function DominoDemo() {
  const [pushed, setPushed] = useState(0);
  const dominoes = 12;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Push the first domino → every other one falls. That's induction."}</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="flex h-32 items-end justify-center gap-1.5 overflow-hidden">
          {Array.from({ length: dominoes }, (_, i) => {
            const fallen = i < pushed;
            return (
              <div
                key={i}
                className="origin-bottom-right transition-transform duration-300"
                style={{ transform: fallen ? "rotate(-70deg)" : "rotate(0deg)", transitionDelay: `${i * 60}ms` }}
              >
                <div className="h-20 w-3 rounded-sm bg-gradient-to-b from-violet-500 to-violet-700" />
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <button onClick={() => setPushed(dominoes)} className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white">Push #1</button>
          <button onClick={() => setPushed(0)} className="rounded-full border border-zinc-300 px-4 py-2 text-sm">Reset</button>
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-violet-500 bg-white p-3 text-sm">
        <div className="font-semibold">Two ingredients:</div>
        <div className="text-xs text-slate-600 mt-1">1) Base case: domino 1 falls. 2) Step: if domino k falls, so does k+1. ⇒ all fall.</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Sum 1+2+...+n = n(n+1)/2
// ============================================================================
function SumNDemo() {
  const [n, setN] = useState(5);
  const direct = (n * (n + 1)) / 2;
  let manual = 0;
  for (let i = 1; i <= n; i++) manual += i;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">1 + 2 + … + n = n(n+1)/2 — prove by induction.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">n =</span>
        <input type="range" min={1} max={15} value={n} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-violet-500" />
        <span className="w-8 text-center text-lg font-bold text-violet-600">{n}</span>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="flex h-32 items-end justify-center gap-1">
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-slate-500">{i + 1}</span>
              <div className="w-5 rounded-t bg-gradient-to-t from-violet-500 to-fuchsia-400" style={{ height: `${(i + 1) * 6}px` }} />
            </div>
          ))}
        </div>
        <div className="mt-3 text-center font-mono text-sm">
          <div className="text-slate-500">1+2+...+{n} = <strong>{manual}</strong></div>
          <div className="text-violet-700">{n}·({n}+1)/2 = <strong>{direct}</strong></div>
          <div className={"text-xs mt-1 " + (manual === direct ? "text-emerald-600" : "text-rose-600")}>{manual === direct ? "✓ Match" : "✗ Mismatch"}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Sum of squares = n(n+1)(2n+1)/6
// ============================================================================
function SumSquaresDemo() {
  const [n, setN] = useState(4);
  const direct = (n * (n + 1) * (2 * n + 1)) / 6;
  let manual = 0;
  for (let i = 1; i <= n; i++) manual += i * i;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">1² + 2² + … + n² = n(n+1)(2n+1)/6.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">n =</span>
        <input type="range" min={1} max={10} value={n} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-violet-500" />
        <span className="w-8 text-center text-lg font-bold text-violet-600">{n}</span>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="flex h-32 items-end justify-center gap-1">
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-slate-500">{i + 1}²</span>
              <div className="w-6 rounded-t bg-gradient-to-t from-violet-600 to-purple-400" style={{ height: `${Math.min(110, (i + 1) * (i + 1) * 1.2)}px` }} />
            </div>
          ))}
        </div>
        <div className="mt-3 text-center font-mono">
          <div className="text-slate-500">Sum = <strong>{manual}</strong></div>
          <div className="text-violet-700">{n}·({n + 1})·({2 * n + 1})/6 = <strong>{direct}</strong></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Divisibility — 7^n − 1 divisible by 6
// ============================================================================
function DivisibilityDemo() {
  const [n, setN] = useState(3);
  const value = Math.pow(7, n) - 1;
  const div6 = value / 6;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Claim: 7ⁿ − 1 is divisible by 6 for all n ≥ 1. Try it!"}</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">n =</span>
        <input type="range" min={1} max={8} value={n} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-violet-500" />
        <span className="w-8 text-center text-lg font-bold text-violet-600">{n}</span>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner text-center font-mono">
        <div>7<sup>{n}</sup> − 1 = <strong className="text-violet-700">{value.toLocaleString()}</strong></div>
        <div className="mt-1">{value} ÷ 6 = <strong className="text-emerald-700">{div6}</strong></div>
        <div className="mt-1 text-xs text-emerald-600">✓ Whole number — divisible by 6</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Step-by-step proof walker
// ============================================================================
function ProofStepsDemo() {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Claim", text: "P(n): 1+2+...+n = n(n+1)/2 for n ≥ 1" },
    { title: "Base case n=1", text: "LHS = 1. RHS = 1·2/2 = 1. ✓" },
    { title: "Assume P(k) true", text: "1+2+...+k = k(k+1)/2  (induction hypothesis)" },
    { title: "Show P(k+1)", text: "LHS = (1+...+k) + (k+1) = k(k+1)/2 + (k+1)" },
    { title: "Simplify", text: "= (k+1)(k+2)/2 — which is the RHS of P(k+1). ✓" },
    { title: "Conclusion", text: "By PMI, P(n) holds for all n ≥ 1. ∎" },
  ];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Walk through a full proof, one step at a time.</h4>
      <div className="space-y-2 rounded-2xl bg-white p-4 shadow-inner">
        {steps.map((s, i) => (
          <div key={i} className={"rounded-xl border-l-4 p-3 transition " + (i <= step ? "border-violet-500 bg-violet-50" : "border-zinc-200 bg-zinc-50 opacity-40")}>
            <div className="text-[10px] font-semibold uppercase text-violet-700">{s.title}</div>
            <div className="font-mono text-sm text-slate-800">{s.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button onClick={() => setStep(Math.max(0, step - 1))} className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow">← Back</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white">Next →</button>
      </div>
    </div>
  );
}

export default function InductionVizPremium() {
  const demos: DemoTab[] = [
    { id: "domino", title: "Dominoes", emoji: "🁢", render: () => <DominoDemo /> },
    { id: "sum", title: "Sum 1..n", emoji: "➕", render: () => <SumNDemo /> },
    { id: "sq", title: "Sum of squares", emoji: "🟪", render: () => <SumSquaresDemo /> },
    { id: "div", title: "Divisibility", emoji: "÷", render: () => <DivisibilityDemo /> },
    { id: "proof", title: "Proof walker", emoji: "📜", render: () => <ProofStepsDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-violet-50 via-purple-50 to-fuchsia-50" />;
}
