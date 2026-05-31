"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// Simple 3D → 2D projection (isometric)
const proj3D = (x: number, y: number, z: number, cx = 200, cy = 200, s = 28) => ({
  x: cx + (x - z) * s * 0.866,
  y: cy + (x + z) * s * 0.5 - y * s,
});

// ============================================================================
// Demo 1: 3D distance formula
// ============================================================================
function DistanceDemo() {
  const [a, setA] = useState({ x: 1, y: 1, z: 0 });
  const [b, setB] = useState({ x: 4, y: 3, z: 2 });
  const d = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2);
  const pa = proj3D(a.x, a.y, a.z);
  const pb = proj3D(b.x, b.y, b.z);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Distance in 3D: √[(Δx)² + (Δy)² + (Δz)²].</h4>
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-2xl bg-white p-3 shadow-inner text-xs">
        {(["x", "y", "z"] as const).map((k) => (
          <div key={"a" + k} className="flex items-center gap-1"><span className="w-8 font-mono text-blue-700">A.{k}={a[k]}</span><input type="range" min={0} max={5} value={a[k]} onChange={(e) => setA({ ...a, [k]: parseInt(e.target.value) })} className="flex-1 accent-blue-500" /></div>
        ))}
        {(["x", "y", "z"] as const).map((k) => (
          <div key={"b" + k} className="flex items-center gap-1"><span className="w-8 font-mono text-rose-700">B.{k}={b[k]}</span><input type="range" min={0} max={5} value={b[k]} onChange={(e) => setB({ ...b, [k]: parseInt(e.target.value) })} className="flex-1 accent-rose-500" /></div>
        ))}
      </div>
      <svg viewBox="0 0 400 360" className="w-full rounded-2xl bg-white shadow-inner">
        {/* axes */}
        {(() => { const o = proj3D(0, 0, 0); const X = proj3D(6, 0, 0); const Y = proj3D(0, 6, 0); const Z = proj3D(0, 0, 6);
          return <><line x1={o.x} y1={o.y} x2={X.x} y2={X.y} stroke="#94a3b8" /><line x1={o.x} y1={o.y} x2={Y.x} y2={Y.y} stroke="#94a3b8" /><line x1={o.x} y1={o.y} x2={Z.x} y2={Z.y} stroke="#94a3b8" /><text x={X.x + 5} y={X.y} fontSize="11" fill="#475569">x</text><text x={Y.x} y={Y.y - 5} fontSize="11" fill="#475569">y</text><text x={Z.x - 12} y={Z.y} fontSize="11" fill="#475569">z</text></>;
        })()}
        <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#7c3aed" strokeWidth="3" />
        <circle cx={pa.x} cy={pa.y} r="7" fill="#3b82f6" />
        <circle cx={pb.x} cy={pb.y} r="7" fill="#f43f5e" />
      </svg>
      <div className="mt-3 rounded-xl bg-violet-50 p-3 text-center font-mono">
        d = √({Math.pow(b.x - a.x, 2)} + {Math.pow(b.y - a.y, 2)} + {Math.pow(b.z - a.z, 2)}) = <strong className="text-violet-700">{d.toFixed(3)}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Section formula (point dividing line segment in ratio m:n)
// ============================================================================
function SectionDemo() {
  const A = { x: 1, y: 1, z: 1 };
  const B = { x: 5, y: 4, z: 3 };
  const [m, setM] = useState(2);
  const [n, setN] = useState(3);
  const P = {
    x: (m * B.x + n * A.x) / (m + n),
    y: (m * B.y + n * A.y) / (m + n),
    z: (m * B.z + n * A.z) / (m + n),
  };
  const pa = proj3D(A.x, A.y, A.z);
  const pb = proj3D(B.x, B.y, B.z);
  const pp = proj3D(P.x, P.y, P.z);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Point P divides AB in ratio m:n internally.</h4>
      <div className="mb-3 flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-inner text-xs">
        <div className="flex items-center gap-2"><span className="w-12 font-mono">m = {m}</span><input type="range" min={1} max={5} value={m} onChange={(e) => setM(parseInt(e.target.value))} className="flex-1 accent-emerald-500" /></div>
        <div className="flex items-center gap-2"><span className="w-12 font-mono">n = {n}</span><input type="range" min={1} max={5} value={n} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-amber-500" /></div>
      </div>
      <svg viewBox="0 0 400 320" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#6366f1" strokeWidth="3" />
        <circle cx={pa.x} cy={pa.y} r="6" fill="#3b82f6" /><text x={pa.x + 8} y={pa.y} fontSize="12" fill="#1e40af" fontWeight="700">A</text>
        <circle cx={pb.x} cy={pb.y} r="6" fill="#f43f5e" /><text x={pb.x + 8} y={pb.y} fontSize="12" fill="#9f1239" fontWeight="700">B</text>
        <circle cx={pp.x} cy={pp.y} r="8" fill="#10b981" stroke="white" strokeWidth="2" /><text x={pp.x + 10} y={pp.y} fontSize="12" fill="#065f46" fontWeight="700">P</text>
      </svg>
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-center font-mono text-sm">
        P = ({P.x.toFixed(2)}, {P.y.toFixed(2)}, {P.z.toFixed(2)})
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Direction cosines of a vector
// ============================================================================
function DirCosinesDemo() {
  const [v, setV] = useState({ x: 2, y: 1, z: 2 });
  const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  const l = v.x / mag, mD = v.y / mag, nD = v.z / mag;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Direction cosines l, m, n satisfy l² + m² + n² = 1.</h4>
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-2xl bg-white p-3 shadow-inner text-xs">
        {(["x", "y", "z"] as const).map((k) => (
          <div key={k} className="flex items-center gap-1"><span className="w-8 font-mono">{k}={v[k]}</span><input type="range" min={-4} max={4} value={v[k]} onChange={(e) => setV({ ...v, [k]: parseInt(e.target.value) })} className="flex-1 accent-violet-500" /></div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner space-y-2 font-mono text-sm">
        <div>|v| = √({v.x}² + {v.y}² + {v.z}²) = <strong className="text-violet-700">{mag.toFixed(3)}</strong></div>
        <div>l = {v.x}/|v| = <strong className="text-blue-700">{l.toFixed(3)}</strong></div>
        <div>m = {v.y}/|v| = <strong className="text-emerald-700">{mD.toFixed(3)}</strong></div>
        <div>n = {v.z}/|v| = <strong className="text-amber-700">{nD.toFixed(3)}</strong></div>
        <div className="rounded-lg bg-emerald-50 p-2 text-center">l² + m² + n² = <strong>{(l * l + mD * mD + nD * nD).toFixed(3)}</strong> ✓</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Midpoint of line segment
// ============================================================================
function MidpointDemo() {
  const [A, setA] = useState({ x: 1, y: 1, z: 1 });
  const [B, setB] = useState({ x: 5, y: 3, z: 4 });
  const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2, z: (A.z + B.z) / 2 };
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Midpoint formula: average of coordinates.</h4>
      <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl bg-white p-3 shadow-inner text-xs">
        <div className="space-y-1">
          <div className="text-blue-700 font-semibold">A</div>
          {(["x", "y", "z"] as const).map((k) => (
            <div key={k} className="flex items-center gap-1"><span className="w-4 font-mono">{k}</span><input type="number" value={A[k]} onChange={(e) => setA({ ...A, [k]: parseInt(e.target.value) || 0 })} className="w-12 rounded border px-1 text-center" /></div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="text-rose-700 font-semibold">B</div>
          {(["x", "y", "z"] as const).map((k) => (
            <div key={k} className="flex items-center gap-1"><span className="w-4 font-mono">{k}</span><input type="number" value={B[k]} onChange={(e) => setB({ ...B, [k]: parseInt(e.target.value) || 0 })} className="w-12 rounded border px-1 text-center" /></div>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-emerald-50 p-3 text-center font-mono">
        Midpoint M = ({M.x}, {M.y}, {M.z})
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Octants in 3D space
// ============================================================================
function OctantsDemo() {
  const [pt, setPt] = useState({ x: 2, y: 1, z: 1 });
  const octant = (pt.x >= 0 ? 1 : 0) * 4 + (pt.y >= 0 ? 1 : 0) * 2 + (pt.z >= 0 ? 1 : 0) + 1;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">3D space has 8 octants — like quadrants but in 3D.</h4>
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-2xl bg-white p-3 shadow-inner text-xs">
        {(["x", "y", "z"] as const).map((k) => (
          <div key={k} className="flex items-center gap-1"><span className="w-8 font-mono">{k}={pt[k]}</span><input type="range" min={-3} max={3} value={pt[k]} onChange={(e) => setPt({ ...pt, [k]: parseInt(e.target.value) })} className="flex-1 accent-violet-500" /></div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner text-center">
        <div className="text-xs uppercase text-slate-500">Point</div>
        <div className="font-mono text-xl font-bold text-violet-700">({pt.x}, {pt.y}, {pt.z})</div>
        <div className="mt-2 text-xs uppercase text-slate-500">Octant</div>
        <div className="text-3xl font-bold text-fuchsia-700">{octant} of 8</div>
        <div className="text-xs text-slate-500 mt-1">
          Signs: x{pt.x >= 0 ? "+" : "−"}, y{pt.y >= 0 ? "+" : "−"}, z{pt.z >= 0 ? "+" : "−"}
        </div>
      </div>
    </div>
  );
}

export default function ThreeDGeometryVizPremium() {
  const demos: DemoTab[] = [
    { id: "dist", title: "Distance", emoji: "📏", render: () => <DistanceDemo /> },
    { id: "section", title: "Section formula", emoji: "✂️", render: () => <SectionDemo /> },
    { id: "dc", title: "Direction cosines", emoji: "🧭", render: () => <DirCosinesDemo /> },
    { id: "mid", title: "Midpoint", emoji: "•", render: () => <MidpointDemo /> },
    { id: "oct", title: "Octants", emoji: "🎲", render: () => <OctantsDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-violet-50 via-indigo-50 to-blue-50" />;
}
