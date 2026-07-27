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
// Demo 1: Bohr orbits
// ============================================================================
function BohrDemo() {
  const t = useClock();
  const [n, setN] = useState(1);
  const energy = -13.6 / (n * n); // eV
  const radiusA = 0.529 * n * n; // Å
  const cx = 110,
    cy = 110;
  const orbitR = 14 + n * n * 3.2; // px, ∝ n²
  const speed = 1.4 / (n * n); // inner orbits faster
  const angle = t * speed * Math.PI * 2;
  const ex = cx + orbitR * Math.cos(angle);
  const ey = cy + orbitR * Math.sin(angle);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        In the Bohr model electrons sit in fixed orbits. Higher n means bigger orbit and higher energy.
      </h4>
      <div className="flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 220 220" className="h-48 w-48">
          {[1, 2, 3, 4, 5].map((k) => (
            <circle key={k} cx={cx} cy={cy} r={14 + k * k * 3.2} fill="none" stroke={k === n ? "#6366f1" : "#e2e8f0"} strokeWidth={k === n ? 2 : 1} />
          ))}
          <circle cx={cx} cy={cy} r={9} fill="#4338ca" />
          <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">+</text>
          <circle cx={ex} cy={ey} r={5} fill="#8b5cf6" />
          <text x={cx} y={cy - orbitR - 4} textAnchor="middle" fontSize="9" fill="#6366f1" fontWeight="bold">n={n}</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Principal quantum number n = <span className="font-bold text-indigo-600">{n}</span>
          <input type="range" min={1} max={5} step={1} value={n} onChange={(e) => setN(+e.target.value)} className="mt-1 w-full accent-indigo-500" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-indigo-50 p-2">
          <div className="text-[10px] text-slate-500">Energy Eₙ = −13.6/n²</div>
          <div className="text-base font-bold text-indigo-600">{energy.toFixed(2)} eV</div>
        </div>
        <div className="rounded-xl bg-violet-50 p-2">
          <div className="text-[10px] text-slate-500">Radius rₙ = 0.529×n²</div>
          <div className="text-base font-bold text-violet-600">{radiusA.toFixed(3)} Å</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Aufbau filling
// ============================================================================
const ORBITALS = [
  { name: "1s", cap: 2 },
  { name: "2s", cap: 2 },
  { name: "2p", cap: 6 },
  { name: "3s", cap: 2 },
  { name: "3p", cap: 6 },
  { name: "4s", cap: 2 },
];
const SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

function AufbauDemo() {
  const [z, setZ] = useState(11);
  const capsBefore = ORBITALS.map((_, i) => ORBITALS.slice(0, i).reduce((s, o) => s + o.cap, 0));
  const filled = ORBITALS.map((o, i) => ({
    ...o,
    electrons: Math.max(0, Math.min(o.cap, z - capsBefore[i])),
  }));
  const config = filled.filter((o) => o.electrons > 0).map((o) => `${o.name}${SUP[o.electrons]}`).join(" ");

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Electrons fill the lowest-energy orbitals first: 1s 2s 2p 3s 3p 4s (the Aufbau order).
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex flex-wrap items-end justify-center gap-2">
          {filled.map((o) => (
            <div key={o.name} className="flex flex-col items-center">
              <div className="flex gap-0.5">
                {Array.from({ length: o.cap / 2 }, (_, box) => {
                  const e1 = o.electrons > box * 2;
                  const e2 = o.electrons > box * 2 + 1;
                  return (
                    <div key={box} className="flex h-6 w-5 items-center justify-center rounded border border-slate-300 bg-slate-50 text-[10px]">
                      <span className={e1 ? "text-indigo-600" : "text-transparent"}>↑</span>
                      <span className={e2 ? "text-indigo-600" : "text-transparent"}>↓</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-0.5 text-[10px] font-semibold text-slate-500">{o.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Atomic number Z = <span className="font-bold text-indigo-600">{z}</span>
          <input type="range" min={1} max={20} step={1} value={z} onChange={(e) => setZ(+e.target.value)} className="mt-1 w-full accent-indigo-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-indigo-400 bg-white p-3 text-center font-mono text-sm text-slate-700">
        {config}
      </div>
    </div>
  );
}

export default function StructureOfAtomVizPremium() {
  const demos: DemoTab[] = [
    { id: "bohr", title: "Bohr orbits", emoji: "⚛️", render: () => <BohrDemo /> },
    { id: "aufbau", title: "Aufbau filling", emoji: "🪜", render: () => <AufbauDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-indigo-50 via-violet-50 to-purple-50" />;
}
