"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

type Pt = { x: number; y: number };

// ============================================================================
// Demo 1: Original LP solver with corner point method
// ============================================================================
function LPSolverDemo() {
  const [c1, setC1] = useState(6);
  const [c2, setC2] = useState(8);
  const sat = (p: Pt) => p.x >= -1e-6 && p.y >= -1e-6 && p.x + p.y <= c1 + 1e-6 && 2 * p.x + p.y <= c2 + 1e-6;
  const candidates: Pt[] = [{ x: 0, y: 0 }, { x: 0, y: c1 }, { x: c1, y: 0 }, { x: 0, y: c2 }, { x: c2 / 2, y: 0 }, { x: c2 - c1, y: 2 * c1 - c2 }];
  const corners = candidates.filter((p) => isFinite(p.x) && isFinite(p.y)).filter(sat).filter((p, i, arr) => arr.findIndex((q) => Math.abs(q.x - p.x) < 1e-4 && Math.abs(q.y - p.y) < 1e-4) === i);
  const cxC = corners.reduce((s, p) => s + p.x, 0) / (corners.length || 1);
  const cyC = corners.reduce((s, p) => s + p.y, 0) / (corners.length || 1);
  const ordered = [...corners].sort((a, b) => Math.atan2(a.y - cyC, a.x - cxC) - Math.atan2(b.y - cyC, b.x - cxC));
  const Z = (p: Pt) => 3 * p.x + 2 * p.y;
  const bestCorner = corners.reduce((best, p) => (Z(p) > Z(best) ? p : best), corners[0] ?? { x: 0, y: 0 });
  const bestZ = corners.length > 0 ? Z(bestCorner) : 0;
  const W = 520, H = 380, padX = 50, padY = 30, XMAX = 14, YMAX = 14, chartW = W - 2 * padX, chartH = H - 2 * padY;
  const xToPx = (x: number) => padX + (x / XMAX) * chartW;
  const yToPx = (y: number) => padY + chartH - (y / YMAX) * chartH;
  const polyPts = ordered.map((p) => `${xToPx(p.x)},${yToPx(p.y)}`).join(" ");
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Maximize Z = 3x + 2y. Optimum sits at a corner of the green region.</h4>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-white shadow-inner">
        <line x1={padX} y1={yToPx(0)} x2={W - padX} y2={yToPx(0)} stroke="#cbd5e1" />
        <line x1={xToPx(0)} y1={padY} x2={xToPx(0)} y2={yToPx(0)} stroke="#cbd5e1" />
        {ordered.length >= 3 && <polygon points={polyPts} fill="#22c55e" fillOpacity="0.22" />}
        <line x1={xToPx(0)} y1={yToPx(c1)} x2={xToPx(XMAX)} y2={yToPx(c1 - XMAX)} stroke="#16a34a" strokeWidth="2.5" />
        <line x1={xToPx(0)} y1={yToPx(c2)} x2={xToPx(XMAX)} y2={yToPx(c2 - 2 * XMAX)} stroke="#059669" strokeWidth="2.5" />
        <line x1={xToPx(0)} y1={yToPx(bestZ / 2)} x2={xToPx(XMAX)} y2={yToPx((bestZ - 3 * XMAX) / 2)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
        {ordered.map((p, i) => {
          const isBest = Math.abs(p.x - bestCorner.x) < 1e-4 && Math.abs(p.y - bestCorner.y) < 1e-4;
          return <circle key={i} cx={xToPx(p.x)} cy={yToPx(p.y)} r={isBest ? "10" : "6"} fill={isBest ? "#f59e0b" : "#10b981"} stroke="#fff" strokeWidth="2.5" />;
        })}
      </svg>
      <div className="mt-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-24 text-xs font-mono text-green-700">x + y ≤ {c1}</span><input type="range" min={2} max={12} value={c1} onChange={(e) => setC1(Number(e.target.value))} className="flex-1 accent-green-600" /></div>
        <div className="flex items-center gap-2"><span className="w-24 text-xs font-mono text-emerald-700">2x + y ≤ {c2}</span><input type="range" min={4} max={18} value={c2} onChange={(e) => setC2(Number(e.target.value))} className="flex-1 accent-emerald-600" /></div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-amber-50 p-3"><div className="text-[10px] uppercase text-amber-700">Optimal corner</div><div className="font-mono text-base font-bold text-amber-700">({bestCorner.x.toFixed(1)}, {bestCorner.y.toFixed(1)})</div></div>
        <div className="rounded-xl bg-emerald-50 p-3"><div className="text-[10px] uppercase text-emerald-700">Max Z</div><div className="text-xl font-bold text-emerald-700">{bestZ.toFixed(1)}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Objective function slider (drag iso-profit line)
// ============================================================================
function ObjectiveSlideDemo() {
  const [z, setZ] = useState(10);
  const W = 400, H = 320, padX = 40, padY = 20, XMAX = 10, YMAX = 10;
  const xToPx = (x: number) => padX + (x / XMAX) * (W - 2 * padX);
  const yToPx = (y: number) => padY + (H - 2 * padY) - (y / YMAX) * (H - 2 * padY);
  // Region: x>=0, y>=0, x+y<=6, x<=4
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Slide the iso-profit line Z = 2x + 3y. Highest Z touching the region wins.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-mono">Z = {z}</span>
        <input type="range" min={0} max={25} step={0.5} value={z} onChange={(e) => setZ(parseFloat(e.target.value))} className="flex-1 accent-amber-500" />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-white shadow-inner">
        <line x1={padX} y1={yToPx(0)} x2={W - padX} y2={yToPx(0)} stroke="#cbd5e1" />
        <line x1={xToPx(0)} y1={padY} x2={xToPx(0)} y2={yToPx(0)} stroke="#cbd5e1" />
        <polygon points={`${xToPx(0)},${yToPx(0)} ${xToPx(4)},${yToPx(0)} ${xToPx(4)},${yToPx(2)} ${xToPx(0)},${yToPx(6)}`} fill="#22c55e" fillOpacity="0.25" />
        <line x1={xToPx(0)} y1={yToPx(z / 3)} x2={xToPx(XMAX)} y2={yToPx((z - 2 * XMAX) / 3)} stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" />
      </svg>
      <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
        Iso-profit line: Z = 2x + 3y. Sliding it parallel to itself, the last point that still touches the feasible region is the optimum (here Z=18 at (0,6)).
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Bounded vs unbounded region
// ============================================================================
function BoundedDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Bounded regions have an optimum. Unbounded ones might not.</h4>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setOpen(false)} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold " + (!open ? "bg-emerald-600 text-white" : "bg-white text-slate-600")}>Bounded</button>
        <button onClick={() => setOpen(true)} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold " + (open ? "bg-emerald-600 text-white" : "bg-white text-slate-600")}>Unbounded</button>
      </div>
      <svg viewBox="0 0 400 320" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1="280" x2="380" y2="280" stroke="#cbd5e1" />
        <line x1="40" y1="20" x2="40" y2="280" stroke="#cbd5e1" />
        {!open ? (
          <polygon points="40,280 200,280 280,200 280,120 40,120" fill="#22c55e" fillOpacity="0.3" stroke="#16a34a" strokeWidth="2" />
        ) : (
          <polygon points="40,280 380,280 380,180 200,80 40,80" fill="#22c55e" fillOpacity="0.3" stroke="#16a34a" strokeWidth="2" strokeDasharray="4 4" />
        )}
      </svg>
      <div className={"mt-3 rounded-xl border-l-4 p-3 text-sm " + (!open ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-amber-500 bg-amber-50 text-amber-800")}>
        {!open ? "Bounded — closed polygon. Optimum exists at a corner ✓" : "Unbounded — extends infinitely. Maximum may not exist (depends on objective direction)."}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Constraint feasibility checker (point-in-region)
// ============================================================================
function FeasibilityCheckDemo() {
  const [pt, setPt] = useState({ x: 2, y: 1 });
  const constraints = [
    { name: "x ≥ 0", check: pt.x >= 0 },
    { name: "y ≥ 0", check: pt.y >= 0 },
    { name: "x + y ≤ 5", check: pt.x + pt.y <= 5 },
    { name: "2x + y ≤ 6", check: 2 * pt.x + pt.y <= 6 },
  ];
  const feasible = constraints.every((c) => c.check);
  const xToPx = (x: number) => 40 + x * 50;
  const yToPx = (y: number) => 280 - y * 40;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Is (x, y) feasible? It must satisfy ALL constraints simultaneously.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">x = {pt.x.toFixed(1)}</span><input type="range" min={-1} max={5} step={0.1} value={pt.x} onChange={(e) => setPt({ ...pt, x: parseFloat(e.target.value) })} className="flex-1 accent-green-500" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">y = {pt.y.toFixed(1)}</span><input type="range" min={-1} max={6} step={0.1} value={pt.y} onChange={(e) => setPt({ ...pt, y: parseFloat(e.target.value) })} className="flex-1 accent-emerald-500" /></div>
      </div>
      <svg viewBox="0 0 380 320" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1="280" x2="360" y2="280" stroke="#cbd5e1" />
        <line x1="40" y1="20" x2="40" y2="280" stroke="#cbd5e1" />
        <polygon points={`${xToPx(0)},${yToPx(0)} ${xToPx(3)},${yToPx(0)} ${xToPx(1)},${yToPx(4)} ${xToPx(0)},${yToPx(5)}`} fill="#22c55e" fillOpacity="0.3" stroke="#16a34a" />
        <circle cx={xToPx(pt.x)} cy={yToPx(pt.y)} r="8" fill={feasible ? "#10b981" : "#ef4444"} stroke="white" strokeWidth="2" />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {constraints.map((c) => (
          <div key={c.name} className={"rounded-lg p-2 text-xs font-mono " + (c.check ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")}>
            {c.check ? "✓" : "✗"} {c.name}
          </div>
        ))}
      </div>
      <div className={"mt-2 rounded-xl border-l-4 p-3 text-center font-semibold " + (feasible ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-rose-500 bg-rose-50 text-rose-800")}>
        {feasible ? "✓ Feasible point" : "✗ Outside feasible region"}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Real-world LP setup (production planning)
// ============================================================================
function ProductionDemo() {
  const [chairs, setChairs] = useState(2);
  const [tables, setTables] = useState(3);
  // Chairs need 2h labor, 1 unit wood. Tables need 3h labor, 2 units wood.
  // Available: 12h labor, 8 wood. Profit: 30 per chair, 50 per table.
  const labor = 2 * chairs + 3 * tables;
  const wood = 1 * chairs + 2 * tables;
  const profit = 30 * chairs + 50 * tables;
  const okLabor = labor <= 12;
  const okWood = wood <= 8;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Make chairs & tables. Limited labor (12h) and wood (8 units). Maximize profit.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-24 text-xs font-mono">🪑 chairs = {chairs}</span><input type="range" min={0} max={6} value={chairs} onChange={(e) => setChairs(parseInt(e.target.value))} className="flex-1 accent-green-600" /></div>
        <div className="flex items-center gap-2"><span className="w-24 text-xs font-mono">🪟 tables = {tables}</span><input type="range" min={0} max={4} value={tables} onChange={(e) => setTables(parseInt(e.target.value))} className="flex-1 accent-emerald-600" /></div>
      </div>
      <div className="space-y-2 rounded-2xl bg-white p-4 shadow-inner">
        <div className={"rounded-lg p-3 " + (okLabor ? "bg-emerald-50" : "bg-rose-50")}>
          <div className="text-xs">Labor: 2·{chairs} + 3·{tables} = <strong>{labor}</strong> / 12 hours</div>
          <div className="mt-1 h-2 rounded-full bg-white"><div className={"h-2 rounded-full " + (okLabor ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${Math.min(100, (labor / 12) * 100)}%` }} /></div>
        </div>
        <div className={"rounded-lg p-3 " + (okWood ? "bg-emerald-50" : "bg-rose-50")}>
          <div className="text-xs">Wood: 1·{chairs} + 2·{tables} = <strong>{wood}</strong> / 8 units</div>
          <div className="mt-1 h-2 rounded-full bg-white"><div className={"h-2 rounded-full " + (okWood ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${Math.min(100, (wood / 8) * 100)}%` }} /></div>
        </div>
        <div className={"rounded-xl border-l-4 p-3 text-center " + (okLabor && okWood ? "border-amber-500 bg-amber-50 text-amber-800" : "border-rose-500 bg-rose-50 text-rose-800")}>
          {okLabor && okWood ? (<>Profit = ₹30·{chairs} + ₹50·{tables} = <strong className="text-2xl">₹{profit}</strong></>) : "❌ Infeasible — exceeds available resources."}
        </div>
      </div>
    </div>
  );
}

export default function LinearProgrammingVizPremium() {
  const demos: DemoTab[] = [
    { id: "solve", title: "Corner-point", emoji: "🎯", render: () => <LPSolverDemo /> },
    { id: "iso", title: "Iso-profit line", emoji: "📊", render: () => <ObjectiveSlideDemo /> },
    { id: "bounded", title: "Bounded?", emoji: "🔲", render: () => <BoundedDemo /> },
    { id: "check", title: "Feasibility", emoji: "✅", render: () => <FeasibilityCheckDemo /> },
    { id: "real", title: "Production LP", emoji: "🪑", render: () => <ProductionDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-green-50 via-emerald-50 to-lime-50" />;
}
