"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Diode — one-way valve
// ============================================================================
function DiodeDemo() {
  const [forward, setForward] = useState(true);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        A diode is a one-way valve for current: it conducts one way and blocks the other.
      </h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <svg viewBox="0 0 260 80" className="h-auto w-full">
          <line x1={10} y1={40} x2={100} y2={40} stroke={forward ? "#16a34a" : "#cbd5e1"} strokeWidth={2.5} />
          <polygon points="100,25 100,55 130,40" fill={forward ? "#16a34a" : "#94a3b8"} />
          <line x1={130} y1={25} x2={130} y2={55} stroke={forward ? "#16a34a" : "#94a3b8"} strokeWidth={3} />
          <line x1={130} y1={40} x2={220} y2={40} stroke={forward ? "#16a34a" : "#cbd5e1"} strokeWidth={2.5} />
          {forward &&
            [0, 1, 2].map((i) => <circle key={i} cx={30 + i * 60} cy={40} r={3} fill="#16a34a" />)}
          <text x={30} y={70} fontSize="9" fill="#64748b">{forward ? "+ →" : "−"}</text>
          <text x={210} y={70} fontSize="9" fill="#64748b">{forward ? "−" : "+"}</text>
        </svg>
      </div>
      <div className="mt-3 flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <button onClick={() => setForward((v) => !v)} className="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white">
          Flip the battery
        </button>
      </div>
      <div className={"mt-3 rounded-xl border-l-4 bg-white p-3 text-sm font-semibold " + (forward ? "border-emerald-500 text-emerald-700" : "border-rose-500 text-rose-700")}>
        {forward ? "Forward bias → current flows (depletion layer thin)." : "Reverse bias → blocked (depletion layer wide)."}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Logic gates
// ============================================================================
const GATES: Record<string, { fn: (a: boolean, b: boolean) => boolean; unary?: boolean }> = {
  AND: { fn: (a, b) => a && b },
  OR: { fn: (a, b) => a || b },
  NOT: { fn: (a) => !a, unary: true },
  NAND: { fn: (a, b) => !(a && b) },
  NOR: { fn: (a, b) => !(a || b) },
  XOR: { fn: (a, b) => a !== b },
};
function Bit({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={"flex h-12 w-12 flex-col items-center justify-center rounded-xl text-lg font-bold transition " + (on ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500")}
    >
      {on ? 1 : 0}
      <span className="text-[9px] font-medium opacity-80">{label}</span>
    </button>
  );
}
function LogicDemo() {
  const [gate, setGate] = useState("AND");
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const g = GATES[gate];
  const out = g.fn(a, b);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Every computer is built from these. Tap the inputs and watch the output flip.
      </h4>
      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {Object.keys(GATES).map((name) => (
          <button
            key={name}
            onClick={() => setGate(name)}
            className={"rounded-lg px-2 py-1.5 text-xs font-bold transition " + (gate === name ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-100")}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-inner">
        <div className="flex flex-col gap-2">
          <Bit on={a} onClick={() => setA((v) => !v)} label="A" />
          {!g.unary && <Bit on={b} onClick={() => setB((v) => !v)} label="B" />}
        </div>
        <div className="text-2xl text-slate-300">→</div>
        <div className="flex flex-col items-center">
          <div className={"flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold " + (out ? "bg-amber-400 text-white shadow-lg" : "bg-slate-200 text-slate-500")}>
            {out ? 1 : 0}
          </div>
          <span className="mt-1 text-[10px] font-semibold text-slate-500">{gate} out</span>
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-slate-500 bg-white p-3 text-xs text-slate-600">
        {gate} gives {out ? "1 (HIGH)" : "0 (LOW)"} for these inputs. NAND and NOR are &quot;universal&quot; — any
        circuit can be built from them alone.
      </div>
    </div>
  );
}

export default function SemiconductorElectronicsVizPremium() {
  const demos: DemoTab[] = [
    { id: "diode", title: "Diode", emoji: "🔻", render: () => <DiodeDemo /> },
    { id: "logic", title: "Logic gates", emoji: "🔢", render: () => <LogicDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-slate-50 via-emerald-50 to-teal-50" />;
}
