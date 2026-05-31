"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Truth-table builder
// ============================================================================
function TruthTableDemo() {
  const [op, setOp] = useState<"and" | "or" | "xor" | "imp" | "iff">("and");
  const evaluate = (p: boolean, q: boolean) => {
    if (op === "and") return p && q;
    if (op === "or") return p || q;
    if (op === "xor") return p !== q;
    if (op === "imp") return !p || q;
    return p === q;
  };
  const labels: Record<typeof op, string> = { and: "p ∧ q (AND)", or: "p ∨ q (OR)", xor: "p ⊕ q (XOR)", imp: "p → q (implies)", iff: "p ↔ q (iff)" };
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Pick a connective — truth table updates.</h4>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["and", "or", "xor", "imp", "iff"] as const).map((o) => (
          <button key={o} onClick={() => setOp(o)} className={"rounded-full px-3 py-1.5 text-xs font-semibold " + (op === o ? "bg-teal-600 text-white" : "bg-white text-slate-600")}>{labels[o]}</button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="grid grid-cols-3 gap-1 text-center text-xs font-mono">
          <div className="rounded bg-slate-100 p-2 font-bold">p</div>
          <div className="rounded bg-slate-100 p-2 font-bold">q</div>
          <div className="rounded bg-teal-100 p-2 font-bold text-teal-800">result</div>
          {[[true, true], [true, false], [false, true], [false, false]].map(([p, q], i) => (
            <div key={i} className="contents">
              <div className="rounded bg-blue-50 p-2">{p ? "T" : "F"}</div>
              <div className="rounded bg-blue-50 p-2">{q ? "T" : "F"}</div>
              <div className={"rounded p-2 font-bold " + (evaluate(p, q) ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>{evaluate(p, q) ? "T" : "F"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: AND / OR / NOT toggles
// ============================================================================
function ConnectivesDemo() {
  const [p, setP] = useState(true);
  const [q, setQ] = useState(false);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Toggle p and q — see all combinations light up.</h4>
      <div className="mb-3 flex justify-center gap-3">
        <button onClick={() => setP(!p)} className={"h-16 w-16 rounded-2xl text-lg font-bold transition " + (p ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-500")}>p<br/>{p ? "T" : "F"}</button>
        <button onClick={() => setQ(!q)} className={"h-16 w-16 rounded-2xl text-lg font-bold transition " + (q ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-500")}>q<br/>{q ? "T" : "F"}</button>
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-4 shadow-inner">
        {[
          { label: "¬p", val: !p },
          { label: "¬q", val: !q },
          { label: "p ∧ q", val: p && q },
          { label: "p ∨ q", val: p || q },
          { label: "p → q", val: !p || q },
          { label: "p ↔ q", val: p === q },
        ].map((row, i) => (
          <div key={i} className={"rounded-xl p-3 text-center " + (row.val ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")}>
            <div className="font-mono font-semibold">{row.label}</div>
            <div className="text-xl font-bold">{row.val ? "T" : "F"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Converse / Inverse / Contrapositive
// ============================================================================
function ContrapositiveDemo() {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Original vs converse vs contrapositive — only contrapositive is equivalent to original.</h4>
      <div className="space-y-2 rounded-2xl bg-white p-4 shadow-inner">
        <div className="rounded-xl border-l-4 border-teal-500 bg-teal-50 p-3">
          <div className="text-[10px] uppercase text-teal-700">Original</div>
          <div className="font-mono text-sm">p → q</div>
          <div className="text-xs text-slate-600">If it rains, the ground is wet.</div>
        </div>
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3">
          <div className="text-[10px] uppercase text-amber-700">Converse (NOT equivalent)</div>
          <div className="font-mono text-sm">q → p</div>
          <div className="text-xs text-slate-600">If ground is wet, then it rained. (could be a sprinkler!)</div>
        </div>
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3">
          <div className="text-[10px] uppercase text-amber-700">Inverse (NOT equivalent)</div>
          <div className="font-mono text-sm">¬p → ¬q</div>
          <div className="text-xs text-slate-600">{"If it doesn't rain, ground is not wet. (also wrong — sprinkler)"}</div>
        </div>
        <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-3">
          <div className="text-[10px] uppercase text-emerald-700">Contrapositive (equivalent ✓)</div>
          <div className="font-mono text-sm">¬q → ¬p</div>
          <div className="text-xs text-slate-600">If ground is not wet, it did not rain.</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Tautology / Contradiction checker
// ============================================================================
function TautologyDemo() {
  const [expr, setExpr] = useState<"taut" | "contra" | "cont">("taut");
  const cases = {
    taut: { name: "p ∨ ¬p", values: [true, true], desc: "Always true → Tautology", color: "emerald" },
    contra: { name: "p ∧ ¬p", values: [false, false], desc: "Always false → Contradiction", color: "rose" },
    cont: { name: "p ∨ q", values: [true, true, true, false], desc: "Sometimes true — contingent", color: "amber" },
  };
  const e = cases[expr];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Some statements are always true, always false, or it depends.</h4>
      <div className="mb-3 flex gap-2">
        {(Object.keys(cases) as (keyof typeof cases)[]).map((k) => (
          <button key={k} onClick={() => setExpr(k)} className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold " + (expr === k ? "bg-teal-600 text-white" : "bg-white text-slate-600")}>{cases[k].name}</button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="mb-2 text-center font-mono text-xl font-bold">{e.name}</div>
        <div className="flex justify-center gap-1">
          {e.values.map((v, i) => (
            <div key={i} className={"flex h-10 w-10 items-center justify-center rounded-lg font-mono font-bold " + (v ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>{v ? "T" : "F"}</div>
          ))}
        </div>
        <div className={`mt-3 rounded-xl border-l-4 p-3 text-sm border-${e.color}-500 bg-${e.color}-50 text-${e.color}-800`}>
          {e.desc}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Quantifier (∀, ∃)
// ============================================================================
function QuantifierDemo() {
  const [stmt, setStmt] = useState<"all-even" | "exists-prime" | "all-pos">("all-even");
  const stmts = {
    "all-even": { text: "∀ x ∈ {2,4,6}: x is even", val: true, expl: "Every element 2, 4, 6 is even ✓" },
    "exists-prime": { text: "∃ x ∈ {4,9,15}: x is prime", val: false, expl: "4 = 2·2, 9 = 3·3, 15 = 3·5 — none prime ✗" },
    "all-pos": { text: "∀ x ∈ ℝ: x² ≥ 0", val: true, expl: "Square of any real number is non-negative ✓" },
  };
  const s = stmts[stmt];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"∀ means 'for all', ∃ means 'there exists'."}</h4>
      <div className="mb-3 flex flex-col gap-2">
        {(Object.keys(stmts) as (keyof typeof stmts)[]).map((k) => (
          <button key={k} onClick={() => setStmt(k)} className={"rounded-full px-3 py-1.5 text-sm font-mono " + (stmt === k ? "bg-teal-600 text-white" : "bg-white text-slate-600")}>{stmts[k].text}</button>
        ))}
      </div>
      <div className={"rounded-xl border-l-4 p-3 " + (s.val ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50")}>
        <div className="font-mono text-base font-bold">{s.val ? "TRUE ✓" : "FALSE ✗"}</div>
        <div className="text-xs text-slate-600 mt-1">{s.expl}</div>
      </div>
    </div>
  );
}

export default function MathReasoningVizPremium() {
  const demos: DemoTab[] = [
    { id: "table", title: "Truth tables", emoji: "📋", render: () => <TruthTableDemo /> },
    { id: "conn", title: "Connectives", emoji: "🔗", render: () => <ConnectivesDemo /> },
    { id: "contra", title: "Contrapositive", emoji: "↔️", render: () => <ContrapositiveDemo /> },
    { id: "taut", title: "Tautology", emoji: "✅", render: () => <TautologyDemo /> },
    { id: "quant", title: "∀ / ∃", emoji: "🎯", render: () => <QuantifierDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-teal-50 via-cyan-50 to-emerald-50" />;
}
