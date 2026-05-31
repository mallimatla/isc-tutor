"use client";
import { useState, useRef, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

type V = { x: number; y: number };
const ox = 260, oy = 200, scale = 40;
const toSx = (x: number) => ox + x * scale;
const toSy = (y: number) => oy - y * scale;

// ============================================================================
// Demo 1: Addition (parallelogram law)
// ============================================================================
function AdditionDemo() {
  const [a, setA] = useState<V>({ x: 3, y: 1 });
  const [b, setB] = useState<V>({ x: 1, y: 2 });
  const [dragging, setDragging] = useState<"a" | "b" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const sum = { x: a.x + b.x, y: a.y + b.y };
  const onMove = useCallback((e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    const isTouch = "touches" in e;
    pt.x = isTouch ? e.touches[0].clientX : e.clientX;
    pt.y = isTouch ? e.touches[0].clientY : e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const x = Math.max(-5, Math.min(5, Math.round(((local.x - ox) / scale) * 10) / 10));
    const y = Math.max(-4, Math.min(4, Math.round(((oy - local.y) / scale) * 10) / 10));
    if (dragging === "a") setA({ x, y }); else setB({ x, y });
  }, [dragging]);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Drag a and b. Pink arrow is a + b (parallelogram law).</h4>
      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)} onTouchMove={onMove} onTouchEnd={() => setDragging(null)}>
        <defs>
          <marker id="vArr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#a855f7" /></marker>
          <marker id="vArr2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#d946ef" /></marker>
        </defs>
        <line x1="40" y1={oy} x2="480" y2={oy} stroke="#cbd5e1" />
        <line x1={ox} y1="20" x2={ox} y2="380" stroke="#cbd5e1" />
        <line x1={toSx(a.x)} y1={toSy(a.y)} x2={toSx(sum.x)} y2={toSy(sum.y)} stroke="#a855f7" strokeDasharray="4 4" opacity="0.6" />
        <line x1={toSx(b.x)} y1={toSy(b.y)} x2={toSx(sum.x)} y2={toSy(sum.y)} stroke="#8b5cf6" strokeDasharray="4 4" opacity="0.6" />
        <line x1={ox} y1={oy} x2={toSx(sum.x)} y2={toSy(sum.y)} stroke="#d946ef" strokeWidth="3.5" markerEnd="url(#vArr2)" />
        <line x1={ox} y1={oy} x2={toSx(a.x)} y2={toSy(a.y)} stroke="#a855f7" strokeWidth="3" markerEnd="url(#vArr)" />
        <line x1={ox} y1={oy} x2={toSx(b.x)} y2={toSy(b.y)} stroke="#8b5cf6" strokeWidth="3" markerEnd="url(#vArr)" />
        <circle cx={toSx(a.x)} cy={toSy(a.y)} r="11" fill="#a855f7" stroke="#fff" strokeWidth="3" className="cursor-grab" onMouseDown={() => setDragging("a")} onTouchStart={() => setDragging("a")} />
        <circle cx={toSx(b.x)} cy={toSy(b.y)} r="11" fill="#8b5cf6" stroke="#fff" strokeWidth="3" className="cursor-grab" onMouseDown={() => setDragging("b")} onTouchStart={() => setDragging("b")} />
      </svg>
      <div className="mt-3 rounded-xl bg-purple-50 p-3 text-center font-mono">
        a + b = ({sum.x.toFixed(1)}, {sum.y.toFixed(1)})
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Dot product & angle
// ============================================================================
function DotProductDemo() {
  const [a] = useState<V>({ x: 3, y: 0 });
  const [theta, setTheta] = useState(45);
  const magA = Math.sqrt(a.x * a.x + a.y * a.y);
  const magB = 2;
  const rad = (theta * Math.PI) / 180;
  const b = { x: magB * Math.cos(rad), y: magB * Math.sin(rad) };
  const dot = a.x * b.x + a.y * b.y;
  const perpendicular = Math.abs(dot) < 0.05;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">a · b = |a||b| cos θ. At 90°, dot product is 0.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">θ = {theta}°</span>
        <input type="range" min={0} max={180} value={theta} onChange={(e) => setTheta(parseInt(e.target.value))} className="flex-1 accent-purple-500" />
      </div>
      <svg viewBox="0 0 520 400" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1={oy} x2="480" y2={oy} stroke="#cbd5e1" />
        <line x1={ox} y1="20" x2={ox} y2="380" stroke="#cbd5e1" />
        <path d={`M ${ox + 30} ${oy} A 30 30 0 0 ${theta > 180 ? 1 : 0} ${ox + 30 * Math.cos(rad)} ${oy - 30 * Math.sin(rad)}`} fill="none" stroke="#a855f7" strokeWidth="2" />
        <line x1={ox} y1={oy} x2={toSx(a.x)} y2={toSy(a.y)} stroke="#a855f7" strokeWidth="3" />
        <line x1={ox} y1={oy} x2={toSx(b.x)} y2={toSy(b.y)} stroke="#8b5cf6" strokeWidth="3" />
        <circle cx={toSx(a.x)} cy={toSy(a.y)} r="8" fill="#a855f7" />
        <circle cx={toSx(b.x)} cy={toSy(b.y)} r="8" fill="#8b5cf6" />
      </svg>
      <div className={"mt-3 rounded-xl border-l-4 p-3 text-center font-mono " + (perpendicular ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-purple-500 bg-purple-50 text-purple-800")}>
        a · b = {magA.toFixed(1)} · {magB} · cos({theta}°) = <strong>{dot.toFixed(2)}</strong>
        {perpendicular && <div className="text-xs">⊥ vectors</div>}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Scalar multiplication
// ============================================================================
function ScalarMulDemo() {
  const a = { x: 2, y: 1 };
  const [k, setK] = useState(1.5);
  const kb = { x: k * a.x, y: k * a.y };
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Multiplying by scalar k stretches/shrinks/flips the vector.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">k = {k.toFixed(2)}</span>
        <input type="range" min={-3} max={3} step={0.1} value={k} onChange={(e) => setK(parseFloat(e.target.value))} className="flex-1 accent-purple-500" />
      </div>
      <svg viewBox="0 0 520 400" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1={oy} x2="480" y2={oy} stroke="#cbd5e1" />
        <line x1={ox} y1="20" x2={ox} y2="380" stroke="#cbd5e1" />
        <line x1={ox} y1={oy} x2={toSx(kb.x)} y2={toSy(kb.y)} stroke="#d946ef" strokeWidth="4" opacity="0.6" />
        <line x1={ox} y1={oy} x2={toSx(a.x)} y2={toSy(a.y)} stroke="#a855f7" strokeWidth="3" />
        <circle cx={toSx(a.x)} cy={toSy(a.y)} r="8" fill="#a855f7" />
        <circle cx={toSx(kb.x)} cy={toSy(kb.y)} r="8" fill="#d946ef" />
        <text x={toSx(kb.x) + 10} y={toSy(kb.y)} fontSize="13" fill="#a21caf" fontWeight="700">ka</text>
      </svg>
      <div className="mt-3 rounded-xl bg-purple-50 p-3 text-center font-mono">
        {k.toFixed(2)}·(2, 1) = ({kb.x.toFixed(1)}, {kb.y.toFixed(1)})
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Projection of b onto a
// ============================================================================
function ProjectionDemo() {
  const a = { x: 4, y: 0 };
  const [b, setB] = useState({ x: 2, y: 3 });
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const onMove = useCallback((e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    const isTouch = "touches" in e;
    pt.x = isTouch ? e.touches[0].clientX : e.clientX;
    pt.y = isTouch ? e.touches[0].clientY : e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const x = Math.max(-5, Math.min(5, Math.round(((local.x - ox) / scale) * 10) / 10));
    const y = Math.max(-4, Math.min(4, Math.round(((oy - local.y) / scale) * 10) / 10));
    setB({ x, y });
  }, [dragging]);
  const dot = a.x * b.x + a.y * b.y;
  const magA2 = a.x * a.x + a.y * a.y;
  const proj = { x: (dot / magA2) * a.x, y: (dot / magA2) * a.y };
  const projLen = (dot / Math.sqrt(magA2));
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{'Projection of b onto a = (a·b/|a|²)·a. The "shadow" of b along a.'}</h4>
      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        <line x1="40" y1={oy} x2="480" y2={oy} stroke="#cbd5e1" />
        <line x1={ox} y1="20" x2={ox} y2="380" stroke="#cbd5e1" />
        <line x1={ox} y1={oy} x2={toSx(a.x)} y2={toSy(a.y)} stroke="#a855f7" strokeWidth="3" />
        <line x1={ox} y1={oy} x2={toSx(b.x)} y2={toSy(b.y)} stroke="#8b5cf6" strokeWidth="3" />
        <line x1={ox} y1={oy} x2={toSx(proj.x)} y2={toSy(proj.y)} stroke="#d946ef" strokeWidth="5" opacity="0.7" />
        <line x1={toSx(b.x)} y1={toSy(b.y)} x2={toSx(proj.x)} y2={toSy(proj.y)} stroke="#94a3b8" strokeDasharray="4 4" />
        <circle cx={toSx(b.x)} cy={toSy(b.y)} r="11" fill="#8b5cf6" stroke="#fff" strokeWidth="3" className="cursor-grab" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
        <text x={toSx(a.x) + 10} y={toSy(a.y)} fontSize="13" fill="#6b21a8" fontWeight="700">a</text>
        <text x={toSx(b.x) + 10} y={toSy(b.y)} fontSize="13" fill="#5b21b6" fontWeight="700">b</text>
      </svg>
      <div className="mt-3 rounded-xl bg-fuchsia-50 p-3 text-center font-mono">
        proj length = (a·b)/|a| = <strong className="text-fuchsia-700">{projLen.toFixed(2)}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: 3D vector & cross product magnitude
// ============================================================================
function CrossProductDemo() {
  const [a, setA] = useState({ x: 1, y: 2, z: 3 });
  const [b, setB] = useState({ x: 4, y: 5, z: 6 });
  const cross = {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
  const mag = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
  const setVal = <V extends "x" | "y" | "z">(which: "a" | "b", k: V, v: string) => {
    const n = parseInt(v) || 0;
    if (which === "a") setA((p) => ({ ...p, [k]: n }));
    else setB((p) => ({ ...p, [k]: n }));
  };
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">a × b — perpendicular to both. Magnitude = area of parallelogram they form.</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner space-y-3">
        <div>
          <div className="text-xs font-semibold text-purple-700 mb-1">Vector a</div>
          <div className="flex gap-2">
            {(["x", "y", "z"] as const).map((k) => (
              <input key={k} type="number" value={a[k]} onChange={(e) => setVal("a", k, e.target.value)} className="h-10 flex-1 rounded-lg border-2 border-purple-200 bg-purple-50 text-center font-mono font-bold text-purple-800" />
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-violet-700 mb-1">Vector b</div>
          <div className="flex gap-2">
            {(["x", "y", "z"] as const).map((k) => (
              <input key={k} type="number" value={b[k]} onChange={(e) => setVal("b", k, e.target.value)} className="h-10 flex-1 rounded-lg border-2 border-violet-200 bg-violet-50 text-center font-mono font-bold text-violet-800" />
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-fuchsia-700 mb-1">a × b</div>
          <div className="flex gap-2">
            {(["x", "y", "z"] as const).map((k) => (
              <div key={k} className="flex h-10 flex-1 items-center justify-center rounded-lg border-2 border-fuchsia-300 bg-fuchsia-50 font-mono font-bold text-fuchsia-800">{cross[k]}</div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-fuchsia-50 p-3 text-center font-mono">
          |a × b| = <strong className="text-fuchsia-700">{mag.toFixed(3)}</strong>
        </div>
      </div>
    </div>
  );
}

export default function VectorAlgebraVizPremium() {
  const demos: DemoTab[] = [
    { id: "add", title: "Addition", emoji: "➕", render: () => <AdditionDemo /> },
    { id: "dot", title: "Dot product", emoji: "·", render: () => <DotProductDemo /> },
    { id: "scalar", title: "Scalar × vector", emoji: "✖️", render: () => <ScalarMulDemo /> },
    { id: "proj", title: "Projection", emoji: "🔦", render: () => <ProjectionDemo /> },
    { id: "cross", title: "Cross product", emoji: "❌", render: () => <CrossProductDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-purple-50 via-violet-50 to-fuchsia-50" />;
}
