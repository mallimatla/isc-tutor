"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: arcsin / arccos / arctan grapher
// ============================================================================
function InverseGraphDemo() {
  const [fn, setFn] = useState<"asin" | "acos" | "atan">("asin");
  const toX = (x: number) => 40 + (x + 2) * 80;
  const toY = (y: number) => 130 - y * 40;
  const pts: string[] = [];
  if (fn === "asin") for (let x = -1; x <= 1; x += 0.02) pts.push(`${pts.length === 0 ? "M" : "L"}${toX(x)},${toY(Math.asin(x))}`);
  else if (fn === "acos") for (let x = -1; x <= 1; x += 0.02) pts.push(`${pts.length === 0 ? "M" : "L"}${toX(x)},${toY(Math.acos(x))}`);
  else for (let x = -3; x <= 3; x += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${toX(x)},${toY(Math.atan(x))}`);
  const domain = fn === "atan" ? "ℝ (all reals)" : "[-1, 1]";
  const range = fn === "asin" ? "[-π/2, π/2]" : fn === "acos" ? "[0, π]" : "(-π/2, π/2)";
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Each inverse trig has a principal range — pick one to see it.</h4>
      <div className="mb-3 flex gap-2">
        {(["asin", "acos", "atan"] as const).map((f) => (
          <button key={f} onClick={() => setFn(f)} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold " + (fn === f ? "bg-amber-600 text-white" : "bg-white text-slate-600")}>{f === "asin" ? "sin⁻¹" : f === "acos" ? "cos⁻¹" : "tan⁻¹"}</button>
        ))}
      </div>
      <svg viewBox="0 0 400 260" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1="130" x2="360" y2="130" stroke="#cbd5e1" />
        <line x1="200" y1="20" x2="200" y2="240" stroke="#cbd5e1" />
        <path d={pts.join(" ")} fill="none" stroke="#f59e0b" strokeWidth="3" />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-amber-50 p-3 text-center"><div className="text-[10px] uppercase text-amber-700">Domain</div><div className="font-mono text-sm font-bold text-amber-800">{domain}</div></div>
        <div className="rounded-xl bg-orange-50 p-3 text-center"><div className="text-[10px] uppercase text-orange-700">Range</div><div className="font-mono text-sm font-bold text-orange-800">{range}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Principal value calculator
// ============================================================================
function PrincipalValueDemo() {
  const [x, setX] = useState(0.5);
  const asin = Math.asin(x);
  const acos = Math.acos(x);
  const atan = Math.atan(x);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Slide x to see principal values for each inverse function.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">x = {x.toFixed(2)}</span>
        <input type="range" min={-1} max={1} step={0.05} value={x} onChange={(e) => setX(parseFloat(e.target.value))} className="flex-1 accent-amber-500" />
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner space-y-2 font-mono text-sm">
        <div className="rounded-lg bg-amber-50 p-2 flex justify-between"><span>sin⁻¹({x.toFixed(2)})</span><span className="font-bold text-amber-700">{asin.toFixed(3)} rad = {((asin * 180) / Math.PI).toFixed(1)}°</span></div>
        <div className="rounded-lg bg-orange-50 p-2 flex justify-between"><span>cos⁻¹({x.toFixed(2)})</span><span className="font-bold text-orange-700">{acos.toFixed(3)} rad = {((acos * 180) / Math.PI).toFixed(1)}°</span></div>
        <div className="rounded-lg bg-yellow-50 p-2 flex justify-between"><span>tan⁻¹({x.toFixed(2)})</span><span className="font-bold text-yellow-700">{atan.toFixed(3)} rad = {((atan * 180) / Math.PI).toFixed(1)}°</span></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Identities — sin(sin⁻¹ x) = x
// ============================================================================
function IdentitiesDemo() {
  const [x, setX] = useState(0.7);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"sin and sin⁻¹ undo each other (within their ranges)."}</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">x = {x.toFixed(2)}</span>
        <input type="range" min={-1} max={1} step={0.05} value={x} onChange={(e) => setX(parseFloat(e.target.value))} className="flex-1 accent-amber-500" />
      </div>
      <svg viewBox="0 0 420 130" className="w-full rounded-2xl bg-white shadow-inner">
        <rect x="20" y="50" width="60" height="40" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
        <text x="50" y="75" textAnchor="middle" fontSize="13" fontWeight="700" fill="#92400e">{x.toFixed(2)}</text>
        <path d="M 80 70 L 140 70" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#invArr2)" />
        <text x="110" y="60" textAnchor="middle" fontSize="11" fill="#b45309">sin⁻¹</text>
        <rect x="140" y="50" width="80" height="40" rx="8" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
        <text x="180" y="75" textAnchor="middle" fontSize="12" fontWeight="700" fill="#92400e">{Math.asin(x).toFixed(2)} rad</text>
        <path d="M 220 70 L 280 70" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#invArr2)" />
        <text x="250" y="60" textAnchor="middle" fontSize="11" fill="#b45309">sin</text>
        <rect x="280" y="50" width="60" height="40" rx="8" fill="#fef3c7" stroke="#10b981" strokeWidth="2" />
        <text x="310" y="75" textAnchor="middle" fontSize="13" fontWeight="700" fill="#065f46">{Math.sin(Math.asin(x)).toFixed(2)}</text>
        <defs><marker id="invArr2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 Z" fill="#f59e0b" /></marker></defs>
      </svg>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm font-mono">
        sin(sin⁻¹({x.toFixed(2)})) = <strong>{x.toFixed(2)}</strong> ✓
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: sin⁻¹ + cos⁻¹ = π/2
// ============================================================================
function ComplementaryDemo() {
  const [x, setX] = useState(0.5);
  const a = Math.asin(x);
  const c = Math.acos(x);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">sin⁻¹ x + cos⁻¹ x = π/2 for all x in [-1, 1].</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">x = {x.toFixed(2)}</span>
        <input type="range" min={-1} max={1} step={0.05} value={x} onChange={(e) => setX(parseFloat(e.target.value))} className="flex-1 accent-amber-500" />
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="mb-2 text-[10px] uppercase text-slate-500">Bar shows π/2 ≈ 1.571 split into the two pieces</div>
        <div className="flex h-12 overflow-hidden rounded-xl">
          <div className="flex items-center justify-center bg-amber-500 font-mono text-xs font-bold text-white transition-all" style={{ width: `${(a / (Math.PI / 2)) * 100}%` }}>{a.toFixed(2)}</div>
          <div className="flex items-center justify-center bg-orange-500 font-mono text-xs font-bold text-white transition-all" style={{ width: `${(c / (Math.PI / 2)) * 100}%` }}>{c.toFixed(2)}</div>
        </div>
        <div className="mt-3 text-center font-mono">
          {a.toFixed(3)} + {c.toFixed(3)} = <strong className="text-amber-700">{(a + c).toFixed(3)}</strong> = π/2 ✓
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Domain restriction warning
// ============================================================================
function RestrictionDemo() {
  const [x, setX] = useState(0.8);
  const inDomain = x >= -1 && x <= 1;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"sin⁻¹ and cos⁻¹ only accept inputs in [-1, 1]."}</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">x = {x.toFixed(2)}</span>
        <input type="range" min={-2} max={2} step={0.05} value={x} onChange={(e) => setX(parseFloat(e.target.value))} className="flex-1 accent-amber-500" />
      </div>
      <svg viewBox="0 0 400 100" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1="50" x2="380" y2="50" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="120" y="40" width="160" height="20" fill="#34d399" fillOpacity="0.4" />
        <text x="120" y="78" fontSize="11" fill="#065f46">-1</text>
        <text x="280" y="78" fontSize="11" fill="#065f46">1</text>
        <circle cx={200 + x * 80} cy="50" r="10" fill={inDomain ? "#10b981" : "#ef4444"} stroke="white" strokeWidth="2" />
      </svg>
      <div className={"mt-3 rounded-xl border-l-4 p-3 text-sm " + (inDomain ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-rose-500 bg-rose-50 text-rose-800")}>
        {inDomain ? `✓ sin⁻¹(${x.toFixed(2)}) = ${Math.asin(x).toFixed(3)}` : `❌ ${x.toFixed(2)} is outside [-1, 1] — sin⁻¹ undefined`}
      </div>
    </div>
  );
}

export default function InverseTrigVizPremium() {
  const demos: DemoTab[] = [
    { id: "graph", title: "Graphs", emoji: "📈", render: () => <InverseGraphDemo /> },
    { id: "pv", title: "Principal value", emoji: "🎯", render: () => <PrincipalValueDemo /> },
    { id: "id", title: "Identity sin∘sin⁻¹", emoji: "🔄", render: () => <IdentitiesDemo /> },
    { id: "comp", title: "sin⁻¹+cos⁻¹=π/2", emoji: "➕", render: () => <ComplementaryDemo /> },
    { id: "rest", title: "Domain", emoji: "⚠️", render: () => <RestrictionDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-amber-50 via-yellow-50 to-orange-50" />;
}
