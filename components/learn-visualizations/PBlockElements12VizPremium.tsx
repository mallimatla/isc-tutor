"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Oxoacid strength of chlorine
// ============================================================================
interface Oxoacid {
  formula: string;
  oxygens: number;
  name: string;
  strength: number; // relative bar height 0..1
}
const OXOACIDS: Oxoacid[] = [
  { formula: "HOCl", oxygens: 1, name: "hypochlorous acid", strength: 0.25 },
  { formula: "HClO₂", oxygens: 2, name: "chlorous acid", strength: 0.45 },
  { formula: "HClO₃", oxygens: 3, name: "chloric acid", strength: 0.72 },
  { formula: "HClO₄", oxygens: 4, name: "perchloric acid", strength: 1.0 },
];

function OxoacidDemo() {
  const [sel, setSel] = useState(0);
  const acid = OXOACIDS[sel];
  const W = 300,
    H = 150,
    pad = 26;
  const bw = (W - 2 * pad) / OXOACIDS.length;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        More oxygen atoms on the central chlorine means a stronger acid.
      </h4>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {OXOACIDS.map((a, i) => (
          <button
            key={a.formula}
            onClick={() => setSel(i)}
            className={"flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition " + (i === sel ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100")}
          >
            {a.formula}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#94a3b8" strokeWidth={1.5} />
          {OXOACIDS.map((a, i) => {
            const bh = a.strength * (H - 2 * pad);
            const x = pad + i * bw + bw * 0.15;
            const y = H - pad - bh;
            const on = i === sel;
            return (
              <g key={a.formula}>
                <rect x={x} y={y} width={bw * 0.7} height={bh} rx={3} fill={on ? "#0ea5e9" : "#bae6fd"} />
                <text x={x + bw * 0.35} y={H - pad + 12} textAnchor="middle" fontSize="8" fill="#64748b">{a.formula}</text>
              </g>
            );
          })}
          <text x={pad - 4} y={pad} textAnchor="end" fontSize="9" fill="#64748b">strength</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 text-center shadow-inner">
        <div className="font-mono text-lg font-bold text-sky-600">{acid.formula}</div>
        <div className="text-xs text-slate-600">{acid.name} — {acid.oxygens} O atom{acid.oxygens > 1 ? "s" : ""}</div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-sky-400 bg-white p-3 text-xs text-slate-600">
        Extra oxygen atoms pull electron density away from the O–H bond and spread the negative charge of the anion, stabilising it — so the acid ionises more readily.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Xenon fluoride shapes
// ============================================================================
interface XeShape {
  formula: string;
  geometry: string;
  lonePairs: number;
  note: string;
}
const XE_SHAPES: XeShape[] = [
  { formula: "XeF₂", geometry: "linear", lonePairs: 3, note: "3 lone pairs sit in the equatorial plane; the two F atoms are axial and opposite." },
  { formula: "XeF₄", geometry: "square planar", lonePairs: 2, note: "2 lone pairs go axial (above and below); the four F atoms lie in a square." },
  { formula: "XeF₆", geometry: "distorted octahedral", lonePairs: 1, note: "1 lone pair distorts the octahedron of six F atoms." },
];

function XeShapeSVG({ shape }: { shape: string }) {
  const cx = 100,
    cy = 90;
  const F = (x: number, y: number, key: string) => (
    <g key={key}>
      <line x1={cx} y1={cy} x2={x} y2={y} stroke="#334155" strokeWidth={1.6} />
      <circle cx={x} cy={y} r={11} fill="#7dd3fc" stroke="#0369a1" strokeWidth={1} />
      <text x={x} y={y + 3} textAnchor="middle" fontSize="9" fill="#0c4a6e" fontWeight="bold">F</text>
    </g>
  );
  const lp = (x: number, y: number, key: string) => (
    <g key={key}>
      <ellipse cx={x} cy={y} rx={8} ry={4} fill="#fca5a5" opacity={0.8} />
      <circle cx={x - 2.5} cy={y} r={1.3} fill="#7f1d1d" />
      <circle cx={x + 2.5} cy={y} r={1.3} fill="#7f1d1d" />
    </g>
  );
  return (
    <svg viewBox="0 0 200 180" className="h-44 w-auto">
      {shape === "linear" && (
        <>
          {F(cx, cy - 60, "f1")}
          {F(cx, cy + 60, "f2")}
          {lp(cx - 42, cy, "l1")}
          {lp(cx + 42, cy, "l2")}
          {lp(cx, cy + 30, "l3")}
        </>
      )}
      {shape === "square planar" && (
        <>
          {F(cx - 48, cy - 30, "f1")}
          {F(cx + 48, cy - 30, "f2")}
          {F(cx - 48, cy + 30, "f3")}
          {F(cx + 48, cy + 30, "f4")}
          {lp(cx, cy - 58, "l1")}
          {lp(cx, cy + 58, "l2")}
        </>
      )}
      {shape === "distorted octahedral" && (
        <>
          {F(cx, cy - 60, "f1")}
          {F(cx, cy + 55, "f2")}
          {F(cx - 55, cy - 15, "f3")}
          {F(cx + 55, cy - 15, "f4")}
          {F(cx - 30, cy + 30, "f5")}
          {F(cx + 30, cy + 30, "f6")}
          {lp(cx + 40, cy + 55, "l1")}
        </>
      )}
      <circle cx={cx} cy={cy} r={14} fill="#a855f7" stroke="#6b21a8" strokeWidth={1.5} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">Xe</text>
    </svg>
  );
}

function XenonDemo() {
  const [sel, setSel] = useState(0);
  const s = XE_SHAPES[sel];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Lone pairs on xenon decide the shape of each fluoride.
      </h4>
      <div className="mb-3 flex gap-1.5">
        {XE_SHAPES.map((x, i) => (
          <button
            key={x.formula}
            onClick={() => setSel(i)}
            className={"flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition " + (i === sel ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-100")}
          >
            {x.formula}
          </button>
        ))}
      </div>
      <div className="flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <XeShapeSVG shape={s.geometry} />
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 text-center shadow-inner">
        <span className="font-mono text-base font-bold text-sky-600">{s.formula}</span>
        <span className="ml-2 text-xs text-slate-600">{s.geometry} — {s.lonePairs} lone pair{s.lonePairs > 1 ? "s" : ""} on Xe</span>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-sky-400 bg-white p-3 text-xs text-slate-600">{s.note}</div>
    </div>
  );
}

export default function PBlockElements12VizPremium() {
  const demos: DemoTab[] = [
    { id: "oxoacid", title: "Oxoacid strength", emoji: "🧪", render: () => <OxoacidDemo /> },
    { id: "xenon", title: "Xenon fluoride shapes", emoji: "🔷", render: () => <XenonDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-sky-50 via-indigo-50 to-blue-50" />;
}
