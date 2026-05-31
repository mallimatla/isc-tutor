"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Reflexive / Symmetric / Transitive checker
// ============================================================================
function RelationPropsDemo() {
  const [type, setType] = useState<"r" | "s" | "t" | "e">("e");
  const types = {
    r: { name: "Reflexive only", pairs: [[1, 1], [2, 2], [3, 3], [1, 2]], desc: "Every a~a holds, but not symmetric." },
    s: { name: "Symmetric only", pairs: [[1, 2], [2, 1], [2, 3], [3, 2]], desc: "a~b ⇒ b~a, but no a~a." },
    t: { name: "Transitive only", pairs: [[1, 2], [2, 3], [1, 3]], desc: "a~b & b~c ⇒ a~c." },
    e: { name: "Equivalence", pairs: [[1, 1], [2, 2], [3, 3], [1, 2], [2, 1]], desc: "All three: refl + sym + trans." },
  };
  const t = types[type];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Click a type to see example pairs.</h4>
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(types) as (keyof typeof types)[]).map((k) => (
          <button key={k} onClick={() => setType(k)} className={"rounded-full px-3 py-1.5 text-xs font-semibold " + (type === k ? "bg-emerald-600 text-white" : "bg-white text-slate-600")}>{types[k].name}</button>
        ))}
      </div>
      <svg viewBox="0 0 300 250" className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-inner">
        {[1, 2, 3].map((n, i) => (
          <g key={n}>
            <circle cx={150} cy={50 + i * 80} r="20" fill="#d1fae5" stroke="#10b981" strokeWidth="2" />
            <text x={150} y={56 + i * 80} textAnchor="middle" fontSize="16" fontWeight="700" fill="#065f46">{n}</text>
          </g>
        ))}
        {t.pairs.map(([a, b], i) => {
          if (a === b) {
            const cy = 30 + (a - 1) * 80;
            return <path key={i} d={`M ${130} ${cy} A 15 15 0 1 1 ${131} ${cy}`} fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#relArr)" />;
          }
          const y1 = 50 + (a - 1) * 80;
          const y2 = 50 + (b - 1) * 80;
          const ox = 150 + (b > a ? 30 : -30);
          return <path key={i} d={`M ${150 + (a < b ? 18 : -18)} ${y1} Q ${ox} ${(y1 + y2) / 2} ${150 + (a < b ? 18 : -18)} ${y2}`} fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#relArr)" />;
        })}
        <defs><marker id="relArr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 Z" fill="#10b981" /></marker></defs>
      </svg>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-500 bg-white p-3 text-sm">
        {t.desc}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Composition (f ∘ g)(x)
// ============================================================================
function CompositionDemo() {
  const [x, setX] = useState(2);
  const g = (n: number) => n + 1;
  const f = (n: number) => n * n;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">(f ∘ g)(x) = f(g(x)). Order matters!</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <input type="range" min={0} max={5} value={x} onChange={(e) => setX(parseInt(e.target.value))} className="flex-1 accent-emerald-500" />
        <span className="w-12 text-center font-mono">x = {x}</span>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner space-y-2 text-center font-mono">
        <div>g(x) = x + 1 = <strong className="text-emerald-700">{g(x)}</strong></div>
        <div>f(g(x)) = (x+1)² = <strong className="text-emerald-700">{f(g(x))}</strong></div>
        <div>f(x) = x² = <strong className="text-teal-700">{f(x)}</strong></div>
        <div>g(f(x)) = x² + 1 = <strong className="text-teal-700">{g(f(x))}</strong></div>
        <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-2 text-xs text-amber-800">{f(g(x)) === g(f(x)) ? "Same result here, but in general (f∘g) ≠ (g∘f)." : `f∘g (${f(g(x))}) ≠ g∘f (${g(f(x))}) — order matters!`}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Invertible function (one-to-one + onto)
// ============================================================================
function InverseDemo() {
  const [x, setX] = useState(2);
  // f(x) = 2x + 1, f⁻¹(y) = (y-1)/2
  const fx = 2 * x + 1;
  const inv = (fx - 1) / 2;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{'f(x) = 2x + 1. f⁻¹ "undoes" f.'}</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <input type="range" min={-3} max={5} value={x} onChange={(e) => setX(parseInt(e.target.value))} className="flex-1 accent-emerald-500" />
        <span className="w-12 text-center font-mono">x = {x}</span>
      </div>
      <svg viewBox="0 0 400 160" className="w-full rounded-2xl bg-white shadow-inner">
        <rect x="30" y="60" width="80" height="40" rx="8" fill="#d1fae5" stroke="#10b981" strokeWidth="2" />
        <text x="70" y="85" textAnchor="middle" fontSize="14" fontWeight="700" fill="#065f46">{x}</text>
        <path d="M 110 80 L 170 80" stroke="#10b981" strokeWidth="2" markerEnd="url(#invA1)" />
        <text x="140" y="70" textAnchor="middle" fontSize="11" fill="#0f766e">f</text>
        <rect x="170" y="60" width="80" height="40" rx="8" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
        <text x="210" y="85" textAnchor="middle" fontSize="14" fontWeight="700" fill="#065f46">{fx}</text>
        <path d="M 250 80 L 310 80" stroke="#10b981" strokeWidth="2" markerEnd="url(#invA1)" />
        <text x="280" y="70" textAnchor="middle" fontSize="11" fill="#0f766e">f⁻¹</text>
        <rect x="310" y="60" width="60" height="40" rx="8" fill="#d1fae5" stroke="#10b981" strokeWidth="2" />
        <text x="340" y="85" textAnchor="middle" fontSize="14" fontWeight="700" fill="#065f46">{inv}</text>
        <defs><marker id="invA1" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 Z" fill="#10b981" /></marker></defs>
      </svg>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm font-mono">
        f⁻¹(f(x)) = {inv} = x ✓
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Binary operation
// ============================================================================
function BinaryOpDemo() {
  const [op, setOp] = useState<"add" | "mul" | "max">("add");
  const operate = (a: number, b: number) => op === "add" ? a + b : op === "mul" ? a * b : Math.max(a, b);
  const symbol = op === "add" ? "+" : op === "mul" ? "·" : "max";
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">A binary operation maps (a, b) → result. Closed if result stays in the set.</h4>
      <div className="mb-3 flex gap-2">
        {(["add", "mul", "max"] as const).map((o) => (
          <button key={o} onClick={() => setOp(o)} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold " + (op === o ? "bg-emerald-600 text-white" : "bg-white text-slate-600")}>{o}</button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="text-xs uppercase text-slate-500 mb-2">Cayley table on {"{1,2,3}"}</div>
        <div className="grid grid-cols-4 gap-1 text-center font-mono text-sm">
          <div className="rounded bg-slate-100 p-2 font-bold">{symbol}</div>
          {[1, 2, 3].map((n) => (<div key={n} className="rounded bg-emerald-100 p-2 font-bold text-emerald-800">{n}</div>))}
          {[1, 2, 3].map((a) => (
            <div key={a} className="contents">
              <div className="rounded bg-emerald-100 p-2 font-bold text-emerald-800">{a}</div>
              {[1, 2, 3].map((b) => (<div key={b} className="rounded bg-emerald-50 p-2 font-bold text-emerald-700">{operate(a, b)}</div>))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Equivalence classes
// ============================================================================
function EquivClassDemo() {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"R: a~b iff a−b is a multiple of 3. Partitions integers into 3 classes."}</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner space-y-2">
        {[
          { label: "[0]", color: "blue", nums: [-6, -3, 0, 3, 6, 9, 12] },
          { label: "[1]", color: "emerald", nums: [-5, -2, 1, 4, 7, 10, 13] },
          { label: "[2]", color: "amber", nums: [-4, -1, 2, 5, 8, 11, 14] },
        ].map((c) => (
          <div key={c.label} className={"rounded-xl bg-" + c.color + "-50 p-3"}>
            <div className={"text-[10px] uppercase font-bold text-" + c.color + "-700"}>{c.label} = numbers ≡ {c.label.slice(1, -1)} (mod 3)</div>
            <div className="flex flex-wrap gap-1 mt-1">{c.nums.map((n, i) => (<span key={i} className={"rounded bg-white px-2 py-1 font-mono text-xs text-" + c.color + "-800"}>{n}</span>))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RelationsFunctions12VizPremium() {
  const demos: DemoTab[] = [
    { id: "props", title: "Refl/Sym/Trans", emoji: "🔁", render: () => <RelationPropsDemo /> },
    { id: "comp", title: "Composition", emoji: "🔗", render: () => <CompositionDemo /> },
    { id: "inv", title: "Inverse", emoji: "↩️", render: () => <InverseDemo /> },
    { id: "binop", title: "Binary op", emoji: "✖️", render: () => <BinaryOpDemo /> },
    { id: "equiv", title: "Equiv. classes", emoji: "🧩", render: () => <EquivClassDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-emerald-50 via-teal-50 to-green-50" />;
}
