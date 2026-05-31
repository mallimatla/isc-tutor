"use client";
import { useState, useRef, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Unit circle drag
// ============================================================================
function UnitCircleDemo() {
  const [angle, setAngle] = useState(Math.PI / 4);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const cx = 200, cy = 200, r = 140;
  const px = cx + r * Math.cos(angle);
  const py = cy - r * Math.sin(angle);
  const sinVal = Math.sin(angle);
  const cosVal = Math.cos(angle);
  const deg = ((angle * 180) / Math.PI + 360) % 360;

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
      setAngle(Math.atan2(cy - local.y, local.x - cx));
    },
    [dragging]
  );

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Drag the dot. Red = sin θ. Blue = cos θ.</h4>
      <svg ref={svgRef} viewBox="0 0 400 400" className="mx-auto w-full max-w-md touch-none select-none rounded-2xl bg-white shadow-inner" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>
        <line x1="40" y1={cy} x2="360" y2={cy} stroke="#e2e8f0" />
        <line x1={cx} y1="40" x2={cx} y2="360" stroke="#e2e8f0" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#f59e0b" strokeWidth="2" />
        <line x1={px} y1={py} x2={px} y2={cy} stroke="#ef4444" strokeWidth="3" strokeDasharray="6 4" />
        <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 4" />
        <text x={px + 4} y={(py + cy) / 2} fill="#ef4444" fontSize="13" fontWeight="600">sin</text>
        <text x={(cx + px) / 2 - 10} y={cy + 18} fill="#3b82f6" fontSize="13" fontWeight="600">cos</text>
        <circle cx={px} cy={py} r="12" fill="#f59e0b" stroke="#fff" strokeWidth="3" className="cursor-grab active:cursor-grabbing" onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)} />
      </svg>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white p-3 shadow-sm text-center"><div className="text-[10px] uppercase text-slate-500">Angle</div><div className="text-2xl font-bold text-amber-600">{deg.toFixed(0)}°</div></div>
        <div className="rounded-xl bg-white p-3 shadow-sm text-center"><div className="text-[10px] uppercase text-red-600">sin</div><div className="text-2xl font-bold text-red-500">{sinVal.toFixed(3)}</div></div>
        <div className="rounded-xl bg-white p-3 shadow-sm text-center"><div className="text-[10px] uppercase text-blue-600">cos</div><div className="text-2xl font-bold text-blue-500">{cosVal.toFixed(3)}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Sine wave with amplitude & frequency sliders
// ============================================================================
function SineWaveDemo() {
  const [A, setA] = useState(1);
  const [omega, setOmega] = useState(1);
  const [phi, setPhi] = useState(0);
  const toSvgX = (x: number) => 30 + ((x + Math.PI) / (2 * Math.PI)) * 460;
  const toSvgY = (y: number) => 130 - y * 50;
  const path = [];
  for (let x = -Math.PI; x <= Math.PI; x += 0.05) {
    const y = A * Math.sin(omega * x + phi);
    path.push(`${path.length === 0 ? "M" : "L"}${toSvgX(x)},${toSvgY(y)}`);
  }
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">y = A sin(ωx + φ) — change A, ω, φ and watch the wave morph.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">A = {A.toFixed(1)}</span><input type="range" min={0.2} max={3} step={0.1} value={A} onChange={(e) => setA(parseFloat(e.target.value))} className="flex-1 accent-amber-500" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">ω = {omega.toFixed(1)}</span><input type="range" min={0.5} max={4} step={0.1} value={omega} onChange={(e) => setOmega(parseFloat(e.target.value))} className="flex-1 accent-orange-500" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">φ = {phi.toFixed(1)}</span><input type="range" min={-Math.PI} max={Math.PI} step={0.1} value={phi} onChange={(e) => setPhi(parseFloat(e.target.value))} className="flex-1 accent-yellow-500" /></div>
      </div>
      <svg viewBox="0 0 520 260" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="30" y1="130" x2="510" y2="130" stroke="#cbd5e1" />
        <line x1="260" y1="20" x2="260" y2="240" stroke="#cbd5e1" />
        <path d={path.join(" ")} fill="none" stroke="#f59e0b" strokeWidth="3" />
      </svg>
      <div className="mt-3 rounded-xl bg-white p-3 text-center shadow-sm">
        <span className="text-xs uppercase text-slate-500">Period = </span>
        <span className="font-mono font-bold text-amber-600">2π / {omega.toFixed(1)} = {(2 * Math.PI / omega).toFixed(2)}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: sin / cos / tan together — slide θ and compare
// ============================================================================
function ThreeFunctionsDemo() {
  const [theta, setTheta] = useState(45);
  const rad = (theta * Math.PI) / 180;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Compare sin θ, cos θ, tan θ for the same angle.</h4>
      <div className="mb-3 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-slate-600 w-16">θ = {theta}°</span>
          <input type="range" min={0} max={360} step={1} value={theta} onChange={(e) => setTheta(parseInt(e.target.value))} className="flex-1 accent-amber-500" />
        </div>
      </div>
      <svg viewBox="0 0 480 220" className="w-full rounded-2xl bg-white shadow-inner">
        {[
          { label: "sin", value: Math.sin(rad), color: "#ef4444", y: 60 },
          { label: "cos", value: Math.cos(rad), color: "#3b82f6", y: 110 },
          { label: "tan", value: Math.tan(rad), color: "#10b981", y: 160 },
        ].map((f) => (
          <g key={f.label}>
            <text x="20" y={f.y + 5} fontSize="14" fontWeight="700" fill={f.color}>{f.label}</text>
            <rect x="70" y={f.y - 12} width="320" height="24" fill="#f1f5f9" rx="4" />
            <line x1="230" y1={f.y - 16} x2="230" y2={f.y + 16} stroke="#94a3b8" />
            <rect
              x={f.value >= 0 ? 230 : 230 + Math.max(-160, f.value * 160)}
              y={f.y - 10}
              width={Math.min(160, Math.abs(f.value * 160))}
              height="20"
              fill={f.color}
              opacity="0.7"
              rx="4"
            />
            <text x={400} y={f.y + 5} fontSize="14" fontFamily="monospace" fontWeight="700" fill={f.color}>
              {isFinite(f.value) ? f.value.toFixed(3) : "∞"}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ============================================================================
// Demo 4: Inverse trig — show domain restriction
// ============================================================================
function InverseTrigDemo() {
  const [func, setFunc] = useState<"sin" | "cos" | "tan">("sin");
  const toSvgX = (x: number) => 40 + (x + 2) * 100;
  const toSvgY = (y: number) => 150 - y * 50;

  let path = "";
  let domain = "";
  let principalBounds = "";
  if (func === "sin") {
    const pts = [];
    for (let x = -1; x <= 1; x += 0.02) pts.push(`${pts.length === 0 ? "M" : "L"}${toSvgX(x)},${toSvgY(Math.asin(x))}`);
    path = pts.join(" ");
    domain = "[-1, 1]";
    principalBounds = "-π/2 ≤ y ≤ π/2";
  } else if (func === "cos") {
    const pts = [];
    for (let x = -1; x <= 1; x += 0.02) pts.push(`${pts.length === 0 ? "M" : "L"}${toSvgX(x)},${toSvgY(Math.acos(x) - Math.PI / 2)}`); // shift for display
    path = pts.join(" ");
    domain = "[-1, 1]";
    principalBounds = "0 ≤ y ≤ π";
  } else {
    const pts = [];
    for (let x = -2; x <= 2; x += 0.05) pts.push(`${pts.length === 0 ? "M" : "L"}${toSvgX(x)},${toSvgY(Math.atan(x))}`);
    path = pts.join(" ");
    domain = "ℝ (all reals)";
    principalBounds = "-π/2 < y < π/2";
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Inverse trig functions — each has a restricted range.</h4>
      <div className="mb-3 flex gap-2">
        {(["sin", "cos", "tan"] as const).map((f) => (
          <button key={f} onClick={() => setFunc(f)} className={"flex-1 rounded-full px-3 py-2 text-sm font-semibold transition " + (func === f ? "bg-amber-600 text-white" : "bg-white text-slate-600")}>{f}⁻¹</button>
        ))}
      </div>
      <svg viewBox="0 0 480 260" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="40" y1="150" x2="440" y2="150" stroke="#cbd5e1" />
        <line x1="240" y1="20" x2="240" y2="280" stroke="#cbd5e1" />
        <path d={path} fill="none" stroke="#f59e0b" strokeWidth="3" />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-amber-50 p-3 text-center"><div className="text-[10px] uppercase text-amber-700">Domain</div><div className="font-mono text-sm font-bold text-amber-800">{domain}</div></div>
        <div className="rounded-xl bg-orange-50 p-3 text-center"><div className="text-[10px] uppercase text-orange-700">Principal range</div><div className="font-mono text-xs font-bold text-orange-800">{principalBounds}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Pythagorean identity visualizer
// ============================================================================
function PythagoreanIdentityDemo() {
  const [theta, setTheta] = useState(60);
  const rad = (theta * Math.PI) / 180;
  const sin2 = Math.sin(rad) ** 2;
  const cos2 = Math.cos(rad) ** 2;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">sin²θ + cos²θ = 1 — no matter what θ is, the two bars always sum to 1.</h4>
      <div className="mb-3 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="w-16 text-xs font-mono">θ = {theta}°</span>
          <input type="range" min={0} max={360} value={theta} onChange={(e) => setTheta(parseInt(e.target.value))} className="flex-1 accent-amber-500" />
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="mb-2 text-xs font-medium text-slate-500">Length 1 — divided into sin²θ and cos²θ</div>
        <div className="flex h-12 overflow-hidden rounded-xl">
          <div className="bg-red-500 transition-all" style={{ width: `${sin2 * 100}%` }} />
          <div className="bg-blue-500 transition-all" style={{ width: `${cos2 * 100}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-sm font-mono">
          <span className="text-red-600">sin²θ = {sin2.toFixed(3)}</span>
          <span className="text-blue-600">cos²θ = {cos2.toFixed(3)}</span>
        </div>
        <div className="mt-2 text-center font-mono text-lg font-bold text-emerald-600">sum = {(sin2 + cos2).toFixed(3)}</div>
      </div>
    </div>
  );
}

export default function TrigVizPremium() {
  const demos: DemoTab[] = [
    { id: "circle", title: "Unit circle", emoji: "⭕", render: () => <UnitCircleDemo /> },
    { id: "wave", title: "Sine wave", emoji: "🌊", render: () => <SineWaveDemo /> },
    { id: "three", title: "sin/cos/tan", emoji: "📊", render: () => <ThreeFunctionsDemo /> },
    { id: "inverse", title: "Inverse trig", emoji: "↪️", render: () => <InverseTrigDemo /> },
    { id: "pythag", title: "sin²+cos²=1", emoji: "🔺", render: () => <PythagoreanIdentityDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-amber-50 via-orange-50 to-yellow-50" />;
}
