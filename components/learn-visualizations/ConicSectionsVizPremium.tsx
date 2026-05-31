"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Eccentricity morph
// ============================================================================
function EccentricityDemo() {
  const [e, setE] = useState(0.5);
  const W = 520, H = 400, cx = 260, cy = 200;
  const l = 70, STEPS = 320, MAX_X = 240, MAX_Y = 170;
  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const theta = (i / STEPS) * 2 * Math.PI;
    const denom = 1 + e * Math.cos(theta);
    if (Math.abs(denom) >= 0.04) {
      const r = l / denom;
      const x = r * Math.cos(theta), y = r * Math.sin(theta);
      if (Math.abs(x) <= MAX_X && Math.abs(y) <= MAX_Y) { current.push({ x, y }); continue; }
    }
    if (current.length > 1) segments.push(current);
    current = [];
  }
  if (current.length > 1) segments.push(current);
  const paths = segments.map((seg) => seg.map((p, i) => `${i === 0 ? "M" : "L"}${cx + p.x},${cy - p.y}`).join(" "));
  let label: string, color: string;
  if (e < 0.05) { label = "Circle"; color = "#f97316"; }
  else if (e < 0.99) { label = "Ellipse"; color = "#fb923c"; }
  else if (e < 1.01) { label = "Parabola"; color = "#ef4444"; }
  else { label = "Hyperbola"; color = "#dc2626"; }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">One equation, four shapes — slide e from 0 to 2.</h4>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="500" y2={cy} stroke="#e2e8f0" />
        <line x1={cx} y1="20" x2={cx} y2="380" stroke="#e2e8f0" />
        {paths.map((d, i) => (<path key={i} d={d} fill="none" stroke={color} strokeWidth="3.5" />))}
        <circle cx={cx} cy={cy} r="6" fill="#7c2d12" stroke="#fff" strokeWidth="2" />
      </svg>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <input type="range" min="0" max="2" step="0.05" value={e} onChange={(ev) => setE(Number(ev.target.value))} className="w-full accent-orange-600" />
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          <span>0 circle</span><span>&lt;1 ellipse</span><span>=1 parabola</span><span>&gt;1 hyperbola</span>
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 bg-white p-3 text-center" style={{ borderColor: color }}>
        <div className="text-xl font-bold" style={{ color }}>{label}</div>
        <div className="font-mono text-xs text-slate-600">e = {e.toFixed(2)}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Ellipse a, b sliders
// ============================================================================
function EllipseDemo() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(2);
  const cx = 250, cy = 180;
  const px = 40, py = 25;
  const c = Math.sqrt(Math.abs(a * a - b * b));
  const e = c / Math.max(a, b);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Ellipse x²/a² + y²/b² = 1. Foci F₁, F₂ on the major axis.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">a = {a}</span><input type="range" min={1} max={5} step={0.5} value={a} onChange={(e) => setA(parseFloat(e.target.value))} className="flex-1 accent-orange-600" /></div>
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">b = {b}</span><input type="range" min={1} max={5} step={0.5} value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="flex-1 accent-amber-600" /></div>
      </div>
      <svg viewBox="0 0 500 320" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="480" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="300" stroke="#cbd5e1" />
        <ellipse cx={cx} cy={cy} rx={a * px} ry={b * py} fill="none" stroke="#f97316" strokeWidth="3" />
        {a > b ? (
          <>
            <circle cx={cx + c * px} cy={cy} r="6" fill="#dc2626" />
            <circle cx={cx - c * px} cy={cy} r="6" fill="#dc2626" />
          </>
        ) : (
          <>
            <circle cx={cx} cy={cy + c * py} r="6" fill="#dc2626" />
            <circle cx={cx} cy={cy - c * py} r="6" fill="#dc2626" />
          </>
        )}
      </svg>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-orange-50 p-2"><div className="text-[10px] uppercase text-orange-700">c</div><div className="font-mono text-sm font-bold text-orange-700">{c.toFixed(2)}</div></div>
        <div className="rounded-xl bg-amber-50 p-2"><div className="text-[10px] uppercase text-amber-700">e = c/a</div><div className="font-mono text-sm font-bold text-amber-700">{e.toFixed(2)}</div></div>
        <div className="rounded-xl bg-red-50 p-2"><div className="text-[10px] uppercase text-red-700">2a (major)</div><div className="font-mono text-sm font-bold text-red-700">{2 * Math.max(a, b)}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Parabola focus / directrix
// ============================================================================
function ParabolaDemo() {
  const [a, setA] = useState(1);
  const cx = 100, cy = 180;
  const scale = 30;
  const pts: string[] = [];
  for (let y = -5; y <= 5; y += 0.05) {
    const x = (y * y) / (4 * a);
    pts.push(`${pts.length === 0 ? "M" : "L"}${cx + x * scale},${cy - y * scale}`);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">y² = 4ax — every point is equidistant from focus (a,0) and directrix x=−a.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">a =</span>
        <input type="range" min={0.5} max={3} step={0.1} value={a} onChange={(e) => setA(parseFloat(e.target.value))} className="flex-1 accent-orange-500" />
        <span className="w-12 text-center font-mono text-orange-600">{a.toFixed(1)}</span>
      </div>
      <svg viewBox="0 0 500 320" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="480" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="300" stroke="#cbd5e1" />
        <path d={pts.join(" ")} fill="none" stroke="#f97316" strokeWidth="3" />
        <circle cx={cx + a * scale} cy={cy} r="6" fill="#dc2626" />
        <text x={cx + a * scale + 8} y={cy - 8} fontSize="12" fill="#dc2626" fontWeight="700">F({a},0)</text>
        <line x1={cx - a * scale} y1={20} x2={cx - a * scale} y2={300} stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" />
        <text x={cx - a * scale - 60} y={cy + 20} fontSize="11" fill="#a855f7">x = −{a}</text>
      </svg>
    </div>
  );
}

// ============================================================================
// Demo 4: Hyperbola asymptotes
// ============================================================================
function HyperbolaDemo() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(2);
  const cx = 250, cy = 180, scale = 30;
  const ptsR: string[] = [], ptsL: string[] = [];
  for (let y = -5; y <= 5; y += 0.05) {
    const x = a * Math.sqrt(1 + (y * y) / (b * b));
    ptsR.push(`${ptsR.length === 0 ? "M" : "L"}${cx + x * scale},${cy - y * scale}`);
    ptsL.push(`${ptsL.length === 0 ? "M" : "L"}${cx - x * scale},${cy - y * scale}`);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">x²/a² − y²/b² = 1. Branches approach asymptotes y = ±(b/a)x.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">a = {a}</span><input type="range" min={1} max={4} step={0.5} value={a} onChange={(e) => setA(parseFloat(e.target.value))} className="flex-1 accent-orange-600" /></div>
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">b = {b}</span><input type="range" min={1} max={4} step={0.5} value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="flex-1 accent-amber-600" /></div>
      </div>
      <svg viewBox="0 0 500 320" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="20" y1={cy} x2="480" y2={cy} stroke="#cbd5e1" />
        <line x1={cx} y1="20" x2={cx} y2="300" stroke="#cbd5e1" />
        <line x1={cx - 200} y1={cy + 200 * (b / a)} x2={cx + 200} y2={cy - 200 * (b / a)} stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1={cx - 200} y1={cy - 200 * (b / a)} x2={cx + 200} y2={cy + 200 * (b / a)} stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d={ptsR.join(" ")} fill="none" stroke="#dc2626" strokeWidth="3" />
        <path d={ptsL.join(" ")} fill="none" stroke="#dc2626" strokeWidth="3" />
      </svg>
    </div>
  );
}

// ============================================================================
// Demo 5: Cone slicing animation
// ============================================================================
function ConeSliceDemo() {
  const [angle, setAngle] = useState(30);
  let resultName = "Circle";
  let resultColor = "#f97316";
  if (angle < 15) { resultName = "Circle"; resultColor = "#f97316"; }
  else if (angle < 50) { resultName = "Ellipse"; resultColor = "#fb923c"; }
  else if (angle < 70) { resultName = "Parabola"; resultColor = "#ef4444"; }
  else { resultName = "Hyperbola"; resultColor = "#dc2626"; }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Tilt the slicing plane through a cone — see which conic comes out.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-xs font-medium text-slate-600">Slice angle =</span>
        <input type="range" min={0} max={90} value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="flex-1 accent-orange-500" />
        <span className="w-10 text-center font-mono text-orange-600">{angle}°</span>
      </div>
      <svg viewBox="0 0 400 320" className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-inner">
        <defs>
          <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fed7aa" /><stop offset="100%" stopColor="#f97316" /></linearGradient>
        </defs>
        <polygon points="200,30 60,290 340,290" fill="url(#coneGrad)" opacity="0.7" />
        <polygon points="200,290 60,290 340,290" fill="#f97316" opacity="0.3" />
        {/* slicing plane: rotates */}
        {(() => {
          const cx = 200, cy = 170;
          const rad = (angle * Math.PI) / 180;
          const lx = cx - 150 * Math.cos(rad);
          const rx = cx + 150 * Math.cos(rad);
          const ty = cy - 80 * Math.sin(rad);
          const by = cy + 80 * Math.sin(rad);
          return <line x1={lx} y1={by} x2={rx} y2={ty} stroke={resultColor} strokeWidth="4" />;
        })()}
      </svg>
      <div className="mt-3 rounded-xl border-l-4 bg-white p-3 text-center" style={{ borderColor: resultColor }}>
        <span className="text-xs uppercase text-slate-500">Cross-section:</span>{" "}
        <span className="text-xl font-bold" style={{ color: resultColor }}>{resultName}</span>
      </div>
    </div>
  );
}

export default function ConicSectionsVizPremium() {
  const demos: DemoTab[] = [
    { id: "ecc", title: "Eccentricity", emoji: "🔁", render: () => <EccentricityDemo /> },
    { id: "ellipse", title: "Ellipse", emoji: "🥚", render: () => <EllipseDemo /> },
    { id: "parabola", title: "Parabola", emoji: "🛣️", render: () => <ParabolaDemo /> },
    { id: "hyperbola", title: "Hyperbola", emoji: "💫", render: () => <HyperbolaDemo /> },
    { id: "cone", title: "Cone slice", emoji: "🍦", render: () => <ConeSliceDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-orange-50 via-red-50 to-amber-50" />;
}
