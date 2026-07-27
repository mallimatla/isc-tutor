"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Coulomb's law
// ============================================================================
function CoulombDemo() {
  const [r, setR] = useState(50); // separation (relative)
  const [like, setLike] = useState(false);
  const F = 100 / ((r / 50) * (r / 50)); // ∝ 1/r²
  const arrowLen = Math.min(40, F / 3);
  const q1x = 90,
    q2x = 90 + r * 1.4;
  const dir = like ? 1 : -1; // repel pushes apart, attract pulls together
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Two charges push or pull with a force that quadruples when they get twice as close.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 260 90" className="h-auto w-full">
          <line x1={40} y1={45} x2={240} y2={45} stroke="#f1f5f9" strokeWidth={1} />
          <circle cx={q1x} cy={45} r={12} fill="#e11d48" />
          <text x={q1x} y={49} textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">+</text>
          <circle cx={q2x} cy={45} r={12} fill={like ? "#e11d48" : "#2563eb"} />
          <text x={q2x} y={49} textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">{like ? "+" : "−"}</text>
          <line x1={q1x - 14} y1={45} x2={q1x - 14 - dir * arrowLen} y2={45} stroke="#334155" strokeWidth={2} markerEnd="url(#ec-a)" />
          <line x1={q2x + 14} y1={45} x2={q2x + 14 + dir * arrowLen} y2={45} stroke="#334155" strokeWidth={2} markerEnd="url(#ec-a)" />
          <defs>
            <marker id="ec-a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#334155" />
            </marker>
          </defs>
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <button onClick={() => setLike((v) => !v)} className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white">
          {like ? "Like (repel)" : "Unlike (attract)"}
        </button>
        <label className="flex-1 text-xs font-medium text-slate-600">
          Separation r = <span className="font-bold text-rose-600">{(r / 50).toFixed(1)}×</span>
          <input type="range" min={25} max={100} value={r} onChange={(e) => setR(+e.target.value)} className="mt-1 w-full accent-rose-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        F = k·q₁q₂ / r² = <strong className="text-rose-600">{F.toFixed(0)}</strong> (relative)
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Field lines
// ============================================================================
function FieldDemo() {
  const [pos, setPos] = useState(true); // positive charge
  const cx = 130,
    cy = 70;
  const lines = Array.from({ length: 12 }, (_, i) => (i * Math.PI * 2) / 12);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Field lines point away from + and into −. A test charge feels a push along them.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 260 140" className="h-auto w-full">
          {lines.map((a, i) => {
            const x2 = cx + Math.cos(a) * 60;
            const y2 = cy + Math.sin(a) * 60;
            const mx = cx + Math.cos(a) * 34;
            const my = cy + Math.sin(a) * 34;
            return (
              <g key={i}>
                <line x1={cx + Math.cos(a) * 14} y1={cy + Math.sin(a) * 14} x2={x2} y2={y2} stroke="#93c5fd" strokeWidth={1.5} />
                <polygon
                  points={pos ? `${mx},${my} ${mx - 4},${my - 4} ${mx - 4},${my + 4}` : `${mx},${my} ${mx + 4},${my - 4} ${mx + 4},${my + 4}`}
                  fill="#3b82f6"
                  transform={`rotate(${(a * 180) / Math.PI} ${mx} ${my})`}
                />
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={13} fill={pos ? "#e11d48" : "#2563eb"} />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">{pos ? "+" : "−"}</text>
        </svg>
      </div>
      <div className="mt-3 flex justify-center rounded-2xl bg-white p-3 shadow-inner">
        <button onClick={() => setPos((v) => !v)} className="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white">
          Flip to {pos ? "negative" : "positive"} charge
        </button>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-blue-500 bg-white p-3 text-xs text-slate-600">
        Denser lines ⇒ stronger field. Lines never cross and never start/end in empty space.
      </div>
    </div>
  );
}

export default function ElectricChargesFieldsVizPremium() {
  const demos: DemoTab[] = [
    { id: "coulomb", title: "Coulomb's law", emoji: "⚡", render: () => <CoulombDemo /> },
    { id: "field", title: "Field lines", emoji: "🧲", render: () => <FieldDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-rose-50 via-orange-50 to-amber-50" />;
}
