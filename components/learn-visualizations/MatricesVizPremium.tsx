"use client";
import { useState, useRef, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: 2×2 matrix as transformation (drag input vector)
// ============================================================================
function TransformationDemo() {
  const PRESETS: Record<string, [number, number, number, number]> = {
    Identity: [1, 0, 0, 1],
    "Rotate 90°": [0, -1, 1, 0],
    "Scale 2×": [2, 0, 0, 2],
    Reflect: [-1, 0, 0, 1],
  };
  const [[a, b, c, d], setMatrix] = useState<[number, number, number, number]>([1, 0, 0, 1]);
  const [point, setPoint] = useState({ x: 2, y: 1 });
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const tx = a * point.x + b * point.y;
  const ty = c * point.x + d * point.y;
  const scale = 30, ox = 250, oy = 200;
  const toSx = (x: number) => ox + x * scale;
  const toSy = (y: number) => oy - y * scale;

  const onMove = useCallback((e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    const isTouch = "touches" in e;
    pt.x = isTouch ? e.touches[0].clientX : e.clientX;
    pt.y = isTouch ? e.touches[0].clientY : e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    setPoint({ x: Math.round((local.x - ox) / scale * 10) / 10, y: Math.round((oy - local.y) / scale * 10) / 10 });
  }, [dragging]);

  const setVal = (idx: number, val: string) => {
    const n = parseFloat(val) || 0;
    setMatrix((prev) => { const m = [...prev] as [number, number, number, number]; m[idx] = n; return m; });
  };

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">A matrix transforms a vector. Drag the blue input and watch red output.</h4>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-zinc-200 bg-white p-2">
          {[a, b, c, d].map((v, i) => (<input key={i} type="number" value={v} onChange={(e) => setVal(i, e.target.value)} className="w-12 rounded border border-zinc-200 px-1 py-0.5 text-center text-xs font-mono" step="0.5" />))}
        </div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(PRESETS).map(([name, m]) => (<button key={name} onClick={() => setMatrix(m)} className="rounded-full border border-zinc-300 px-2 py-0.5 text-[10px] text-zinc-600 hover:bg-zinc-100">{name}</button>))}
        </div>
      </div>
      <svg ref={svgRef} viewBox="0 0 500 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        {Array.from({ length: 17 }, (_, i) => i - 8).map((n) => (<g key={n}><line x1={toSx(n)} y1="20" x2={toSx(n)} y2="380" stroke="#f1f5f9" /><line x1="20" y1={toSy(n)} x2="480" y2={toSy(n)} stroke="#f1f5f9" /></g>))}
        <line x1="20" y1={oy} x2="480" y2={oy} stroke="#cbd5e1" />
        <line x1={ox} y1="20" x2={ox} y2="380" stroke="#cbd5e1" />
        <line x1={ox} y1={oy} x2={toSx(tx)} y2={toSy(ty)} stroke="#ef4444" strokeWidth="2" />
        <circle cx={toSx(tx)} cy={toSy(ty)} r="6" fill="#ef4444" stroke="#fff" strokeWidth="2" />
        <line x1={ox} y1={oy} x2={toSx(point.x)} y2={toSy(point.y)} stroke="#3b82f6" strokeWidth="2" />
        <circle cx={toSx(point.x)} cy={toSy(point.y)} r="10" fill="#3b82f6" stroke="#fff" strokeWidth="2" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-blue-50 p-3 text-center"><div className="text-[10px] uppercase text-blue-700">Input</div><div className="font-mono text-base font-bold text-blue-700">({point.x}, {point.y})</div></div>
        <div className="rounded-xl bg-red-50 p-3 text-center"><div className="text-[10px] uppercase text-red-700">Output</div><div className="font-mono text-base font-bold text-red-700">({tx.toFixed(1)}, {ty.toFixed(1)})</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Matrix addition
// ============================================================================
function AdditionDemo() {
  const [A, setA] = useState([[1, 2], [3, 4]]);
  const [B, setB] = useState([[5, 6], [7, 8]]);
  const sum = A.map((row, i) => row.map((v, j) => v + B[i][j]));
  const set = (m: number[][], setM: (x: number[][]) => void, i: number, j: number, v: string) => {
    const next = m.map((row) => [...row]);
    next[i][j] = parseInt(v) || 0;
    setM(next);
  };
  const cell = (m: number[][], setM: (x: number[][]) => void, color: string) => (
    <div className="grid grid-cols-2 gap-1">
      {m.flatMap((row, i) => row.map((v, j) => (
        <input key={`${i}-${j}`} type="number" value={v} onChange={(e) => set(m, setM, i, j, e.target.value)} className={"h-12 w-12 rounded-lg border-2 text-center text-base font-mono font-bold " + color} />
      )))}
    </div>
  );
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Matrix addition is just entry-wise sum. Same shape required.</h4>
      <div className="flex items-center justify-center gap-3 rounded-2xl bg-white p-4 shadow-inner">
        {cell(A, setA, "border-blue-300 bg-blue-50 text-blue-800")}
        <span className="text-2xl font-bold text-slate-400">+</span>
        {cell(B, setB, "border-violet-300 bg-violet-50 text-violet-800")}
        <span className="text-2xl font-bold text-slate-400">=</span>
        <div className="grid grid-cols-2 gap-1">
          {sum.flatMap((row, i) => row.map((v, j) => (
            <div key={`${i}-${j}`} className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-emerald-300 bg-emerald-50 text-base font-mono font-bold text-emerald-800">{v}</div>
          )))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Matrix multiplication
// ============================================================================
function MultiplicationDemo() {
  const [A, setA] = useState([[1, 2], [3, 4]]);
  const [B, setB] = useState([[5, 6], [7, 8]]);
  const [hover, setHover] = useState<{ i: number; j: number } | null>(null);
  const prod = [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
  const set = (m: number[][], setM: (x: number[][]) => void, i: number, j: number, v: string) => {
    const next = m.map((row) => [...row]);
    next[i][j] = parseInt(v) || 0;
    setM(next);
  };
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{'Tap a cell of A·B to see "row × column" computation.'}</h4>
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-white p-4 shadow-inner">
        <div className="grid grid-cols-2 gap-1">
          {A.flatMap((row, i) => row.map((v, j) => (
            <input key={`${i}-${j}`} type="number" value={v} onChange={(e) => set(A, setA, i, j, e.target.value)} className={"h-11 w-11 rounded-lg border-2 text-center text-sm font-mono font-bold " + (hover && hover.i === i ? "border-amber-400 bg-amber-100" : "border-blue-300 bg-blue-50") + " text-blue-800"} />
          )))}
        </div>
        <span className="text-2xl font-bold text-slate-400">·</span>
        <div className="grid grid-cols-2 gap-1">
          {B.flatMap((row, i) => row.map((v, j) => (
            <input key={`${i}-${j}`} type="number" value={v} onChange={(e) => set(B, setB, i, j, e.target.value)} className={"h-11 w-11 rounded-lg border-2 text-center text-sm font-mono font-bold " + (hover && hover.j === j ? "border-amber-400 bg-amber-100" : "border-violet-300 bg-violet-50") + " text-violet-800"} />
          )))}
        </div>
        <span className="text-2xl font-bold text-slate-400">=</span>
        <div className="grid grid-cols-2 gap-1">
          {prod.flatMap((row, i) => row.map((v, j) => (
            <button key={`${i}-${j}`} onMouseEnter={() => setHover({ i, j })} onMouseLeave={() => setHover(null)} className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-emerald-300 bg-emerald-50 text-sm font-mono font-bold text-emerald-800">{v}</button>
          )))}
        </div>
      </div>
      {hover && (
        <div className="mt-3 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3 text-xs font-mono">
          C[{hover.i + 1}][{hover.j + 1}] = {A[hover.i][0]}·{B[0][hover.j]} + {A[hover.i][1]}·{B[1][hover.j]} = <strong>{prod[hover.i][hover.j]}</strong>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Demo 4: Transpose
// ============================================================================
function TransposeDemo() {
  const [m, setM] = useState([[1, 2, 3], [4, 5, 6]]);
  const T = m[0].map((_, j) => m.map((row) => row[j]));
  const set = (i: number, j: number, v: string) => {
    const n = m.map((r) => [...r]);
    n[i][j] = parseInt(v) || 0;
    setM(n);
  };
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Transpose flips rows ↔ columns. A: 2×3 becomes Aᵀ: 3×2.</h4>
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-inner">
        <div>
          <div className="mb-1 text-center text-xs font-semibold text-blue-700">A (2×3)</div>
          <div className="grid grid-cols-3 gap-1">
            {m.flatMap((row, i) => row.map((v, j) => (<input key={`${i}-${j}`} type="number" value={v} onChange={(e) => set(i, j, e.target.value)} className="h-10 w-10 rounded-lg border-2 border-blue-300 bg-blue-50 text-center text-sm font-mono font-bold text-blue-800" />)))}
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-400">→</span>
        <div>
          <div className="mb-1 text-center text-xs font-semibold text-emerald-700">Aᵀ (3×2)</div>
          <div className="grid grid-cols-2 gap-1">
            {T.flatMap((row, i) => row.map((v, j) => (<div key={`${i}-${j}`} className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-emerald-300 bg-emerald-50 text-sm font-mono font-bold text-emerald-800">{v}</div>)))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Symmetric vs skew-symmetric tester
// ============================================================================
function SymmetricDemo() {
  const [type, setType] = useState<"sym" | "skew">("sym");
  const sym = [[1, 2, 3], [2, 5, 6], [3, 6, 9]];
  const skew = [[0, 2, -3], [-2, 0, 6], [3, -6, 0]];
  const m = type === "sym" ? sym : skew;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Symmetric: A = Aᵀ. Skew-symmetric: Aᵀ = −A (zeros on diagonal).</h4>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setType("sym")} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold " + (type === "sym" ? "bg-slate-700 text-white" : "bg-white text-slate-600")}>Symmetric</button>
        <button onClick={() => setType("skew")} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold " + (type === "skew" ? "bg-slate-700 text-white" : "bg-white text-slate-600")}>Skew-symmetric</button>
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-4 shadow-inner">
        {m.flatMap((row, i) => row.map((v, j) => (
          <div key={`${i}-${j}`} className={"flex h-12 w-12 items-center justify-center rounded-lg border-2 text-base font-mono font-bold " + (i === j ? "border-amber-400 bg-amber-100 text-amber-800" : v === m[j][i] ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-rose-300 bg-rose-50 text-rose-800")}>{v}</div>
        )))}
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-slate-500 bg-white p-3 text-xs">
        {type === "sym" ? "Mirror across diagonal → entries match. e.g. a[1][2] = a[2][1] = 6" : "Mirror across diagonal → entries negate. Diagonal must be 0."}
      </div>
    </div>
  );
}

export default function MatricesVizPremium() {
  const demos: DemoTab[] = [
    { id: "transform", title: "Transformation", emoji: "🔄", render: () => <TransformationDemo /> },
    { id: "add", title: "Addition", emoji: "➕", render: () => <AdditionDemo /> },
    { id: "mult", title: "Multiplication", emoji: "✖️", render: () => <MultiplicationDemo /> },
    { id: "trans", title: "Transpose", emoji: "🔁", render: () => <TransposeDemo /> },
    { id: "sym", title: "Symmetric", emoji: "🪞", render: () => <SymmetricDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-slate-50 via-zinc-50 to-gray-100" />;
}
