"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: IUPAC name of a straight-chain alkane / alkene
// ============================================================================
const STEMS = ["meth", "eth", "prop", "but", "pent", "hex"];

function IupacNameDemo() {
  const [n, setN] = useState(3);
  const [dbl, setDbl] = useState(false);
  const stem = STEMS[n - 1];
  // ethene is the smallest alkene; a double bond needs at least 2 carbons
  const canDouble = n >= 2;
  const isDouble = dbl && canDouble;
  const suffix = isDouble ? "ene" : "ane";
  const name = stem + suffix;
  const formula = isDouble ? `C${n}H${2 * n}` : `C${n}H${2 * n + 2}`;
  const sub = (num: number) => "₀₁₂₃₄₅₆₇₈₉".split("")[num] ?? String(num);
  const formulaUni = formula.replace(/\d+/g, (d) => d.split("").map((c) => sub(+c)).join(""));

  // skeletal zig-zag
  const W = 300,
    H = 90;
  const startX = 30;
  const step = Math.min(44, (W - 60) / Math.max(1, n - 1 || 1));
  const pts = Array.from({ length: n }, (_, i) => ({
    x: startX + i * step,
    y: i % 2 === 0 ? 60 : 30,
  }));
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        IUPAC names combine a stem for the carbon count with a suffix for the bonding: -ane for single, -ene for a double bond.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {pts.map((p, i) => {
            if (i === pts.length - 1) return null;
            const q = pts[i + 1];
            const isDbBond = isDouble && i === 0; // put double bond at C1–C2
            return (
              <g key={i}>
                <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#16a34a" strokeWidth={2.5} />
                {isDbBond && (
                  <line x1={p.x} y1={p.y + 5} x2={q.x} y2={q.y + 5} stroke="#16a34a" strokeWidth={2.5} />
                )}
              </g>
            );
          })}
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill="#065f46" />
          ))}
          {n === 1 && <text x={pts[0].x + 10} y={pts[0].y + 4} fontSize="11" fill="#065f46">CH₄</text>}
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white p-3 shadow-inner">
          <label className="text-xs font-medium text-slate-600">
            Carbons = <span className="font-bold text-green-600">{n}</span>
            <input type="range" min={1} max={6} step={1} value={n} onChange={(e) => setN(+e.target.value)} className="mt-1 w-full accent-green-500" />
          </label>
        </div>
        <button
          onClick={() => setDbl((d) => !d)}
          disabled={!canDouble}
          className={
            "rounded-2xl p-3 text-xs font-semibold shadow-inner transition disabled:opacity-40 " +
            (isDouble ? "bg-green-600 text-white" : "bg-white text-slate-600 hover:bg-green-50")
          }
          aria-pressed={isDouble}
        >
          Double bond: {isDouble ? "ON" : "OFF"}
        </button>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-4 text-center shadow-inner">
        <div className="text-2xl font-extrabold capitalize text-green-700">{name}</div>
        <div className="mt-1 font-mono text-sm text-slate-600">{formulaUni}</div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-green-400 bg-white p-3 text-xs text-slate-600">
        Stem <strong>{stem}-</strong> means {n} carbon{n > 1 ? "s" : ""}; suffix <strong>-{suffix}</strong> means{" "}
        {isDouble ? "one carbon–carbon double bond" : "all single bonds"}.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Curly arrow — nucleophilic substitution
// ============================================================================
function CurlyArrowDemo() {
  const [p, setP] = useState(0); // progress 0..1
  const W = 320,
    H = 160;
  const cx = 160,
    cy = 90;
  // nucleophile moves in from left, leaving group departs to right
  const nuX = 40 + p * 70;
  const lgX = 240 + p * 60;
  const lgOpacity = 1 - p * 0.7;
  const arrowOpacity = p > 0.05 ? 1 : 0.25;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        A curly arrow shows a pair of electrons moving. The nucleophile donates its pair to the electrophilic carbon as the leaving group departs.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* nucleophile */}
          <circle cx={nuX} cy={cy} r={16} fill="#dcfce7" stroke="#16a34a" strokeWidth={2} />
          <text x={nuX} y={cy + 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#15803d">Nu⁻</text>
          <text x={nuX} y={cy + 34} textAnchor="middle" fontSize="9" fill="#15803d">nucleophile</text>
          {/* central carbon (electrophile) */}
          <circle cx={cx} cy={cy} r={16} fill="#f0fdf4" stroke="#334155" strokeWidth={2} />
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">C</text>
          <text x={cx} y={cy + 34} textAnchor="middle" fontSize="9" fill="#334155">electrophile (δ+)</text>
          {/* bond to leaving group, fading */}
          <line x1={cx + 16} y1={cy} x2={lgX - 16} y2={cy} stroke="#94a3b8" strokeWidth={2} opacity={lgOpacity} strokeDasharray={p > 0.4 ? "3 3" : "0"} />
          {/* leaving group */}
          <circle cx={lgX} cy={cy} r={16} fill="#fee2e2" stroke="#dc2626" strokeWidth={2} opacity={lgOpacity} />
          <text x={lgX} y={cy + 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#b91c1c" opacity={lgOpacity}>Br⁻</text>
          <text x={lgX} y={cy + 34} textAnchor="middle" fontSize="9" fill="#b91c1c" opacity={lgOpacity}>leaving group</text>
          {/* curly arrow Nu → C */}
          <path
            d={`M ${nuX + 14} ${cy - 6} Q ${(nuX + cx) / 2} ${cy - 40}, ${cx - 14} ${cy - 6}`}
            fill="none"
            stroke="#7c3aed"
            strokeWidth={2}
            opacity={arrowOpacity}
            markerEnd="url(#curlyhead)"
          />
          {/* curly arrow C–Br → Br */}
          <path
            d={`M ${cx + 16} ${cy + 6} Q ${(cx + lgX) / 2} ${cy + 42}, ${lgX} ${cy + 8}`}
            fill="none"
            stroke="#7c3aed"
            strokeWidth={2}
            opacity={arrowOpacity}
            markerEnd="url(#curlyhead)"
          />
          <defs>
            <marker id="curlyhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8" fill="none" stroke="#7c3aed" strokeWidth={1.5} />
            </marker>
          </defs>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Reaction progress: <span className="font-bold text-green-600">{(p * 100).toFixed(0)}%</span>
          <input type="range" min={0} max={1} step={0.01} value={p} onChange={(e) => setP(+e.target.value)} className="mt-1 w-full accent-green-500" />
        </label>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-green-400 bg-white p-3 text-xs text-slate-600">
        The nucleophile forms a new bond to carbon while the C–Br bond breaks and Br⁻ leaves. Each curly arrow starts at an electron pair and points to where it goes.
      </div>
    </div>
  );
}

export default function OrganicBasicsVizPremium() {
  const demos: DemoTab[] = [
    { id: "iupac", title: "IUPAC name", emoji: "🏷️", render: () => <IupacNameDemo /> },
    { id: "curly", title: "Curly arrow", emoji: "➡️", render: () => <CurlyArrowDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-green-50 via-lime-50 to-emerald-50" />;
}
