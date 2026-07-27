"use client";
import { useState, useEffect, useRef } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

function useClock() {
  const [t, setT] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      if (start.current === null) start.current = now;
      setT((now - start.current) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

// ============================================================================
// Demo 1: Oxidation number of the highlighted atom
// ============================================================================
type CompoundKey = "H2O" | "NH3" | "H2SO4" | "KMnO4" | "CO2";

const COMPOUNDS: Record<CompoundKey, { formula: string; atom: string; ox: string; rule: string }> = {
  H2O: { formula: "H₂O", atom: "O", ox: "−2", rule: "H is +1 (×2 = +2); molecule is neutral, so O = −2." },
  NH3: { formula: "NH₃", atom: "N", ox: "−3", rule: "H is +1 (×3 = +3); molecule is neutral, so N = −3." },
  H2SO4: { formula: "H₂SO₄", atom: "S", ox: "+6", rule: "H = +1 (×2 = +2), O = −2 (×4 = −8); sum 0 gives S = +6." },
  KMnO4: { formula: "KMnO₄", atom: "Mn", ox: "+7", rule: "K = +1, O = −2 (×4 = −8); sum 0 gives Mn = +7." },
  CO2: { formula: "CO₂", atom: "C", ox: "+4", rule: "O = −2 (×2 = −4); molecule is neutral, so C = +4." },
};

function OxidationNumberDemo() {
  const [key, setKey] = useState<CompoundKey>("H2SO4");
  const c = COMPOUNDS[key];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Oxidation numbers track electron bookkeeping. Assign the known atoms first, then solve for the rest.
      </h4>
      <div className="flex flex-wrap justify-center gap-2">
        {(Object.keys(COMPOUNDS) as CompoundKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setKey(k)}
            className={
              "rounded-full px-3 py-1.5 text-sm font-semibold transition " +
              (k === key ? "bg-violet-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-violet-50")
            }
            aria-pressed={k === key}
          >
            {COMPOUNDS[k].formula}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow-inner">
        <div className="font-mono text-3xl text-slate-800">{c.formula}</div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2">
          <span className="text-sm text-slate-600">oxidation number of</span>
          <span className="text-lg font-bold text-violet-700">{c.atom}</span>
          <span className="text-sm text-slate-600">=</span>
          <span className="text-2xl font-extrabold text-violet-700">{c.ox}</span>
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-violet-400 bg-white p-3 text-xs text-slate-600">
        <span className="font-semibold text-violet-700">Rule: </span>{c.rule}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Daniell galvanic cell — electron flow anode → cathode
// ============================================================================
function GalvanicCellDemo() {
  const t = useClock();
  const W = 320,
    H = 200;
  // wire path from anode top (60,50) across to cathode top (260,50)
  const nDots = 5;
  const dots = Array.from({ length: nDots }, (_, i) => {
    const u = ((t * 0.4 + i / nDots) % 1);
    return 60 + u * 200; // x along the top wire
  });
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        In the Daniell cell zinc gives up electrons; they travel through the wire to copper. Electrons flow anode → cathode.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* wire */}
          <polyline points="60,50 60,30 260,30 260,50" fill="none" stroke="#64748b" strokeWidth={2.5} />
          {/* salt bridge */}
          <path d="M 90 90 Q 160 40 230 90" fill="none" stroke="#a78bfa" strokeWidth={10} strokeLinecap="round" opacity={0.5} />
          <text x={160} y={58} textAnchor="middle" fontSize="9" fill="#7c3aed">salt bridge</text>
          {/* electrons on wire */}
          {dots.map((x, i) => (
            <circle key={i} cx={x} cy={30} r={4} fill="#7c3aed">
              <title>e⁻</title>
            </circle>
          ))}
          {/* left beaker (anode, Zn) */}
          <rect x={40} y={90} width={80} height={90} rx={4} fill="#f5f3ff" stroke="#94a3b8" strokeWidth={1.5} />
          <rect x={72} y={60} width={16} height={110} fill="#94a3b8" />
          <text x={80} y={195} textAnchor="middle" fontSize="10" fill="#334155">Zn</text>
          <text x={80} y={80} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#dc2626">−</text>
          {/* right beaker (cathode, Cu) */}
          <rect x={200} y={90} width={80} height={90} rx={4} fill="#fef2f2" stroke="#94a3b8" strokeWidth={1.5} />
          <rect x={232} y={60} width={16} height={110} fill="#b45309" />
          <text x={240} y={195} textAnchor="middle" fontSize="10" fill="#334155">Cu</text>
          <text x={240} y={80} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#16a34a">+</text>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border-l-4 border-red-400 bg-white p-3 text-xs text-slate-600">
          <div className="font-semibold text-red-600">Anode (oxidation)</div>
          <div className="mt-1 font-mono">Zn → Zn²⁺ + 2e⁻</div>
        </div>
        <div className="rounded-xl border-l-4 border-green-400 bg-white p-3 text-xs text-slate-600">
          <div className="font-semibold text-green-600">Cathode (reduction)</div>
          <div className="mt-1 font-mono">Cu²⁺ + 2e⁻ → Cu</div>
        </div>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        Zn | Zn²⁺ || Cu²⁺ | Cu &nbsp; standard EMF ≈ <strong className="text-violet-600">1.10 V</strong>
      </div>
    </div>
  );
}

export default function RedoxReactionsVizPremium() {
  const demos: DemoTab[] = [
    { id: "oxnum", title: "Oxidation number", emoji: "🔢", render: () => <OxidationNumberDemo /> },
    { id: "cell", title: "Galvanic cell", emoji: "🔋", render: () => <GalvanicCellDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-violet-50 via-purple-50 to-fuchsia-50" />;
}
