"use client";
import { useState, useRef, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Venn diagram — drag circles to see how A ∪ B, A ∩ B change
// ============================================================================
function VennDragDemo() {
  const [circleA, setCircleA] = useState({ x: 200, y: 200, r: 90 });
  const [circleB, setCircleB] = useState({ x: 340, y: 200, r: 90 });
  const [dragging, setDragging] = useState<"A" | "B" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const dx = circleB.x - circleA.x;
  const dy = circleB.y - circleA.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const sumR = circleA.r + circleB.r;
  const overlapRatio = Math.max(0, Math.min(1, 1 - distance / sumR));

  const nA = 50;
  const nB = 40;
  const nIntersection = Math.round(20 * overlapRatio);
  const nUnion = nA + nB - nIntersection;
  const nAOnly = nA - nIntersection;
  const nBOnly = nB - nIntersection;

  const startDrag = (which: "A" | "B") => () => setDragging(which);
  const stopDrag = () => setDragging(null);

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
      const setter = dragging === "A" ? setCircleA : setCircleB;
      setter((c) => ({ ...c, x: Math.max(c.r + 20, Math.min(500 - c.r - 20, local.x)), y: Math.max(c.r + 20, Math.min(380 - c.r - 20, local.y)) }));
    },
    [dragging]
  );

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Drag the circles to overlap them.</h4>
      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={stopDrag} onMouseLeave={stopDrag} onTouchMove={onMove} onTouchEnd={stopDrag}>
        <rect x="20" y="20" width="480" height="360" fill="none" stroke="#cbd5e1" strokeDasharray="6 6" rx="16" />
        <text x="36" y="48" fill="#64748b" fontSize="14" fontWeight="500">U</text>
        <defs>
          <radialGradient id="setsGA" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0.45" /></radialGradient>
          <radialGradient id="setsGB" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#c084fc" stopOpacity="0.6" /><stop offset="100%" stopColor="#9333ea" stopOpacity="0.45" /></radialGradient>
        </defs>
        <circle cx={circleA.x} cy={circleA.y} r={circleA.r} fill="url(#setsGA)" stroke="#2563eb" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={startDrag("A")} onTouchStart={startDrag("A")} />
        <circle cx={circleB.x} cy={circleB.y} r={circleB.r} fill="url(#setsGB)" stroke="#7c3aed" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={startDrag("B")} onTouchStart={startDrag("B")} />
        <text x={circleA.x - circleA.r + 20} y={circleA.y - circleA.r + 30} fill="#1e40af" fontSize="28" fontWeight="700">A</text>
        <text x={circleB.x + circleB.r - 30} y={circleB.y - circleB.r + 30} fill="#6d28d9" fontSize="28" fontWeight="700">B</text>
      </svg>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-blue-100 bg-white p-3 text-center shadow-sm"><div className="text-[10px] font-medium uppercase text-slate-500">Only A</div><div className="text-2xl font-bold text-blue-600">{nAOnly}</div></div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-center shadow-sm"><div className="text-[10px] font-medium uppercase text-violet-700">A ∩ B</div><div className="text-2xl font-bold text-violet-600">{nIntersection}</div></div>
        <div className="rounded-xl border border-purple-100 bg-white p-3 text-center shadow-sm"><div className="text-[10px] font-medium uppercase text-slate-500">Only B</div><div className="text-2xl font-bold text-purple-600">{nBOnly}</div></div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-500 bg-white p-3 text-sm shadow-sm">
        <span className="font-mono text-slate-700">|A ∪ B| = |A| + |B| − |A ∩ B| = </span>
        <span className="font-mono font-bold text-slate-900">{nA} + {nB} − {nIntersection} = <span className="text-emerald-600">{nUnion}</span></span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Subset builder — toggle elements to put into a subset
// ============================================================================
function SubsetBuilderDemo() {
  const UNIVERSE = ["🍎", "🍌", "🍇", "🍊", "🥝", "🍓"];
  const [inSubset, setInSubset] = useState<Set<string>>(new Set(["🍎", "🍇"]));
  const toggle = (item: string) => {
    setInSubset((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Tap to add fruits to subset S. Watch its cardinality and power set size grow.</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Universe U</div>
        <div className="flex flex-wrap gap-2">
          {UNIVERSE.map((item) => {
            const on = inSubset.has(item);
            return (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={
                  "rounded-2xl border-2 px-4 py-3 text-2xl transition " +
                  (on
                    ? "scale-110 border-blue-500 bg-blue-50 shadow-md"
                    : "border-zinc-200 bg-white opacity-60 hover:opacity-90")
                }
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-[10px] font-medium uppercase text-slate-500">|S|</div>
          <div className="text-2xl font-bold text-blue-600">{inSubset.size}</div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="text-[10px] font-medium uppercase text-slate-500">|U|</div>
          <div className="text-2xl font-bold text-slate-600">{UNIVERSE.length}</div>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 shadow-sm">
          <div className="text-[10px] font-medium uppercase text-emerald-700">|P(S)| = 2^|S|</div>
          <div className="text-2xl font-bold text-emerald-600">{Math.pow(2, inSubset.size)}</div>
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-blue-500 bg-white p-3 text-sm">
        <span className="font-mono text-slate-700">S = {"{ "}{[...inSubset].join(", ") || "∅"}{" }"}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Power Set builder — see all subsets of {a,b,c}
// ============================================================================
function PowerSetDemo() {
  const [n, setN] = useState(3);
  const elements = ["a", "b", "c", "d", "e"].slice(0, n);
  const subsets: string[][] = [];
  for (let mask = 0; mask < 1 << n; mask++) {
    const sub: string[] = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) sub.push(elements[i]);
    subsets.push(sub);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Adjust n. P(S) lists every subset of S — its size is 2ⁿ.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">n =</span>
        <input type="range" min={1} max={5} value={n} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-blue-500" />
        <span className="w-6 text-center text-lg font-bold text-blue-600">{n}</span>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <div className="text-[10px] font-semibold uppercase text-slate-500">S = {"{"}{elements.join(", ")}{"}"} — Power set has {subsets.length} subsets</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {subsets.map((s, i) => (
            <span key={i} className={"rounded-lg border px-2 py-1 font-mono text-xs " + (s.length === 0 ? "border-amber-200 bg-amber-50 text-amber-700" : s.length === n ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-100 bg-blue-50 text-blue-700")}>
              {"{"}{s.join(",") || "∅"}{"}"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: De Morgan's laws — visual demonstration
// ============================================================================
function DeMorganDemo() {
  const [law, setLaw] = useState<"union" | "intersection">("union");

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"De Morgan's Laws — toggle to see the complement flip."}</h4>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setLaw("union")}
          className={"flex-1 rounded-full px-3 py-2 text-sm font-semibold transition " + (law === "union" ? "bg-blue-600 text-white" : "bg-white text-slate-600")}
        >
          (A ∪ B)ᶜ
        </button>
        <button
          onClick={() => setLaw("intersection")}
          className={"flex-1 rounded-full px-3 py-2 text-sm font-semibold transition " + (law === "intersection" ? "bg-blue-600 text-white" : "bg-white text-slate-600")}
        >
          (A ∩ B)ᶜ
        </button>
      </div>
      <svg viewBox="0 0 520 360" className="w-full rounded-2xl bg-white shadow-inner">
        <defs>
          <pattern id="hash" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#10b981" strokeWidth="1.5" />
          </pattern>
          <mask id="outsideUnion"><rect x="0" y="0" width="520" height="360" fill="white" /><circle cx="200" cy="180" r="100" fill="black" /><circle cx="320" cy="180" r="100" fill="black" /></mask>
          <mask id="outsideInter"><rect x="0" y="0" width="520" height="360" fill="white" /><g><circle cx="200" cy="180" r="100" fill="white" /><circle cx="320" cy="180" r="100" fill="white" /></g><g style={{ mixBlendMode: "multiply" }}><circle cx="200" cy="180" r="100" fill="black" /><circle cx="320" cy="180" r="100" fill="black" /></g></mask>
        </defs>
        <rect x="40" y="40" width="440" height="280" fill="none" stroke="#cbd5e1" strokeDasharray="6 6" rx="16" />
        <text x="56" y="68" fill="#64748b" fontSize="13" fontWeight="500">U</text>
        {/* Shaded region = complement */}
        {law === "union" ? (
          <rect x="40" y="40" width="440" height="280" fill="url(#hash)" mask="url(#outsideUnion)" />
        ) : (
          <g>
            <rect x="40" y="40" width="440" height="280" fill="url(#hash)" />
            <circle cx="200" cy="180" r="100" fill="white" />
            <circle cx="320" cy="180" r="100" fill="white" />
            <g>
              <circle cx="200" cy="180" r="100" fill="rgba(96,165,250,0.15)" />
              <circle cx="320" cy="180" r="100" fill="rgba(192,132,252,0.15)" />
            </g>
            <path d="M 220 100 A 100 100 0 0 0 220 260 A 100 100 0 0 0 220 100 Z" fill="url(#hash)" opacity="0" />
            {/* Reveal Aᶜ ∪ Bᶜ = everything outside intersection */}
          </g>
        )}
        <circle cx="200" cy="180" r="100" fill="none" stroke="#2563eb" strokeWidth="2.5" />
        <circle cx="320" cy="180" r="100" fill="none" stroke="#7c3aed" strokeWidth="2.5" />
        <text x="130" y="180" fill="#1e40af" fontSize="22" fontWeight="700">A</text>
        <text x="380" y="180" fill="#6d28d9" fontSize="22" fontWeight="700">B</text>
      </svg>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-500 bg-white p-3 text-sm">
        {law === "union" ? (
          <span className="font-mono text-slate-800">(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ — everything <em>outside both</em> sets.</span>
        ) : (
          <span className="font-mono text-slate-800">(A ∩ B)ᶜ = Aᶜ ∪ Bᶜ — everything <em>outside the overlap</em>.</span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Cardinality calculator using inclusion-exclusion for 3 sets
// ============================================================================
function ThreeSetInclusionDemo() {
  const [counts, setCounts] = useState({ A: 30, B: 25, C: 20, AB: 10, BC: 8, AC: 7, ABC: 4 });
  const set = <K extends keyof typeof counts>(k: K, v: number) => setCounts((p) => ({ ...p, [k]: Math.max(0, v) }));
  const union = counts.A + counts.B + counts.C - counts.AB - counts.BC - counts.AC + counts.ABC;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Three-set inclusion-exclusion — adjust counts to verify the formula.</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["A", "B", "C", "AB", "BC", "AC", "ABC"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 rounded-xl border border-zinc-200 p-2">
              <span className="w-12 text-xs font-mono font-semibold text-slate-600">|{k.split("").join("∩")}|</span>
              <input type="number" min={0} value={counts[k]} onChange={(e) => set(k, parseInt(e.target.value) || 0)} className="w-full rounded-md border border-zinc-200 px-2 py-1 text-sm font-mono" />
            </label>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-2xl border-l-4 border-emerald-500 bg-white p-4 shadow-sm">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">|A ∪ B ∪ C|</div>
        <div className="mt-1 font-mono text-sm text-slate-700">= |A| + |B| + |C| − |A∩B| − |B∩C| − |A∩C| + |A∩B∩C|</div>
        <div className="mt-2 font-mono text-2xl font-bold text-emerald-600">= {union}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Main wrapper — exposes all demos through the tabs UI
// ============================================================================
export default function SetsVizPremium() {
  const demos: DemoTab[] = [
    { id: "venn", title: "Venn", emoji: "⭕", render: () => <VennDragDemo /> },
    { id: "subset", title: "Subset builder", emoji: "🍎", render: () => <SubsetBuilderDemo /> },
    { id: "power", title: "Power set", emoji: "🧮", render: () => <PowerSetDemo /> },
    { id: "demorgan", title: "De Morgan", emoji: "🔄", render: () => <DeMorganDemo /> },
    { id: "three", title: "3-set count", emoji: "📊", render: () => <ThreeSetInclusionDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-blue-50 via-indigo-50 to-purple-50" />;
}
