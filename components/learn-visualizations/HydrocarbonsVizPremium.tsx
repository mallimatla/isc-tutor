"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

const SUBS = "₀₁₂₃₄₅₆₇₈₉";
function subscript(x: number): string {
  return String(x)
    .split("")
    .map((d) => SUBS[+d])
    .join("");
}

// ============================================================================
// Demo 1: Markovnikov addition of HBr to propene
// ============================================================================
function MarkovnikovDemo() {
  const [peroxide, setPeroxide] = useState(false);
  // Markovnikov: H to CH2 end, Br to central C -> 2-bromopropane
  // Anti-Markovnikov (peroxide): Br to CH2 end -> 1-bromopropane
  const product = peroxide ? "1-bromopropane" : "2-bromopropane";
  const formula = peroxide ? "CH₃-CH₂-CH₂Br" : "CH₃-CHBr-CH₃";
  const brX = peroxide ? 250 : 165;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Where does the Br go? The rule: H joins the double-bond carbon that already has more hydrogens.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 130" className="h-auto w-full">
          {/* propene skeleton: CH3 - CH = CH2 */}
          <text x={40} y={60} textAnchor="middle" fontSize="13" fill="#334155" fontWeight="bold">CH₃</text>
          <line x1={62} y1={56} x2={92} y2={56} stroke="#94a3b8" strokeWidth={2} />
          <text x={110} y={60} textAnchor="middle" fontSize="13" fill="#334155" fontWeight="bold">CH</text>
          {/* double bond */}
          <line x1={128} y1={52} x2={158} y2={52} stroke="#ea580c" strokeWidth={2} />
          <line x1={128} y1={60} x2={158} y2={60} stroke="#ea580c" strokeWidth={2} />
          <text x={178} y={60} textAnchor="middle" fontSize="13" fill="#334155" fontWeight="bold">CH₂</text>
          {/* incoming HBr */}
          <text x={110} y={110} textAnchor="middle" fontSize="11" fill="#0369a1">H adds here {peroxide ? "" : "→ 2°"}</text>
          <circle cx={brX} cy={90} r={12} fill="#ea580c" opacity={0.85} />
          <text x={brX} y={94} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">Br</text>
          <line x1={brX} y1={78} x2={peroxide ? 180 : 110} y2={68} stroke="#ea580c" strokeWidth={1.5} strokeDasharray="3 3" />
        </svg>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setPeroxide(false)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (!peroxide ? "bg-slate-900 text-white" : "bg-white text-slate-600")}
        >
          HBr only (Markovnikov)
        </button>
        <button
          onClick={() => setPeroxide(true)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (peroxide ? "bg-slate-900 text-white" : "bg-white text-slate-600")}
        >
          HBr + peroxide (anti)
        </button>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-orange-400 bg-white p-3 text-xs text-slate-600">
        <div className="font-mono text-sm text-slate-800">CH₃-CH=CH₂ + HBr → {formula}</div>
        <div className="mt-1">
          Major product: <strong className="text-orange-600">{product}</strong>.{" "}
          {peroxide
            ? "With peroxide the reaction is a radical chain, so Br adds to the terminal carbon (Kharasch effect)."
            : "The proton adds to the CH₂ end, giving the more stable secondary carbocation, so Br ends up on the middle carbon."}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Combustion balancer for alkanes
// ============================================================================
function CombustionDemo() {
  const [n, setN] = useState(1);
  const names = ["", "methane", "ethane", "propane", "butane", "pentane"];
  // 2 CnH(2n+2) + (3n+1) O2 -> 2n CO2 + (2n+2) H2O, then reduce by gcd
  let a = 2,
    b = 3 * n + 1,
    c = 2 * n,
    d = 2 * n + 2;
  const g = gcd(gcd(a, b), gcd(c, d));
  a /= g;
  b /= g;
  c /= g;
  d /= g;
  const co = (x: number) => (x === 1 ? "" : x);
  const alkane = `C${n === 1 ? "" : subscript(n)}H${subscript(2 * n + 2)}`;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Pick an alkane and watch the coefficients balance so every atom is conserved.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner text-center">
        <div className="font-mono text-base text-slate-800">
          {co(a)}
          {alkane} + {co(b)}O₂ → {co(c)}CO₂ + {co(d)}H₂O
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
          <div className="rounded-lg bg-orange-50 p-2">
            C: <strong>{a * n}</strong> = <strong>{c}</strong>
          </div>
          <div className="rounded-lg bg-orange-50 p-2">
            H: <strong>{a * (2 * n + 2)}</strong> = <strong>{d * 2}</strong>
          </div>
          <div className="rounded-lg bg-orange-50 p-2">
            O: <strong>{b * 2}</strong> = <strong>{c * 2 + d}</strong>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Carbon number n = <span className="font-bold text-orange-600">{n}</span> ({names[n]}, {alkane})
          <input type="range" min={1} max={5} step={1} value={n} onChange={(e) => setN(+e.target.value)} className="mt-1 w-full accent-orange-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-amber-400 bg-white p-3 text-xs text-slate-600">
        General form: CₙH₂ₙ₊₂ + (3n+1)/2 O₂ → n CO₂ + (n+1) H₂O. When that gives a fraction the whole equation is doubled to keep whole-number coefficients.
      </div>
    </div>
  );
}

export default function HydrocarbonsVizPremium() {
  const demos: DemoTab[] = [
    { id: "markovnikov", title: "Markovnikov addition", emoji: "➕", render: () => <MarkovnikovDemo /> },
    { id: "combustion", title: "Combustion balancer", emoji: "🔥", render: () => <CombustionDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-orange-50 via-amber-50 to-yellow-50" />;
}
