"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: SN1 vs SN2 by substrate class
// ============================================================================
interface Substrate {
  id: string;
  label: string;
  sn1: number; // relative rate 0..1
  sn2: number;
  note: string;
}
const SUBSTRATES: Substrate[] = [
  { id: "1", label: "Primary", sn1: 0.08, sn2: 0.95, note: "Little steric hindrance and an unstable primary carbocation, so backside attack wins: SN2 with inversion of configuration." },
  { id: "2", label: "Secondary", sn1: 0.5, sn2: 0.5, note: "Borderline — either pathway can operate depending on the nucleophile and solvent." },
  { id: "3", label: "Tertiary", sn1: 0.95, sn2: 0.06, note: "Bulky groups block backside attack but the tertiary carbocation is stable: SN1 via the carbocation, giving racemisation." },
];

function BarPair({ s }: { s: Substrate }) {
  const W = 300,
    H = 130,
    pad = 30;
  const bar = (x: number, val: number, colour: string, label: string) => {
    const bh = val * (H - 2 * pad);
    const y = H - pad - bh;
    return (
      <g>
        <rect x={x} y={y} width={70} height={bh} rx={4} fill={colour} />
        <text x={x + 35} y={H - pad + 13} textAnchor="middle" fontSize="10" fill="#334155" fontWeight="bold">{label}</text>
        <text x={x + 35} y={y - 4} textAnchor="middle" fontSize="9" fill="#64748b">{Math.round(val * 100)}%</text>
      </g>
    );
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
      {bar(80, s.sn1, "#14b8a6", "SN1")}
      {bar(180, s.sn2, "#0d9488", "SN2")}
    </svg>
  );
}

function MechanismDemo() {
  const [sel, setSel] = useState(0);
  const s = SUBSTRATES[sel];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        The substrate class decides which substitution mechanism dominates.
      </h4>
      <div className="mb-3 flex gap-1.5">
        {SUBSTRATES.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setSel(i)}
            className={"flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition " + (i === sel ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100")}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <BarPair s={s} />
      </div>
      <div className="mt-3 text-center font-mono text-xs text-slate-700">
        SN2 rate = k[substrate][nucleophile] · · · SN1 rate = k[substrate]
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-teal-400 bg-white p-3 text-xs text-slate-600">{s.note}</div>
    </div>
  );
}

// ============================================================================
// Demo 2: Reaction energy profiles
// ============================================================================
function ProfileDemo() {
  const [sn2, setSn2] = useState(true);
  const W = 300,
    H = 170,
    pad = 26;
  // SN2: single hump. SN1: two humps with an intermediate valley.
  const sn2Pts: string[] = [];
  const sn1Pts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = pad + (i / 100) * (W - 2 * pad);
    const u = i / 100;
    // SN2 one barrier
    const y2 = 0.15 + 0.75 * Math.exp(-Math.pow((u - 0.5) / 0.18, 2)) - 0.12 * u;
    // SN1 two barriers around 0.3 and 0.7 with a valley at 0.5
    const b1 = 0.8 * Math.exp(-Math.pow((u - 0.3) / 0.1, 2));
    const b2 = 0.55 * Math.exp(-Math.pow((u - 0.72) / 0.1, 2));
    const y1 = 0.12 + b1 + b2 - 0.1 * u;
    const toY = (v: number) => H - pad - v * (H - 2 * pad);
    sn2Pts.push(`${x},${toY(y2)}`);
    sn1Pts.push(`${x},${toY(y1)}`);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        SN2 goes through one transition state; SN1 has two, with a carbocation intermediate in the valley between them.
      </h4>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setSn2(true)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (sn2 ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100")}
        >
          SN2 profile
        </button>
        <button
          onClick={() => setSn2(false)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (!sn2 ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100")}
        >
          SN1 profile
        </button>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          <polyline points={(sn2 ? sn2Pts : sn1Pts).join(" ")} fill="none" stroke="#0d9488" strokeWidth={2.5} />
          {!sn2 && <text x={pad + (W - 2 * pad) * 0.5} y={pad + 34} textAnchor="middle" fontSize="8" fill="#64748b">carbocation</text>}
          <text x={W - pad} y={H - pad + 14} textAnchor="end" fontSize="9" fill="#64748b">reaction progress →</text>
          <text x={pad - 6} y={pad + 2} textAnchor="end" fontSize="9" fill="#64748b">energy</text>
        </svg>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-teal-400 bg-white p-3 text-xs text-slate-600">
        {sn2
          ? "One concerted step: bond breaking and bond forming happen together at a single transition state — second-order kinetics."
          : "Two steps: slow ionisation to a carbocation (rate-determining) followed by fast attack of the nucleophile — first-order kinetics."}
      </div>
    </div>
  );
}

export default function HaloalkanesHaloarenesVizPremium() {
  const demos: DemoTab[] = [
    { id: "mechanism", title: "SN1 vs SN2", emoji: "🔁", render: () => <MechanismDemo /> },
    { id: "profile", title: "Reaction profile", emoji: "⛰️", render: () => <ProfileDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-teal-50 via-emerald-50 to-green-50" />;
}
