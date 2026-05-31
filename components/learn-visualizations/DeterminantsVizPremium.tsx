"use client";
import { useState, useRef, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: 2×2 det as signed area of parallelogram
// ============================================================================
function ParallelogramAreaDemo() {
  const [col1, setCol1] = useState({ x: 3, y: 1 });
  const [col2, setCol2] = useState({ x: 1, y: 2 });
  const [dragging, setDragging] = useState<"c1" | "c2" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ox = 260, oy = 200, scale = 40;
  const toSx = (x: number) => ox + x * scale;
  const toSy = (y: number) => oy - y * scale;
  const det = col1.x * col2.y - col1.y * col2.x;

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
    if (dragging === "c1") setCol1({ x, y }); else setCol2({ x, y });
  }, [dragging]);

  const p0 = { x: ox, y: oy };
  const p1 = { x: toSx(col1.x), y: toSy(col1.y) };
  const p2 = { x: toSx(col1.x + col2.x), y: toSy(col1.y + col2.y) };
  const p3 = { x: toSx(col2.x), y: toSy(col2.y) };
  const fill = det >= 0 ? "rgba(75, 85, 99, 0.25)" : "rgba(244, 63, 94, 0.25)";

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">|det| = area of parallelogram. Negative det = flipped orientation.</h4>
      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)} onTouchMove={onMove} onTouchEnd={() => setDragging(null)}>
        {Array.from({ length: 11 }, (_, i) => i - 5).map((i) => (<line key={`vg${i}`} x1={toSx(i)} y1="20" x2={toSx(i)} y2="380" stroke="#f1f5f9" />))}
        {Array.from({ length: 9 }, (_, i) => i - 4).map((i) => (<line key={`hg${i}`} x1="40" y1={toSy(i)} x2="480" y2={toSy(i)} stroke="#f1f5f9" />))}
        <line x1="40" y1={oy} x2="480" y2={oy} stroke="#cbd5e1" />
        <line x1={ox} y1="20" x2={ox} y2="380" stroke="#cbd5e1" />
        <polygon points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill={fill} />
        <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#4b5563" strokeWidth="3" />
        <line x1={p0.x} y1={p0.y} x2={p3.x} y2={p3.y} stroke="#64748b" strokeWidth="3" />
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#94a3b8" strokeDasharray="4 4" />
        <line x1={p3.x} y1={p3.y} x2={p2.x} y2={p2.y} stroke="#94a3b8" strokeDasharray="4 4" />
        <circle cx={p1.x} cy={p1.y} r="11" fill="#4b5563" stroke="#fff" strokeWidth="3" className="cursor-grab" onMouseDown={() => setDragging("c1")} onTouchStart={() => setDragging("c1")} />
        <circle cx={p3.x} cy={p3.y} r="11" fill="#64748b" stroke="#fff" strokeWidth="3" className="cursor-grab" onMouseDown={() => setDragging("c2")} onTouchStart={() => setDragging("c2")} />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white p-3 text-center"><div className="text-[10px] uppercase text-slate-500">|det|</div><div className="text-xl font-bold text-slate-700">{Math.abs(det).toFixed(2)}</div></div>
        <div className={"rounded-xl p-3 text-center " + (det >= 0 ? "bg-emerald-50" : "bg-rose-50")}><div className="text-[10px] uppercase text-slate-500">Sign</div><div className={"text-xl font-bold " + (det >= 0 ? "text-emerald-700" : "text-rose-700")}>{det > 0 ? "+" : det < 0 ? "−" : "0"}</div></div>
      </div>
      <div className="mt-2 rounded-xl border-l-4 border-slate-500 bg-white p-3 font-mono text-sm">
        det = ({col1.x})({col2.y}) − ({col1.y})({col2.x}) = <strong>{det.toFixed(2)}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: 3×3 det by cofactor expansion (first row)
// ============================================================================
function CofactorDemo() {
  const [m, setM] = useState([[1, 2, 3], [0, 1, 4], [5, 6, 0]]);
  const set = (i: number, j: number, v: string) => {
    const n = m.map((r) => [...r]);
    n[i][j] = parseInt(v) || 0;
    setM(n);
  };
  const minor = (i: number, j: number) => {
    const r = m.filter((_, ri) => ri !== i).map((row) => row.filter((_, ci) => ci !== j));
    return r[0][0] * r[1][1] - r[0][1] * r[1][0];
  };
  const c00 = minor(0, 0), c01 = minor(0, 1), c02 = minor(0, 2);
  const det = m[0][0] * c00 - m[0][1] * c01 + m[0][2] * c02;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Expand along first row. Edit any entry to see det update.</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="grid grid-cols-3 gap-1">
          {m.flatMap((row, i) => row.map((v, j) => (
            <input key={`${i}-${j}`} type="number" value={v} onChange={(e) => set(i, j, e.target.value)} className={"h-12 w-12 rounded-lg border-2 text-center text-base font-mono font-bold " + (i === 0 ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-slate-50 text-slate-700")} />
          )))}
        </div>
        <div className="mt-3 font-mono text-sm text-slate-700">
          det = <span className="text-emerald-700">{m[0][0]}</span>·({c00}) − <span className="text-emerald-700">{m[0][1]}</span>·({c01}) + <span className="text-emerald-700">{m[0][2]}</span>·({c02})
        </div>
        <div className="mt-2 text-center text-2xl font-bold text-emerald-700">= {det}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Singular detector
// ============================================================================
function SingularDemo() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [c, setC] = useState(4);
  const [d, setD] = useState(6);
  const det = a * d - b * c;
  const singular = Math.abs(det) < 0.01;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Adjust entries. When det = 0, matrix is singular (no inverse).</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={a} onChange={(e) => setA(parseInt(e.target.value) || 0)} className="h-14 rounded-lg border-2 border-slate-300 bg-slate-50 text-center text-xl font-mono font-bold text-slate-700" />
          <input type="number" value={b} onChange={(e) => setB(parseInt(e.target.value) || 0)} className="h-14 rounded-lg border-2 border-slate-300 bg-slate-50 text-center text-xl font-mono font-bold text-slate-700" />
          <input type="number" value={c} onChange={(e) => setC(parseInt(e.target.value) || 0)} className="h-14 rounded-lg border-2 border-slate-300 bg-slate-50 text-center text-xl font-mono font-bold text-slate-700" />
          <input type="number" value={d} onChange={(e) => setD(parseInt(e.target.value) || 0)} className="h-14 rounded-lg border-2 border-slate-300 bg-slate-50 text-center text-xl font-mono font-bold text-slate-700" />
        </div>
      </div>
      <div className={"mt-3 rounded-xl border-l-4 p-4 text-center " + (singular ? "border-rose-500 bg-rose-50 text-rose-800" : "border-emerald-500 bg-emerald-50 text-emerald-800")}>
        <div className="font-mono text-sm">det = ({a})({d}) − ({b})({c}) = <strong>{det}</strong></div>
        <div className="mt-1 text-xs font-semibold">{singular ? "❌ Singular — no inverse exists" : "✓ Non-singular — A⁻¹ exists"}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Cramer's rule for 2x2 system
// ============================================================================
function CramerDemo() {
  const [a1, setA1] = useState(2); const [b1, setB1] = useState(1); const [c1, setC1] = useState(5);
  const [a2, setA2] = useState(1); const [b2, setB2] = useState(-1); const [c2, setC2] = useState(1);
  const D = a1 * b2 - b1 * a2;
  const Dx = c1 * b2 - b1 * c2;
  const Dy = a1 * c2 - c1 * a2;
  const x = D !== 0 ? Dx / D : NaN;
  const y = D !== 0 ? Dy / D : NaN;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Solve a 2x2 system using Cramer's rule."}</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner space-y-3">
        <div className="flex items-center gap-2 font-mono">
          <input type="number" value={a1} onChange={(e) => setA1(parseInt(e.target.value) || 0)} className="h-10 w-12 rounded border-2 border-slate-300 text-center" />
          <span>x +</span>
          <input type="number" value={b1} onChange={(e) => setB1(parseInt(e.target.value) || 0)} className="h-10 w-12 rounded border-2 border-slate-300 text-center" />
          <span>y =</span>
          <input type="number" value={c1} onChange={(e) => setC1(parseInt(e.target.value) || 0)} className="h-10 w-12 rounded border-2 border-slate-300 text-center" />
        </div>
        <div className="flex items-center gap-2 font-mono">
          <input type="number" value={a2} onChange={(e) => setA2(parseInt(e.target.value) || 0)} className="h-10 w-12 rounded border-2 border-slate-300 text-center" />
          <span>x +</span>
          <input type="number" value={b2} onChange={(e) => setB2(parseInt(e.target.value) || 0)} className="h-10 w-12 rounded border-2 border-slate-300 text-center" />
          <span>y =</span>
          <input type="number" value={c2} onChange={(e) => setC2(parseInt(e.target.value) || 0)} className="h-10 w-12 rounded border-2 border-slate-300 text-center" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-sm">
          <div className="rounded-xl bg-slate-50 p-2"><div className="text-[10px] text-slate-500">D</div><div className="text-lg font-bold text-slate-700">{D}</div></div>
          <div className="rounded-xl bg-blue-50 p-2"><div className="text-[10px] text-blue-700">Dx</div><div className="text-lg font-bold text-blue-700">{Dx}</div></div>
          <div className="rounded-xl bg-violet-50 p-2"><div className="text-[10px] text-violet-700">Dy</div><div className="text-lg font-bold text-violet-700">{Dy}</div></div>
        </div>
        <div className={"rounded-xl border-l-4 p-3 text-center " + (D === 0 ? "border-rose-500 bg-rose-50 text-rose-800" : "border-emerald-500 bg-emerald-50 text-emerald-800")}>
          {D !== 0 ? <>x = {Dx}/{D} = <strong>{x.toFixed(2)}</strong>, y = {Dy}/{D} = <strong>{y.toFixed(2)}</strong></> : <>D = 0 — system has no unique solution.</>}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Area of triangle from three points
// ============================================================================
function TriangleAreaDemo() {
  const [pts, setPts] = useState([{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 2, y: 4 }]);
  const [dragging, setDragging] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ox = 200, oy = 200, scale = 30;
  const toSx = (x: number) => ox + x * scale;
  const toSy = (y: number) => oy - y * scale;
  const onMove = useCallback((e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (dragging === null || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    const isTouch = "touches" in e;
    pt.x = isTouch ? e.touches[0].clientX : e.clientX;
    pt.y = isTouch ? e.touches[0].clientY : e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const x = Math.round((local.x - ox) / scale * 2) / 2;
    const y = Math.round((oy - local.y) / scale * 2) / 2;
    setPts((prev) => prev.map((p, i) => i === dragging ? { x, y } : p));
  }, [dragging]);
  const [p1, p2, p3] = pts;
  const det = p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y);
  const area = Math.abs(det) / 2;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Drag the corners. Area = ½|determinant|.</h4>
      <svg ref={svgRef} viewBox="0 0 400 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)} onTouchMove={onMove} onTouchEnd={() => setDragging(null)}>
        <line x1="20" y1={oy} x2="380" y2={oy} stroke="#cbd5e1" />
        <line x1={ox} y1="20" x2={ox} y2="380" stroke="#cbd5e1" />
        <polygon points={pts.map((p) => `${toSx(p.x)},${toSy(p.y)}`).join(" ")} fill="rgba(99, 102, 241, 0.25)" stroke="#6366f1" strokeWidth="2" />
        {pts.map((p, i) => (<circle key={i} cx={toSx(p.x)} cy={toSy(p.y)} r="11" fill="#6366f1" stroke="#fff" strokeWidth="2" className="cursor-grab" onMouseDown={() => setDragging(i)} onTouchStart={() => setDragging(i)} />))}
      </svg>
      <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-center font-mono">
        Area = ½ · |{det.toFixed(2)}| = <strong className="text-indigo-700">{area.toFixed(2)}</strong> sq units
      </div>
    </div>
  );
}

export default function DeterminantsVizPremium() {
  const demos: DemoTab[] = [
    { id: "para", title: "Parallelogram area", emoji: "📐", render: () => <ParallelogramAreaDemo /> },
    { id: "cofactor", title: "3×3 cofactor", emoji: "🧮", render: () => <CofactorDemo /> },
    { id: "sing", title: "Singular?", emoji: "⚠️", render: () => <SingularDemo /> },
    { id: "cramer", title: "Cramer's rule", emoji: "🎯", render: () => <CramerDemo /> },
    { id: "tri", title: "Triangle area", emoji: "🔺", render: () => <TriangleAreaDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-gray-50 via-slate-50 to-zinc-50" />;
}
