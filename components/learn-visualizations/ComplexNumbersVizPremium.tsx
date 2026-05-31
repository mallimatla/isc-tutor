"use client";
import { useState, useRef, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Argand plane drag
// ============================================================================
function ArgandDemo() {
  const [point, setPoint] = useState({ x: 3, y: 2 });
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const cx = 260, cy = 200, scale = 40;
  const px = cx + point.x * scale;
  const py = cy - point.y * scale;
  const modulus = Math.sqrt(point.x * point.x + point.y * point.y);
  const argDeg = (Math.atan2(point.y, point.x) * 180) / Math.PI;

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
      const x = Math.max(-5, Math.min(5, Math.round(((local.x - cx) / scale) * 10) / 10));
      const y = Math.max(-4, Math.min(4, Math.round(((cy - local.y) / scale) * 10) / 10));
      setPoint({ x, y });
    },
    [dragging]
  );

  const sign = point.y >= 0 ? "+" : "−";
  const absY = Math.abs(point.y).toFixed(1);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Drag z on the Argand plane. Watch modulus and argument.</h4>
      <svg ref={svgRef} viewBox="0 0 520 400" className="w-full touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        {Array.from({ length: 11 }, (_, i) => i - 5).map((i) => (<line key={`vg${i}`} x1={cx + i * scale} y1={20} x2={cx + i * scale} y2={380} stroke="#f1f5f9" />))}
        {Array.from({ length: 9 }, (_, i) => i - 4).map((i) => (<line key={`hg${i}`} x1={40} y1={cy + i * scale} x2={480} y2={cy + i * scale} stroke="#f1f5f9" />))}
        <line x1="40" y1={cy} x2="480" y2={cy} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={cx} y1="20" x2={cx} y2="380" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="486" y={cy + 4} fill="#64748b" fontSize="12">Re</text>
        <text x={cx + 6} y="18" fill="#64748b" fontSize="12">Im</text>
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={px} y1={py} x2={px} y2={cy} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={cx} y1={py} x2={px} y2={py} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={px} cy={py} r="11" fill="#6366f1" stroke="#fff" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
        <text x={px + 14} y={py - 8} fill="#312e81" fontSize="14" fontWeight="700">z</text>
      </svg>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-white p-3 shadow-sm text-center"><div className="text-[10px] uppercase text-slate-500">Real</div><div className="text-xl font-bold text-indigo-600">{point.x.toFixed(1)}</div></div>
        <div className="rounded-xl bg-white p-3 shadow-sm text-center"><div className="text-[10px] uppercase text-slate-500">Imag</div><div className="text-xl font-bold text-blue-600">{point.y.toFixed(1)}</div></div>
        <div className="rounded-xl bg-indigo-50 p-3 shadow-sm text-center"><div className="text-[10px] uppercase text-indigo-700">|z|</div><div className="text-xl font-bold text-indigo-700">{modulus.toFixed(2)}</div></div>
        <div className="rounded-xl bg-blue-50 p-3 shadow-sm text-center"><div className="text-[10px] uppercase text-blue-700">arg(z)</div><div className="text-xl font-bold text-blue-700">{argDeg.toFixed(0)}°</div></div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-indigo-500 bg-white p-3 text-sm">
        <span className="font-mono">z = {point.x.toFixed(1)} {sign} {absY}i</span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Polar form converter
// ============================================================================
function PolarFormDemo() {
  const [r, setR] = useState(2);
  const [theta, setTheta] = useState(60);
  const rad = (theta * Math.PI) / 180;
  const a = r * Math.cos(rad);
  const b = r * Math.sin(rad);
  const px = 200 + a * 50;
  const py = 200 - b * 50;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Move r and θ sliders to see polar ↔ rectangular conversion.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">r = {r.toFixed(1)}</span><input type="range" min={0.5} max={4} step={0.1} value={r} onChange={(e) => setR(parseFloat(e.target.value))} className="flex-1 accent-indigo-500" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">θ = {theta}°</span><input type="range" min={0} max={360} value={theta} onChange={(e) => setTheta(parseInt(e.target.value))} className="flex-1 accent-blue-500" /></div>
      </div>
      <svg viewBox="0 0 400 400" className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-inner">
        <circle cx="200" cy="200" r={r * 50} fill="none" stroke="#c7d2fe" strokeDasharray="4 4" />
        <line x1="20" y1="200" x2="380" y2="200" stroke="#cbd5e1" />
        <line x1="200" y1="20" x2="200" y2="380" stroke="#cbd5e1" />
        <line x1="200" y1="200" x2={px} y2={py} stroke="#6366f1" strokeWidth="3" />
        <path d={`M ${230} 200 A 30 30 0 ${theta > 180 ? 1 : 0} ${0} ${200 + 30 * Math.cos(rad)} ${200 - 30 * Math.sin(rad)}`} fill="none" stroke="#3b82f6" strokeWidth="2" />
        <text x="240" y="195" fontSize="12" fill="#1e40af">θ</text>
        <circle cx={px} cy={py} r="8" fill="#6366f1" stroke="#fff" strokeWidth="2" />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-indigo-50 p-3 text-center"><div className="text-[10px] uppercase text-indigo-700">Polar</div><div className="font-mono text-sm font-bold text-indigo-800">{r.toFixed(1)} · (cos {theta}° + i sin {theta}°)</div></div>
        <div className="rounded-xl bg-blue-50 p-3 text-center"><div className="text-[10px] uppercase text-blue-700">Rectangular</div><div className="font-mono text-sm font-bold text-blue-800">{a.toFixed(2)} + {b.toFixed(2)}i</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Multiplication as rotation
// ============================================================================
function MultiplicationDemo() {
  const [z1, setZ1] = useState({ r: 1.5, theta: 30 });
  const [z2, setZ2] = useState({ r: 1.2, theta: 60 });

  const rad1 = (z1.theta * Math.PI) / 180;
  const rad2 = (z2.theta * Math.PI) / 180;
  const z1pt = { x: z1.r * Math.cos(rad1), y: z1.r * Math.sin(rad1) };
  const z2pt = { x: z2.r * Math.cos(rad2), y: z2.r * Math.sin(rad2) };
  const prodR = z1.r * z2.r;
  const prodTheta = z1.theta + z2.theta;
  const prodRad = (prodTheta * Math.PI) / 180;
  const prodPt = { x: prodR * Math.cos(prodRad), y: prodR * Math.sin(prodRad) };

  const toX = (x: number) => 200 + x * 50;
  const toY = (y: number) => 200 - y * 50;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Multiplying complex numbers = multiply moduli, add arguments.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-20 text-xs font-mono text-blue-700">z₁: r={z1.r.toFixed(1)} θ={z1.theta}°</span><input type="range" min={0.5} max={3} step={0.1} value={z1.r} onChange={(e) => setZ1({ ...z1, r: parseFloat(e.target.value) })} className="flex-1 accent-blue-500" /><input type="range" min={0} max={180} value={z1.theta} onChange={(e) => setZ1({ ...z1, theta: parseInt(e.target.value) })} className="flex-1 accent-blue-500" /></div>
        <div className="flex items-center gap-2"><span className="w-20 text-xs font-mono text-violet-700">z₂: r={z2.r.toFixed(1)} θ={z2.theta}°</span><input type="range" min={0.5} max={3} step={0.1} value={z2.r} onChange={(e) => setZ2({ ...z2, r: parseFloat(e.target.value) })} className="flex-1 accent-violet-500" /><input type="range" min={0} max={180} value={z2.theta} onChange={(e) => setZ2({ ...z2, theta: parseInt(e.target.value) })} className="flex-1 accent-violet-500" /></div>
      </div>
      <svg viewBox="0 0 400 400" className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-inner">
        <line x1="20" y1="200" x2="380" y2="200" stroke="#cbd5e1" />
        <line x1="200" y1="20" x2="200" y2="380" stroke="#cbd5e1" />
        <line x1="200" y1="200" x2={toX(z1pt.x)} y2={toY(z1pt.y)} stroke="#3b82f6" strokeWidth="2.5" />
        <line x1="200" y1="200" x2={toX(z2pt.x)} y2={toY(z2pt.y)} stroke="#a855f7" strokeWidth="2.5" />
        <line x1="200" y1="200" x2={toX(prodPt.x)} y2={toY(prodPt.y)} stroke="#ec4899" strokeWidth="3" />
        <circle cx={toX(z1pt.x)} cy={toY(z1pt.y)} r="6" fill="#3b82f6" /><text x={toX(z1pt.x) + 8} y={toY(z1pt.y)} fontSize="12" fill="#1e40af" fontWeight="700">z₁</text>
        <circle cx={toX(z2pt.x)} cy={toY(z2pt.y)} r="6" fill="#a855f7" /><text x={toX(z2pt.x) + 8} y={toY(z2pt.y)} fontSize="12" fill="#6b21a8" fontWeight="700">z₂</text>
        <circle cx={toX(prodPt.x)} cy={toY(prodPt.y)} r="8" fill="#ec4899" /><text x={toX(prodPt.x) + 10} y={toY(prodPt.y)} fontSize="13" fill="#9d174d" fontWeight="700">z₁·z₂</text>
      </svg>
      <div className="mt-3 rounded-xl bg-pink-50 p-3 text-center">
        <span className="font-mono text-sm font-bold text-pink-700">|z₁z₂| = {prodR.toFixed(2)}, arg(z₁z₂) = {prodTheta}°</span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: nth roots of unity
// ============================================================================
function RootsOfUnityDemo() {
  const [n, setN] = useState(5);
  const cx = 200, cy = 200, r = 150;
  const pts = Array.from({ length: n }, (_, k) => {
    const angle = (2 * Math.PI * k) / n;
    return { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle), angle: (360 * k) / n };
  });
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">nth roots of unity — n equally-spaced points on the unit circle.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">n =</span>
        <input type="range" min={2} max={12} value={n} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-indigo-500" />
        <span className="w-8 text-center text-lg font-bold text-indigo-600">{n}</span>
      </div>
      <svg viewBox="0 0 400 400" className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-inner">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="40" y1={cy} x2="360" y2={cy} stroke="#e2e8f0" />
        <line x1={cx} y1="40" x2={cx} y2="360" stroke="#e2e8f0" />
        {pts.map((p, k) => (
          <g key={k}>
            <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
            <circle cx={p.x} cy={p.y} r="8" fill="#6366f1" stroke="#fff" strokeWidth="2" />
            <text x={p.x + 12} y={p.y + 4} fontSize="11" fill="#3730a3">ω<tspan baselineShift="sub" fontSize="9">{k}</tspan></text>
          </g>
        ))}
      </svg>
      <div className="mt-3 rounded-xl bg-white p-3 text-center shadow-sm">
        <span className="font-mono text-sm text-slate-700">ω<sub>k</sub> = cos(2πk/{n}) + i sin(2πk/{n}), k = 0..{n - 1}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Quadratic discriminant
// ============================================================================
function QuadraticDiscriminantDemo() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-4);
  const [c, setC] = useState(5);
  const disc = b * b - 4 * a * c;
  const toX = (x: number) => 200 + x * 50;
  const toY = (y: number) => 200 - y * 20;
  const pts = [];
  for (let x = -4; x <= 4; x += 0.1) pts.push(`${pts.length === 0 ? "M" : "L"}${toX(x)},${toY(a * x * x + b * x + c)}`);

  const roots = disc >= 0
    ? [(-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a)]
    : null;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">ax² + bx + c — discriminant D = b² − 4ac decides root type.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">a={a}</span><input type="range" min={-3} max={3} value={a} onChange={(e) => setA(parseInt(e.target.value) || 1)} className="flex-1 accent-indigo-500" /></div>
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">b={b}</span><input type="range" min={-6} max={6} value={b} onChange={(e) => setB(parseInt(e.target.value))} className="flex-1 accent-blue-500" /></div>
        <div className="flex items-center gap-2"><span className="w-12 text-xs font-mono">c={c}</span><input type="range" min={-6} max={6} value={c} onChange={(e) => setC(parseInt(e.target.value))} className="flex-1 accent-violet-500" /></div>
      </div>
      <svg viewBox="0 0 400 400" className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-inner">
        <line x1="20" y1="200" x2="380" y2="200" stroke="#cbd5e1" />
        <line x1="200" y1="20" x2="200" y2="380" stroke="#cbd5e1" />
        <path d={pts.join(" ")} fill="none" stroke="#6366f1" strokeWidth="3" />
        {roots && roots.map((r, i) => (<circle key={i} cx={toX(r)} cy={toY(0)} r="6" fill="#ef4444" stroke="#fff" strokeWidth="2" />))}
      </svg>
      <div className={"mt-3 rounded-xl border-l-4 p-3 text-sm " + (disc > 0 ? "border-emerald-500 bg-emerald-50 text-emerald-800" : disc === 0 ? "border-amber-500 bg-amber-50 text-amber-800" : "border-rose-500 bg-rose-50 text-rose-800")}>
        D = {b}² − 4·{a}·{c} = <strong>{disc}</strong> →{" "}
        {disc > 0 ? "two distinct real roots" : disc === 0 ? "one repeated real root" : "two complex conjugate roots"}
      </div>
    </div>
  );
}

export default function ComplexNumbersVizPremium() {
  const demos: DemoTab[] = [
    { id: "argand", title: "Argand plane", emoji: "🎯", render: () => <ArgandDemo /> },
    { id: "polar", title: "Polar form", emoji: "🧭", render: () => <PolarFormDemo /> },
    { id: "multiply", title: "Multiplication", emoji: "✖️", render: () => <MultiplicationDemo /> },
    { id: "roots", title: "Roots of unity", emoji: "🎡", render: () => <RootsOfUnityDemo /> },
    { id: "discriminant", title: "Discriminant", emoji: "📉", render: () => <QuadraticDiscriminantDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-indigo-50 via-blue-50 to-slate-50" />;
}
