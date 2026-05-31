"use client";
import { useState, useRef, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

const scale = 28, cx = 240, cy = 200;
const toX = (x: number) => cx + x * scale;
const toY = (y: number) => cy - y * scale;

function GridAxes() {
  return (
    <>
      {Array.from({ length: 17 }, (_, i) => i - 8).map((i) => (<line key={`vg${i}`} x1={cx + i * scale} y1={20} x2={cx + i * scale} y2={380} stroke="#f1f5f9" />))}
      {Array.from({ length: 13 }, (_, i) => i - 6).map((i) => (<line key={`hg${i}`} x1={20} y1={cy + i * scale} x2={460} y2={cy + i * scale} stroke="#f1f5f9" />))}
      <line x1="20" y1={cy} x2="460" y2={cy} stroke="#cbd5e1" />
      <line x1={cx} y1="20" x2={cx} y2="380" stroke="#cbd5e1" />
    </>
  );
}

// ============================================================================
// Demo 1: Slope-intercept slider
// ============================================================================
function SlopeInterceptDemo() {
  const [m, setM] = useState(1);
  const [c, setC] = useState(1);
  const slopeAngle = (Math.atan(m) * 180) / Math.PI;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">y = mx + c — adjust slope m and intercept c.</h4>
      <svg viewBox="0 0 480 400" className="w-full rounded-2xl bg-white shadow-inner">
        <GridAxes />
        <line x1={toX(-8)} y1={toY(m * -8 + c)} x2={toX(8)} y2={toY(m * 8 + c)} stroke="#475569" strokeWidth="3" />
        <circle cx={cx} cy={toY(c)} r="7" fill="#52525b" stroke="#fff" strokeWidth="2" />
        <text x={cx + 12} y={toY(c) - 8} fontSize="13" fontWeight="700">(0, {c})</text>
      </svg>
      <div className="mt-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">m = {m}</span><input type="range" min={-5} max={5} step={0.5} value={m} onChange={(e) => setM(Number(e.target.value))} className="flex-1 accent-slate-600" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">c = {c}</span><input type="range" min={-5} max={5} step={0.5} value={c} onChange={(e) => setC(Number(e.target.value))} className="flex-1 accent-zinc-600" /></div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-slate-500 bg-white p-3 text-center">
        <div className="font-mono text-lg font-bold">y = {m}x + {c}</div>
        <div className="text-xs text-slate-500">slope angle ≈ {slopeAngle.toFixed(0)}°</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Two-point line — drag both endpoints
// ============================================================================
function TwoPointDemo() {
  const [p1, setP1] = useState({ x: -2, y: -1 });
  const [p2, setP2] = useState({ x: 3, y: 2 });
  const [dragging, setDragging] = useState<1 | 2 | null>(null);
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
    const newPt = { x: Math.round((local.x - cx) / scale * 2) / 2, y: Math.round((cy - local.y) / scale * 2) / 2 };
    if (dragging === 1) setP1(newPt); else setP2(newPt);
  }, [dragging]);
  const slope = p2.x === p1.x ? Infinity : (p2.y - p1.y) / (p2.x - p1.x);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Drag either point. Line connects them; slope is rise/run.</h4>
      <svg ref={svgRef} viewBox="0 0 480 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)} onTouchMove={onMove} onTouchEnd={() => setDragging(null)}>
        <GridAxes />
        {p2.x !== p1.x && (() => {
          const m = slope;
          const cInt = p1.y - m * p1.x;
          return <line x1={toX(-8)} y1={toY(m * -8 + cInt)} x2={toX(8)} y2={toY(m * 8 + cInt)} stroke="#0ea5e9" strokeWidth="2.5" />;
        })()}
        <line x1={toX(p1.x)} y1={toY(p1.y)} x2={toX(p2.x)} y2={toY(p1.y)} stroke="#94a3b8" strokeDasharray="4 4" />
        <line x1={toX(p2.x)} y1={toY(p1.y)} x2={toX(p2.x)} y2={toY(p2.y)} stroke="#94a3b8" strokeDasharray="4 4" />
        <circle cx={toX(p1.x)} cy={toY(p1.y)} r="11" fill="#3b82f6" stroke="#fff" strokeWidth="2" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(1)} onTouchStart={() => setDragging(1)} />
        <circle cx={toX(p2.x)} cy={toY(p2.y)} r="11" fill="#a855f7" stroke="#fff" strokeWidth="2" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(2)} onTouchStart={() => setDragging(2)} />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-blue-50 p-3 text-center"><div className="text-[10px] uppercase text-blue-700">P₁ ({p1.x}, {p1.y})</div></div>
        <div className="rounded-xl bg-violet-50 p-3 text-center"><div className="text-[10px] uppercase text-violet-700">P₂ ({p2.x}, {p2.y})</div></div>
      </div>
      <div className="mt-2 rounded-xl border-l-4 border-sky-500 bg-white p-3 font-mono text-sm">
        slope = ({p2.y} − {p1.y}) / ({p2.x} − {p1.x}) = <strong className="text-sky-700">{isFinite(slope) ? slope.toFixed(2) : "undefined (vertical)"}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Parallel / Perpendicular checker
// ============================================================================
function ParallelPerpDemo() {
  const [m1, setM1] = useState(1);
  const [m2, setM2] = useState(-1);
  const status = Math.abs(m1 - m2) < 0.01 ? "parallel" : Math.abs(m1 * m2 + 1) < 0.01 ? "perpendicular" : "neither";
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Two lines are parallel when slopes match; perpendicular when m₁·m₂ = −1.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono text-blue-700">m₁ = {m1.toFixed(1)}</span><input type="range" min={-3} max={3} step={0.1} value={m1} onChange={(e) => setM1(parseFloat(e.target.value))} className="flex-1 accent-blue-600" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono text-violet-700">m₂ = {m2.toFixed(1)}</span><input type="range" min={-3} max={3} step={0.1} value={m2} onChange={(e) => setM2(parseFloat(e.target.value))} className="flex-1 accent-violet-600" /></div>
      </div>
      <svg viewBox="0 0 480 400" className="w-full rounded-2xl bg-white shadow-inner">
        <GridAxes />
        <line x1={toX(-8)} y1={toY(m1 * -8)} x2={toX(8)} y2={toY(m1 * 8)} stroke="#3b82f6" strokeWidth="3" />
        <line x1={toX(-8)} y1={toY(m2 * -8)} x2={toX(8)} y2={toY(m2 * 8)} stroke="#a855f7" strokeWidth="3" />
      </svg>
      <div className={"mt-3 rounded-xl border-l-4 p-3 text-sm font-mono " + (status === "parallel" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : status === "perpendicular" ? "border-orange-500 bg-orange-50 text-orange-800" : "border-zinc-300 bg-white text-slate-700")}>
        m₁ · m₂ = {(m1 * m2).toFixed(2)} → <strong>{status}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Distance from point to line
// ============================================================================
function DistanceDemo() {
  const [A, setA] = useState(2);
  const [B, setB] = useState(-1);
  const [C, setC] = useState(-1);
  const [pt, setPt] = useState({ x: 3, y: 4 });
  const dist = Math.abs(A * pt.x + B * pt.y + C) / Math.sqrt(A * A + B * B);
  // foot of perpendicular for visualization
  const k = (A * pt.x + B * pt.y + C) / (A * A + B * B);
  const foot = { x: pt.x - A * k, y: pt.y - B * k };
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Distance from point P to line Ax + By + C = 0.</h4>
      <div className="mb-3 space-y-1 rounded-2xl bg-white p-3 shadow-inner text-xs">
        <div className="flex items-center gap-2"><span className="w-12 font-mono">A={A}</span><input type="range" min={-5} max={5} value={A} onChange={(e) => setA(parseInt(e.target.value) || 1)} className="flex-1 accent-slate-600" /></div>
        <div className="flex items-center gap-2"><span className="w-12 font-mono">B={B}</span><input type="range" min={-5} max={5} value={B} onChange={(e) => setB(parseInt(e.target.value))} className="flex-1 accent-slate-600" /></div>
        <div className="flex items-center gap-2"><span className="w-12 font-mono">C={C}</span><input type="range" min={-5} max={5} value={C} onChange={(e) => setC(parseInt(e.target.value))} className="flex-1 accent-slate-600" /></div>
        <div className="flex items-center gap-2"><span className="w-12 font-mono">Px={pt.x}</span><input type="range" min={-5} max={5} value={pt.x} onChange={(e) => setPt({ ...pt, x: parseInt(e.target.value) })} className="flex-1 accent-rose-500" /></div>
        <div className="flex items-center gap-2"><span className="w-12 font-mono">Py={pt.y}</span><input type="range" min={-5} max={5} value={pt.y} onChange={(e) => setPt({ ...pt, y: parseInt(e.target.value) })} className="flex-1 accent-rose-500" /></div>
      </div>
      <svg viewBox="0 0 480 400" className="w-full rounded-2xl bg-white shadow-inner">
        <GridAxes />
        {/* Draw line Ax+By+C=0  */}
        {B !== 0 ? (
          <line x1={toX(-8)} y1={toY((-C - A * -8) / B)} x2={toX(8)} y2={toY((-C - A * 8) / B)} stroke="#475569" strokeWidth="2.5" />
        ) : A !== 0 ? (
          <line x1={toX(-C / A)} y1={20} x2={toX(-C / A)} y2={380} stroke="#475569" strokeWidth="2.5" />
        ) : null}
        <line x1={toX(pt.x)} y1={toY(pt.y)} x2={toX(foot.x)} y2={toY(foot.y)} stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx={toX(pt.x)} cy={toY(pt.y)} r="8" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
      </svg>
      <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center font-mono">
        d = |{A}·{pt.x} + {B}·{pt.y} + {C}| / √({A * A + B * B}) = <strong className="text-rose-700">{dist.toFixed(3)}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Angle between two lines
// ============================================================================
function AngleBetweenDemo() {
  const [m1, setM1] = useState(1);
  const [m2, setM2] = useState(0);
  const tan = (m2 - m1) / (1 + m1 * m2);
  const angleDeg = (Math.atan(Math.abs(tan)) * 180) / Math.PI;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">tan θ = |(m₂ − m₁) / (1 + m₁m₂)| — angle between two lines.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono text-blue-700">m₁ = {m1.toFixed(1)}</span><input type="range" min={-3} max={3} step={0.1} value={m1} onChange={(e) => setM1(parseFloat(e.target.value))} className="flex-1 accent-blue-600" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono text-orange-700">m₂ = {m2.toFixed(1)}</span><input type="range" min={-3} max={3} step={0.1} value={m2} onChange={(e) => setM2(parseFloat(e.target.value))} className="flex-1 accent-orange-600" /></div>
      </div>
      <svg viewBox="0 0 480 400" className="w-full rounded-2xl bg-white shadow-inner">
        <GridAxes />
        <line x1={toX(-8)} y1={toY(m1 * -8)} x2={toX(8)} y2={toY(m1 * 8)} stroke="#3b82f6" strokeWidth="3" />
        <line x1={toX(-8)} y1={toY(m2 * -8)} x2={toX(8)} y2={toY(m2 * 8)} stroke="#f97316" strokeWidth="3" />
      </svg>
      <div className="mt-3 rounded-xl bg-orange-50 p-3 text-center font-mono">
        θ = <strong className="text-orange-700">{angleDeg.toFixed(1)}°</strong>
      </div>
    </div>
  );
}

export default function StraightLinesVizPremium() {
  const demos: DemoTab[] = [
    { id: "si", title: "Slope-intercept", emoji: "📏", render: () => <SlopeInterceptDemo /> },
    { id: "2pt", title: "Two-point line", emoji: "🎯", render: () => <TwoPointDemo /> },
    { id: "ppl", title: "Parallel / Perp", emoji: "⊥", render: () => <ParallelPerpDemo /> },
    { id: "dist", title: "Pt → line dist", emoji: "📐", render: () => <DistanceDemo /> },
    { id: "ang", title: "Angle between", emoji: "📊", render: () => <AngleBetweenDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-slate-50 via-zinc-50 to-stone-50" />;
}
