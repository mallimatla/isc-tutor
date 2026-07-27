"use client";
import { useState, useEffect, useRef } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

function useClock() {
  const [t, setT] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      if (start.current === null) start.current = now;
      setT((now - start.current) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

// ============================================================================
// Demo 1: Charge circling in a magnetic field
// ============================================================================
function CyclotronDemo() {
  const t = useClock();
  const [v, setV] = useState(50);
  const [B, setB] = useState(50);
  const radius = (v / B) * 40; // r = mv/qB
  const R = Math.max(12, Math.min(58, radius));
  const omega = (B / 30);
  const angle = t * omega;
  const cx = 130 + R * Math.cos(angle);
  const cy = 75 + R * Math.sin(angle);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        A magnetic field bends a moving charge into a circle — the basis of the cyclotron.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 260 150" className="h-auto w-full">
          {/* field into page dots */}
          {[...Array(5)].map((_, i) =>
            [...Array(3)].map((_, j) => (
              <text key={`${i}-${j}`} x={40 + i * 45} y={40 + j * 40} textAnchor="middle" fontSize="10" fill="#cbd5e1">✕</text>
            ))
          )}
          <circle cx={130} cy={75} r={R} fill="none" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={6} fill="#7c3aed" />
        </svg>
        <div className="text-center text-[10px] text-slate-400">✕ = magnetic field into the page</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Speed v = <span className="font-bold text-violet-700">{v}</span>
          <input type="range" min={20} max={90} value={v} onChange={(e) => setV(+e.target.value)} className="mt-1 w-full accent-violet-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Field B = <span className="font-bold text-violet-700">{B}</span>
          <input type="range" min={20} max={90} value={B} onChange={(e) => setB(+e.target.value)} className="mt-1 w-full accent-violet-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        r = mv / qB → faster charge, bigger circle; stronger field, tighter circle.
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Field around a straight wire (right-hand rule)
// ============================================================================
function WireFieldDemo() {
  const [I, setI] = useState(50);
  const rings = [18, 32, 46];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Current in a wire wraps a magnetic field around it — grip with your right hand, thumb along I.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 260 130" className="h-auto w-full">
          <line x1={130} y1={10} x2={130} y2={120} stroke="#dc2626" strokeWidth={3} markerEnd="url(#mc-a)" />
          {rings.map((rad) => (
            <ellipse key={rad} cx={130} cy={65} rx={rad} ry={rad * 0.35} fill="none" stroke="#3b82f6" strokeWidth={Math.max(0.6, (I / 50) * (1 - rad / 70))} />
          ))}
          <defs>
            <marker id="mc-a" markerWidth="9" markerHeight="9" refX="4" refY="6" orient="auto">
              <path d="M0,6 L4,0 L8,6 Z" fill="#dc2626" />
            </marker>
          </defs>
          <text x={140} y={16} fontSize="9" fill="#dc2626">I</text>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Current I = <span className="font-bold text-violet-700">{I}</span>
          <input type="range" min={10} max={90} value={I} onChange={(e) => setI(+e.target.value)} className="mt-1 w-full accent-violet-500" />
        </label>
      </div>
      <div className="mt-3 text-center font-mono text-sm text-slate-700">
        B = µ₀I / (2πr) → stronger current or closer in ⇒ stronger field.
      </div>
    </div>
  );
}

export default function MovingChargesMagnetismVizPremium() {
  const demos: DemoTab[] = [
    { id: "cyc", title: "Charge in a field", emoji: "🔄", render: () => <CyclotronDemo /> },
    { id: "wire", title: "Field round a wire", emoji: "🧲", render: () => <WireFieldDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-violet-50 via-purple-50 to-indigo-50" />;
}
