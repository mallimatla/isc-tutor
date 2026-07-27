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
// Demo 1: Soap micelle trapping grease
// ============================================================================
function MicelleDemo() {
  const t = useClock();
  const [formed, setFormed] = useState(true);
  const N = 12;
  const cx = 150;
  const cy = 90;
  const rHead = formed ? 62 : 78;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Soap molecules surround a grease droplet: water-loving heads out, oil-loving tails in.
      </h4>
      <div className="mb-3 flex justify-center gap-2">
        <button
          onClick={() => setFormed(true)}
          className={
            "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
            (formed ? "bg-cyan-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-cyan-50")
          }
          aria-pressed={formed}
        >
          Micelle formed
        </button>
        <button
          onClick={() => setFormed(false)}
          className={
            "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
            (!formed ? "bg-cyan-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-cyan-50")
          }
          aria-pressed={!formed}
        >
          Approaching
        </button>
      </div>
      <div className="rounded-2xl bg-cyan-50 p-3 shadow-inner">
        <svg viewBox="0 0 300 180" className="h-auto w-full">
          {/* grease droplet in centre */}
          <circle cx={cx} cy={cy} r={30} fill="#facc15" opacity={0.85} />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="#78350f" fontWeight={600}>grease</text>
          {Array.from({ length: N }).map((_, i) => {
            const ang = (i / N) * Math.PI * 2 + (formed ? 0 : Math.sin(t + i) * 0.06);
            const wob = formed ? Math.sin(t * 1.5 + i) * 1.5 : 0;
            const tailInner = 34;
            const tailOuter = rHead + wob;
            const tx1 = cx + Math.cos(ang) * tailInner;
            const ty1 = cy + Math.sin(ang) * tailInner;
            const tx2 = cx + Math.cos(ang) * tailOuter;
            const ty2 = cy + Math.sin(ang) * tailOuter;
            const hx = cx + Math.cos(ang) * (tailOuter + 8);
            const hy = cy + Math.sin(ang) * (tailOuter + 8);
            return (
              <g key={i}>
                <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#64748b" strokeWidth={2} />
                <circle cx={hx} cy={hy} r={6} fill="#0891b2" />
              </g>
            );
          })}
          {/* labels */}
          <line x1={250} y1={30} x2={262} y2={22} stroke="#0891b2" strokeWidth={1} />
          <circle cx={250} cy={30} r={6} fill="#0891b2" />
          <text x={200} y={20} fontSize="9" fill="#0891b2" fontWeight={600}>ionic head (hydrophilic)</text>
          <text x={10} y={172} fontSize="9" fill="#64748b" fontWeight={600}>hydrocarbon tail (hydrophobic)</text>
        </svg>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        Head: <strong className="text-cyan-600">−COO⁻Na⁺</strong> &nbsp; Tail: <strong className="text-slate-600">C₁₇H₃₅−</strong>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-cyan-400 bg-white p-3 text-xs text-slate-600">
        The tails dissolve into the grease while the charged heads stay in the water. The whole micelle
        lifts the oil droplet off the fabric and carries it away.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Antacid neutralises stomach acid
// ============================================================================
function AntacidDemo() {
  const [dose, setDose] = useState(0);
  // dose 0..10 raises pH from ~1.5 toward 7
  const pH = 1.5 + (dose / 10) * 5.5;
  // colour bar: red (acid) → green (neutral)
  const pHColor = (p: number) => {
    if (p < 3) return "#dc2626";
    if (p < 4.5) return "#f97316";
    if (p < 6) return "#eab308";
    return "#16a34a";
  };
  const markerX = (p: number) => 10 + (p / 14) * 280;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        An antacid neutralises excess stomach acid. Increase the dose and watch the pH climb.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 90" className="h-auto w-full">
          <defs>
            <linearGradient id="phbar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="55%" stopColor="#16a34a" />
              <stop offset="75%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect x={10} y={30} width={280} height={20} rx={6} fill="url(#phbar)" />
          {[0, 7, 14].map((p) => (
            <text key={p} x={markerX(p)} y={68} textAnchor="middle" fontSize="9" fill="#64748b">
              pH {p}
            </text>
          ))}
          {/* moving marker */}
          <g transform={`translate(${markerX(pH)},0)`}>
            <polygon points="0,26 -6,14 6,14" fill={pHColor(pH)} />
            <text x={0} y={12} textAnchor="middle" fontSize="11" fill={pHColor(pH)} fontWeight={700}>
              {pH.toFixed(1)}
            </text>
          </g>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Antacid dose: <span className="font-bold text-cyan-600">{dose}</span>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={dose}
            onChange={(e) => setDose(+e.target.value)}
            className="mt-1 w-full accent-cyan-500"
          />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        Mg(OH)₂ + 2 HCl → MgCl₂ + 2 H₂O
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-cyan-400 bg-white p-3 text-xs text-slate-600">
        {pH < 3
          ? "The stomach is strongly acidic (pH about 1.5). The hydroxide base reacts with HCl."
          : pH < 6
          ? "As base neutralises the acid, H⁺ ions are consumed and the pH rises toward neutral."
          : "Enough antacid has been added — the pH is close to neutral (7). Salt and water are the products."}
      </div>
    </div>
  );
}

export default function EverydayChemistryVizPremium() {
  const demos: DemoTab[] = [
    { id: "micelle", title: "Soap micelle", emoji: "🧼", render: () => <MicelleDemo /> },
    { id: "antacid", title: "Antacid neutralises acid", emoji: "💊", render: () => <AntacidDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-cyan-50 via-sky-50 to-blue-50" />;
}
