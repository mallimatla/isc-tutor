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
// Demo 1: Nernst equation
// ============================================================================
function NernstDemo() {
  const [logQ, setLogQ] = useState(0); // log of reaction quotient
  const [n, setN] = useState(2);
  const E0 = 1.1; // Daniell cell standard potential
  const E = E0 - (0.059 / n) * logQ;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Cell voltage shifts away from the standard value as the ion concentrations move away from 1 M.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 130" className="h-auto w-full">
          {/* two half cells */}
          <rect x={20} y={50} width={70} height={60} fill="#fef3c7" stroke="#94a3b8" strokeWidth={1.5} />
          <rect x={210} y={50} width={70} height={60} fill="#fde68a" stroke="#94a3b8" strokeWidth={1.5} />
          <text x={55} y={125} textAnchor="middle" fontSize="9" fill="#64748b">Zn | Zn²⁺</text>
          <text x={245} y={125} textAnchor="middle" fontSize="9" fill="#64748b">Cu²⁺ | Cu</text>
          {/* electrodes */}
          <rect x={50} y={30} width={8} height={50} fill="#64748b" />
          <rect x={242} y={30} width={8} height={50} fill="#b45309" />
          {/* wires to voltmeter */}
          <line x1={54} y1={30} x2={54} y2={18} stroke="#334155" strokeWidth={1.5} />
          <line x1={54} y1={18} x2={130} y2={18} stroke="#334155" strokeWidth={1.5} />
          <line x1={246} y1={30} x2={246} y2={18} stroke="#334155" strokeWidth={1.5} />
          <line x1={246} y1={18} x2={170} y2={18} stroke="#334155" strokeWidth={1.5} />
          {/* voltmeter */}
          <circle cx={150} cy={18} r={20} fill="#fff" stroke="#334155" strokeWidth={1.5} />
          <text x={150} y={15} textAnchor="middle" fontSize="10" fill="#dc2626" fontWeight="bold">{E.toFixed(2)}</text>
          <text x={150} y={26} textAnchor="middle" fontSize="7" fill="#64748b">volts</text>
          {/* salt bridge */}
          <path d="M90 55 Q150 40 210 55" fill="none" stroke="#22c55e" strokeWidth={3} opacity={0.6} />
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          log Q = <span className="font-bold text-amber-600">{logQ.toFixed(1)}</span> (Q = [Zn²⁺]/[Cu²⁺])
          <input type="range" min={-3} max={3} step={0.1} value={logQ} onChange={(e) => setLogQ(+e.target.value)} className="mt-1 w-full accent-amber-500" />
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        {[1, 2].map((v) => (
          <button
            key={v}
            onClick={() => setN(v)}
            className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (n === v ? "bg-slate-900 text-white" : "bg-white text-slate-600")}
          >
            n = {v}
          </button>
        ))}
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        E = E° − (0.059/n)·log Q = 1.10 − (0.059/{n})×{logQ.toFixed(1)} = <strong className="text-amber-600">{E.toFixed(3)} V</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Electrolysis and Faraday's law
// ============================================================================
function FaradayDemo() {
  const t = useClock();
  const [I, setI] = useState(2); // current in A
  const [time, setTime] = useState(1800); // seconds
  const Q = I * time;
  const molE = Q / 96500;
  const molCu = molE / 2; // Cu2+ + 2e- -> Cu
  const massCu = molCu * 63.5;
  // moving electrons animation
  const dots = 5;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Push charge through a copper solution and count the electrons to find how much copper plates out.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 110" className="h-auto w-full">
          {/* cell */}
          <rect x={40} y={40} width={220} height={55} fill="#dbeafe" stroke="#94a3b8" strokeWidth={1.5} />
          {/* electrodes */}
          <rect x={70} y={20} width={8} height={70} fill="#64748b" />
          <rect x={222} y={20} width={8} height={70} fill="#b45309" />
          <text x={74} y={104} textAnchor="middle" fontSize="8" fill="#64748b">anode</text>
          <text x={226} y={104} textAnchor="middle" fontSize="8" fill="#b45309">cathode (Cu)</text>
          {/* wire with moving electrons */}
          <line x1={74} y1={20} x2={74} y2={8} stroke="#334155" strokeWidth={1.5} />
          <line x1={74} y1={8} x2={226} y2={8} stroke="#334155" strokeWidth={1.5} />
          <line x1={226} y1={8} x2={226} y2={20} stroke="#334155" strokeWidth={1.5} />
          {Array.from({ length: dots }).map((_, i) => {
            const frac = ((t * (I / 2) + i / dots) % 1);
            const x = 74 + frac * (226 - 74);
            return <circle key={i} cx={x} cy={8} r={3} fill="#2563eb" />;
          })}
          {/* Cu2+ ions drifting to cathode */}
          {Array.from({ length: 4 }).map((_, i) => {
            const frac = ((t * (I / 2) + i / 4) % 1);
            const x = 210 - frac * 110;
            return (
              <g key={i}>
                <circle cx={x} cy={68} r={5} fill="#f59e0b" opacity={0.8} />
                <text x={x} y={71} textAnchor="middle" fontSize="6" fill="#fff">Cu²⁺</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white p-3 shadow-inner">
          <label className="text-xs font-medium text-slate-600">
            Current I = <span className="font-bold text-amber-600">{I} A</span>
            <input type="range" min={0.5} max={5} step={0.5} value={I} onChange={(e) => setI(+e.target.value)} className="mt-1 w-full accent-amber-500" />
          </label>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-inner">
          <label className="text-xs font-medium text-slate-600">
            Time t = <span className="font-bold text-amber-600">{time} s</span>
            <input type="range" min={0} max={3600} step={60} value={time} onChange={(e) => setTime(+e.target.value)} className="mt-1 w-full accent-amber-500" />
          </label>
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-orange-400 bg-white p-3 font-mono text-xs text-slate-700">
        <div>Q = I·t = {I} × {time} = <strong>{Q.toFixed(0)} C</strong></div>
        <div>mol e⁻ = Q/96500 = <strong>{molE.toFixed(4)}</strong></div>
        <div>Cu²⁺ + 2e⁻ → Cu, so mass = (mol e⁻/2)×63.5 = <strong className="text-orange-600">{massCu.toFixed(3)} g</strong></div>
      </div>
    </div>
  );
}

export default function ElectrochemistryVizPremium() {
  const demos: DemoTab[] = [
    { id: "nernst", title: "Nernst equation", emoji: "🔋", render: () => <NernstDemo /> },
    { id: "faraday", title: "Electrolysis / Faraday", emoji: "⚡", render: () => <FaradayDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-amber-50 via-yellow-50 to-orange-50" />;
}
