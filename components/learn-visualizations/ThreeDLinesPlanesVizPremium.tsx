"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// Isometric projection
const proj = (x: number, y: number, z: number, cx = 200, cy = 200, s = 28) => ({
  x: cx + (x - z) * s * 0.866,
  y: cy + (x + z) * s * 0.5 - y * s,
});

// ============================================================================
// Demo 1: Line in 3D — vector form
// ============================================================================
function LineVectorFormDemo() {
  const [t, setT] = useState(2);
  // r = (1, 2, 0) + t·(2, 1, 3)
  const a = { x: 1, y: 2, z: 0 };
  const d = { x: 2, y: 1, z: 3 };
  const pt = { x: a.x + t * d.x, y: a.y + t * d.y, z: a.z + t * d.z };
  const o = proj(0, 0, 0); const A = proj(a.x, a.y, a.z); const P = proj(pt.x, pt.y, pt.z);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"r = a + t·d. Slide t to walk along the line."}</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">t = {t.toFixed(1)}</span>
        <input type="range" min={-2} max={4} step={0.1} value={t} onChange={(e) => setT(parseFloat(e.target.value))} className="flex-1 accent-violet-500" />
      </div>
      <svg viewBox="0 0 400 360" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1={o.x} y1={o.y} x2={A.x + 5 * 24} y2={A.y + 5 * 12} stroke="#94a3b8" strokeWidth="1" />
        {/* line direction */}
        {(() => {
          const start = proj(a.x - 3 * d.x, a.y - 3 * d.y, a.z - 3 * d.z);
          const end = proj(a.x + 5 * d.x, a.y + 5 * d.y, a.z + 5 * d.z);
          return <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#a78bfa" strokeWidth="3" />;
        })()}
        <circle cx={A.x} cy={A.y} r="6" fill="#3b82f6" /><text x={A.x + 8} y={A.y} fontSize="12" fill="#1e40af" fontWeight="700">a</text>
        <circle cx={P.x} cy={P.y} r="8" fill="#ec4899" stroke="white" strokeWidth="2" /><text x={P.x + 10} y={P.y} fontSize="12" fill="#9d174d" fontWeight="700">P(t)</text>
      </svg>
      <div className="mt-3 rounded-xl bg-violet-50 p-3 text-center font-mono text-sm">
        r = (1, 2, 0) + {t.toFixed(1)}·(2, 1, 3) = ({pt.x.toFixed(1)}, {pt.y.toFixed(1)}, {pt.z.toFixed(1)})
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Angle between two lines (via direction vectors)
// ============================================================================
function AngleBetweenLinesDemo() {
  const [d1, setD1] = useState({ x: 1, y: 0, z: 0 });
  const [d2, setD2] = useState({ x: 1, y: 1, z: 0 });
  const dot = d1.x * d2.x + d1.y * d2.y + d1.z * d2.z;
  const m1 = Math.sqrt(d1.x ** 2 + d1.y ** 2 + d1.z ** 2);
  const m2 = Math.sqrt(d2.x ** 2 + d2.y ** 2 + d2.z ** 2);
  const cos = dot / (m1 * m2);
  const angle = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">cos θ = (d₁ · d₂) / (|d₁| |d₂|).</h4>
      <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl bg-white p-3 shadow-inner text-xs">
        <div className="space-y-1">
          <div className="text-blue-700 font-semibold">d₁</div>
          {(["x", "y", "z"] as const).map((k) => (
            <div key={k} className="flex items-center gap-1"><span className="w-4 font-mono">{k}</span><input type="number" value={d1[k]} onChange={(e) => setD1({ ...d1, [k]: parseInt(e.target.value) || 0 })} className="w-14 rounded border px-1 text-center" /></div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="text-rose-700 font-semibold">d₂</div>
          {(["x", "y", "z"] as const).map((k) => (
            <div key={k} className="flex items-center gap-1"><span className="w-4 font-mono">{k}</span><input type="number" value={d2[k]} onChange={(e) => setD2({ ...d2, [k]: parseInt(e.target.value) || 0 })} className="w-14 rounded border px-1 text-center" /></div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner space-y-1 text-center font-mono">
        <div className="text-sm">d₁·d₂ = {dot}, |d₁| = {m1.toFixed(2)}, |d₂| = {m2.toFixed(2)}</div>
        <div className="text-lg">cos θ = <strong className="text-violet-700">{cos.toFixed(3)}</strong></div>
        <div className="text-2xl font-bold text-fuchsia-700">θ = {angle.toFixed(1)}°</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Plane equation ax + by + cz = d
// ============================================================================
function PlaneDemo() {
  const [n, setN] = useState({ a: 1, b: 1, c: 1 });
  const [d, setD] = useState(3);
  // Show normal vector & plane
  const norm = proj(n.a, n.b, n.c);
  const o = proj(0, 0, 0);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"ax + by + cz = d. (a, b, c) is the normal vector."}</h4>
      <div className="mb-3 grid grid-cols-4 gap-1 rounded-2xl bg-white p-3 shadow-inner text-xs">
        <div className="flex items-center gap-1"><span className="w-4 font-mono">a</span><input type="number" value={n.a} onChange={(e) => setN({ ...n, a: parseInt(e.target.value) || 0 })} className="w-full rounded border px-1 text-center" /></div>
        <div className="flex items-center gap-1"><span className="w-4 font-mono">b</span><input type="number" value={n.b} onChange={(e) => setN({ ...n, b: parseInt(e.target.value) || 0 })} className="w-full rounded border px-1 text-center" /></div>
        <div className="flex items-center gap-1"><span className="w-4 font-mono">c</span><input type="number" value={n.c} onChange={(e) => setN({ ...n, c: parseInt(e.target.value) || 0 })} className="w-full rounded border px-1 text-center" /></div>
        <div className="flex items-center gap-1"><span className="w-4 font-mono">d</span><input type="number" value={d} onChange={(e) => setD(parseInt(e.target.value) || 0)} className="w-full rounded border px-1 text-center" /></div>
      </div>
      <svg viewBox="0 0 400 360" className="w-full rounded-2xl bg-white shadow-inner">
        {/* approximate plane (just shaded parallelogram for visual) */}
        {(() => {
          const p1 = proj(d / (n.a || 1), 0, 0);
          const p2 = proj(0, d / (n.b || 1), 0);
          const p3 = proj(0, 0, d / (n.c || 1));
          return <polygon points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill="#a78bfa" fillOpacity="0.35" stroke="#7c3aed" strokeWidth="2" />;
        })()}
        <line x1={o.x} y1={o.y} x2={norm.x} y2={norm.y} stroke="#ec4899" strokeWidth="3" />
        <circle cx={norm.x} cy={norm.y} r="6" fill="#ec4899" />
        <text x={norm.x + 8} y={norm.y} fontSize="12" fill="#9d174d" fontWeight="700">n</text>
      </svg>
      <div className="mt-3 rounded-xl bg-violet-50 p-3 text-center font-mono">
        {n.a}x + {n.b}y + {n.c}z = {d}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Distance from point to plane
// ============================================================================
function PointToPlaneDemo() {
  const [pt, setPt] = useState({ x: 2, y: 3, z: 1 });
  const a = 1, b = 1, c = 1, d = 5;
  const dist = Math.abs(a * pt.x + b * pt.y + c * pt.z - d) / Math.sqrt(a * a + b * b + c * c);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Distance from P to plane x + y + z = 5."}</h4>
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-2xl bg-white p-3 shadow-inner text-xs">
        {(["x", "y", "z"] as const).map((k) => (
          <div key={k} className="flex items-center gap-1"><span className="w-4 font-mono">{k}={pt[k]}</span><input type="range" min={-3} max={6} value={pt[k]} onChange={(e) => setPt({ ...pt, [k]: parseInt(e.target.value) })} className="flex-1 accent-violet-500" /></div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner space-y-2 text-center font-mono text-sm">
        <div>|{a}·{pt.x} + {b}·{pt.y} + {c}·{pt.z} − {d}| / √({a * a + b * b + c * c})</div>
        <div>= |{a * pt.x + b * pt.y + c * pt.z - d}| / √{a * a + b * b + c * c}</div>
        <div className="text-2xl font-bold text-violet-700">= {dist.toFixed(3)}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Coplanar check (volume of tetrahedron)
// ============================================================================
function CoplanarDemo() {
  const pts = [
    [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }],
    [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 2, y: 2, z: 2 }, { x: 3, y: 3, z: 3 }],
  ];
  const [idx, setIdx] = useState(0);
  const p = pts[idx];
  // Vol = (1/6) |det of vectors from p0|
  const v1 = { x: p[1].x - p[0].x, y: p[1].y - p[0].y, z: p[1].z - p[0].z };
  const v2 = { x: p[2].x - p[0].x, y: p[2].y - p[0].y, z: p[2].z - p[0].z };
  const v3 = { x: p[3].x - p[0].x, y: p[3].y - p[0].y, z: p[3].z - p[0].z };
  const det = v1.x * (v2.y * v3.z - v2.z * v3.y) - v1.y * (v2.x * v3.z - v2.z * v3.x) + v1.z * (v2.x * v3.y - v2.y * v3.x);
  const coplanar = Math.abs(det) < 0.001;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Four points are coplanar iff the determinant (volume) is 0.</h4>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setIdx(0)} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold " + (idx === 0 ? "bg-violet-600 text-white" : "bg-white text-slate-600")}>Tetrahedron</button>
        <button onClick={() => setIdx(1)} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold " + (idx === 1 ? "bg-violet-600 text-white" : "bg-white text-slate-600")}>4 collinear</button>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner space-y-1 font-mono text-xs">
        {p.map((pt, i) => (<div key={i}>P{i + 1} = ({pt.x}, {pt.y}, {pt.z})</div>))}
      </div>
      <div className={"mt-3 rounded-xl border-l-4 p-3 text-sm font-mono " + (coplanar ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-amber-500 bg-amber-50 text-amber-800")}>
        det = <strong>{det}</strong> → {coplanar ? "coplanar ✓" : "NOT coplanar (forms tetrahedron with volume " + (Math.abs(det) / 6).toFixed(3) + ")"}
      </div>
    </div>
  );
}

export default function ThreeDLinesPlanesVizPremium() {
  const demos: DemoTab[] = [
    { id: "line", title: "Line vector form", emoji: "📐", render: () => <LineVectorFormDemo /> },
    { id: "angle", title: "Angle b/w lines", emoji: "📊", render: () => <AngleBetweenLinesDemo /> },
    { id: "plane", title: "Plane", emoji: "🟪", render: () => <PlaneDemo /> },
    { id: "dist", title: "Pt → plane dist", emoji: "📏", render: () => <PointToPlaneDemo /> },
    { id: "cop", title: "Coplanar?", emoji: "🔺", render: () => <CoplanarDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-violet-50 via-purple-50 to-indigo-50" />;
}
