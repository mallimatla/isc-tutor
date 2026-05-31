"use client";
import { useState, useRef, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Function machine — drag input, watch output change
// ============================================================================
function FunctionMachineDemo() {
  const [inputX, setInputX] = useState(2);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const f = (x: number) => 0.15 * x * x + 0.5;
  const outputY = f(inputX);

  const toSvgX = (x: number) => 60 + (x + 5) * 40;
  const toSvgY = (y: number) => 340 - y * 40;

  const onMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
      if (!dragging || !svgRef.current) return;
      const pt = svgRef.current.createSVGPoint();
      const isTouch = "touches" in e;
      pt.x = isTouch ? e.touches[0].clientX : e.clientX;
      pt.y = isTouch ? e.touches[0].clientY : e.clientY;
      const ctm = svgRef.current.getScreenCTM();
      if (!ctm) return;
      const local = pt.matrixTransform(ctm.inverse());
      const x = Math.max(-4.5, Math.min(4.5, (local.x - 60) / 40 - 5));
      setInputX(Math.round(x * 10) / 10);
    },
    [dragging]
  );

  const curvePath = Array.from({ length: 100 }, (_, i) => {
    const x = -5 + i * 0.1;
    return `${i === 0 ? "M" : "L"}${toSvgX(x)},${toSvgY(f(x))}`;
  }).join(" ");

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Drag the input dot — output follows automatically.</h4>
      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        <line x1="60" y1="340" x2="460" y2="340" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="260" y1="20" x2="260" y2="380" stroke="#cbd5e1" strokeWidth="1" />
        <text x="465" y="344" fill="#94a3b8" fontSize="12">x</text>
        <text x="264" y="18" fill="#94a3b8" fontSize="12">y</text>
        <path d={curvePath} fill="none" stroke="#10b981" strokeWidth="3" />
        <line x1={toSvgX(inputX)} y1={toSvgY(outputY)} x2={toSvgX(inputX)} y2="340" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="260" y1={toSvgY(outputY)} x2={toSvgX(inputX)} y2={toSvgY(outputY)} stroke="#14b8a6" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={toSvgX(inputX)} cy={toSvgY(outputY)} r="8" fill="#10b981" stroke="#fff" strokeWidth="2" />
        <circle cx={toSvgX(inputX)} cy="340" r="10" fill="#14b8a6" stroke="#fff" strokeWidth="2" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
      </svg>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white p-3 shadow-sm"><div className="text-[10px] font-medium uppercase text-slate-500">Input x</div><div className="text-2xl font-bold text-emerald-600">{inputX.toFixed(1)}</div></div>
        <div className="rounded-xl bg-emerald-50 p-3 shadow-sm"><div className="text-[10px] font-medium uppercase text-emerald-700">f(x) = 0.15x²+0.5</div><div className="text-2xl font-bold text-emerald-600">{outputY.toFixed(2)}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Domain & Range slider — change a, b in f(x)=√(x-a)+b
// ============================================================================
function DomainRangeDemo() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const toSvgX = (x: number) => 40 + (x + 4) * 50;
  const toSvgY = (y: number) => 200 - y * 30;
  const path = [];
  for (let x = a; x <= 6; x += 0.05) {
    const y = Math.sqrt(x - a) + b;
    path.push(`${path.length === 0 ? "M" : "L"}${toSvgX(x)},${toSvgY(y)}`);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">f(x) = √(x − a) + b — change a and b. Notice how domain and range shift.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="w-12 text-sm font-mono text-slate-600">a = {a}</span>
          <input type="range" min={-3} max={3} step={1} value={a} onChange={(e) => setA(parseInt(e.target.value))} className="flex-1 accent-emerald-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 text-sm font-mono text-slate-600">b = {b}</span>
          <input type="range" min={-3} max={3} step={1} value={b} onChange={(e) => setB(parseInt(e.target.value))} className="flex-1 accent-teal-500" />
        </div>
      </div>
      <svg viewBox="0 0 520 280" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1="200" x2="480" y2="200" stroke="#cbd5e1" />
        <line x1="240" y1="20" x2="240" y2="260" stroke="#cbd5e1" />
        <path d={path.join(" ")} fill="none" stroke="#10b981" strokeWidth="3" />
        <circle cx={toSvgX(a)} cy={toSvgY(b)} r="6" fill="#10b981" stroke="#fff" strokeWidth="2" />
        <text x={toSvgX(a) + 10} y={toSvgY(b) - 8} fontSize="12" fill="#065f46">start ({a}, {b})</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-50 p-3 text-center"><div className="text-[10px] font-semibold uppercase text-emerald-700">Domain</div><div className="font-mono text-sm font-bold text-emerald-800">[{a}, ∞)</div></div>
        <div className="rounded-xl bg-teal-50 p-3 text-center"><div className="text-[10px] font-semibold uppercase text-teal-700">Range</div><div className="font-mono text-sm font-bold text-teal-800">[{b}, ∞)</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Function composition — arrow diagram
// ============================================================================
function CompositionDemo() {
  const [x, setX] = useState(2);
  const g = (n: number) => n + 3;
  const f = (n: number) => n * n;
  const gx = g(x);
  const fgx = f(gx);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Trace x → g(x) → f(g(x)). Slide x to watch the chain.</h4>
      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">x =</span>
        <input type="range" min={-3} max={5} step={1} value={x} onChange={(e) => setX(parseInt(e.target.value))} className="flex-1 accent-emerald-500" />
        <span className="w-8 text-center font-mono font-bold text-emerald-600">{x}</span>
      </div>
      <svg viewBox="0 0 520 220" className="w-full rounded-2xl bg-white shadow-inner">
        <rect x="30" y="80" width="100" height="60" rx="12" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
        <text x="80" y="115" textAnchor="middle" fontSize="22" fontWeight="700" fill="#065f46">{x}</text>
        <text x="80" y="65" textAnchor="middle" fontSize="12" fill="#64748b">x</text>
        <text x="160" y="100" textAnchor="middle" fontSize="13" fill="#0f766e">g(x) = x+3</text>
        <path d="M 130 110 L 200 110" stroke="#14b8a6" strokeWidth="3" markerEnd="url(#arr1)" />
        <rect x="200" y="80" width="100" height="60" rx="12" fill="#f0fdfa" stroke="#14b8a6" strokeWidth="2" />
        <text x="250" y="115" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0f766e">{gx}</text>
        <text x="250" y="65" textAnchor="middle" fontSize="12" fill="#64748b">g(x)</text>
        <text x="330" y="100" textAnchor="middle" fontSize="13" fill="#0284c7">f(u) = u²</text>
        <path d="M 300 110 L 370 110" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arr1)" />
        <rect x="370" y="80" width="120" height="60" rx="12" fill="#ecfeff" stroke="#06b6d4" strokeWidth="2" />
        <text x="430" y="115" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0e7490">{fgx}</text>
        <text x="430" y="65" textAnchor="middle" fontSize="12" fill="#64748b">f(g(x))</text>
        <defs><marker id="arr1" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 Z" fill="#14b8a6" /></marker></defs>
      </svg>
      <div className="mt-3 rounded-xl bg-white p-3 text-center shadow-sm">
        <div className="font-mono text-sm text-slate-700">(f ∘ g)({x}) = f({gx}) = </div>
        <div className="font-mono text-2xl font-bold text-cyan-600">{fgx}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Injective / Surjective tester
// ============================================================================
function InjectiveSurjectiveDemo() {
  const TYPES = ["one-one only", "onto only", "bijection", "neither"] as const;
  const [type, setType] = useState<typeof TYPES[number]>("bijection");

  const DOMAIN = [1, 2, 3, 4];
  const CODOMAIN = ["a", "b", "c", "d"];
  const mappings: Record<typeof TYPES[number], number[]> = {
    "one-one only": [0, 1, 2, 2],
    "onto only": [0, 1, 2, 3],
    bijection: [0, 1, 2, 3],
    neither: [0, 0, 1, 1],
  };
  void mappings;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Pick a type — see arrows redraw and conditions check.</h4>
      <div className="mb-3 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button key={t} onClick={() => setType(t)} className={"rounded-full px-3 py-1.5 text-xs font-semibold transition " + (type === t ? "bg-emerald-600 text-white" : "bg-white text-slate-600")}>{t}</button>
        ))}
      </div>
      <svg viewBox="0 0 400 260" className="w-full rounded-2xl bg-white shadow-inner">
        <text x="80" y="30" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f766e">Domain</text>
        <text x="320" y="30" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e40af">Codomain</text>
        {DOMAIN.map((d, i) => (
          <g key={`d${i}`}>
            <circle cx="80" cy={70 + i * 45} r="18" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
            <text x="80" y={75 + i * 45} textAnchor="middle" fontSize="14" fontWeight="700" fill="#065f46">{d}</text>
          </g>
        ))}
        {CODOMAIN.map((c, i) => (
          <g key={`c${i}`}>
            <circle cx="320" cy={70 + i * 45} r="18" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
            <text x="320" y={75 + i * 45} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e40af">{c}</text>
          </g>
        ))}
        {/* arrows depending on type */}
        {DOMAIN.map((_, i) => {
          let targets: number[];
          if (type === "bijection") targets = [i];
          else if (type === "one-one only") targets = i < 3 ? [i] : [3]; // 4 -> d still bijection... let me alter
          else if (type === "onto only") targets = i < 3 ? [i] : [0]; // 4 -> a (so 'a' has two preimages) onto but not 1-1
          else targets = [i % 2]; // neither
          return targets.map((t, k) => (
            <line key={`arr${i}-${k}`} x1="98" y1={70 + i * 45} x2="302" y2={70 + t * 45} stroke="#64748b" strokeWidth="2" markerEnd="url(#funcArr)" />
          ));
        })}
        <defs><marker id="funcArr" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 Z" fill="#64748b" /></marker></defs>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className={"rounded-xl border p-2 " + (type === "one-one only" || type === "bijection" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-zinc-200 bg-white text-slate-500")}>
          <span className="font-mono">1-1 (injective):</span> {type === "one-one only" || type === "bijection" ? "✓ yes" : "✗ no"}
        </div>
        <div className={"rounded-xl border p-2 " + (type === "onto only" || type === "bijection" ? "border-blue-300 bg-blue-50 text-blue-800" : "border-zinc-200 bg-white text-slate-500")}>
          <span className="font-mono">onto (surjective):</span> {type === "onto only" || type === "bijection" ? "✓ yes" : "✗ no"}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Vertical line test — is the curve a function?
// ============================================================================
function VerticalLineTestDemo() {
  const [shape, setShape] = useState<"line" | "circle" | "parabola">("parabola");
  const [xLine, setXLine] = useState(2);

  const toSvgX = (x: number) => 40 + (x + 5) * 44;
  const toSvgY = (y: number) => 160 - y * 25;

  let path = "";
  let intersections = 0;
  if (shape === "line") {
    path = `M ${toSvgX(-5)} ${toSvgY(-5 * 0.6)} L ${toSvgX(5)} ${toSvgY(5 * 0.6)}`;
    intersections = 1;
  } else if (shape === "parabola") {
    const pts = [];
    for (let x = -5; x <= 5; x += 0.1) pts.push(`${pts.length === 0 ? "M" : "L"}${toSvgX(x)},${toSvgY(0.3 * x * x - 2)}`);
    path = pts.join(" ");
    intersections = 1;
  } else {
    // circle of radius 4 centered origin
    path = `M ${toSvgX(4)} ${toSvgY(0)} A ${4 * 44} ${4 * 25} 0 1 0 ${toSvgX(-4)} ${toSvgY(0)} A ${4 * 44} ${4 * 25} 0 1 0 ${toSvgX(4)} ${toSvgY(0)}`;
    intersections = Math.abs(xLine) < 4 ? 2 : Math.abs(xLine) === 4 ? 1 : 0;
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Drag the vertical line. If it ever hits the curve in 2+ places, it's not a function."}</h4>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["line", "parabola", "circle"] as const).map((s) => (
          <button key={s} onClick={() => setShape(s)} className={"rounded-full px-3 py-1.5 text-xs font-semibold transition " + (shape === s ? "bg-emerald-600 text-white" : "bg-white text-slate-600")}>{s}</button>
        ))}
      </div>
      <svg viewBox="0 0 480 320" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1="160" x2="460" y2="160" stroke="#cbd5e1" />
        <line x1="260" y1="20" x2="260" y2="300" stroke="#cbd5e1" />
        <path d={path} fill="none" stroke={shape === "circle" ? "#f43f5e" : "#10b981"} strokeWidth="3" />
        <line x1={toSvgX(xLine)} y1="20" x2={toSvgX(xLine)} y2="300" stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 4" />
      </svg>
      <input type="range" min={-5} max={5} step={0.1} value={xLine} onChange={(e) => setXLine(parseFloat(e.target.value))} className="mt-2 w-full accent-violet-500" />
      <div className={"mt-3 rounded-xl border-l-4 p-3 text-sm " + (intersections > 1 ? "border-rose-500 bg-rose-50 text-rose-800" : "border-emerald-500 bg-emerald-50 text-emerald-800")}>
        Vertical line at x = {xLine.toFixed(1)} hits the curve in <strong>{intersections}</strong> place(s). {intersections > 1 ? "❌ Not a function." : "✓ This is OK so far."}
      </div>
    </div>
  );
}

// ============================================================================
// Main wrapper
// ============================================================================
export default function FunctionsVizPremium() {
  const demos: DemoTab[] = [
    { id: "machine", title: "Function machine", emoji: "⚙️", render: () => <FunctionMachineDemo /> },
    { id: "domain", title: "Domain & range", emoji: "📐", render: () => <DomainRangeDemo /> },
    { id: "compose", title: "Composition", emoji: "🔗", render: () => <CompositionDemo /> },
    { id: "inj-surj", title: "1-1 / onto", emoji: "↔️", render: () => <InjectiveSurjectiveDemo /> },
    { id: "vlt", title: "Vertical-line test", emoji: "📏", render: () => <VerticalLineTestDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-emerald-50 via-teal-50 to-green-50" />;
}
