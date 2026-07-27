"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Convex-lens ray diagram
// ============================================================================
function LensDemo() {
  const axisY = 90,
    lensX = 150,
    f = 42,
    ho = 30;
  const [u, setU] = useState(90); // object distance (px, left of lens)
  const xo = lensX - u;
  const objTop = axisY - ho;
  // thin lens: 1/v = 1/f - 1/u  (u,v measured as positive magnitudes here)
  const invV = 1 / f - 1 / u;
  const v = 1 / invV; // >0 real (right), <0 virtual (left)
  const m = -v / u; // magnification (negative ⇒ inverted)
  const imgX = lensX + v;
  const imgTop = axisY - ho * m;
  const real = v > 0;
  const clamp = (val: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, val));
  const ix = clamp(imgX, 6, 294);
  const iy = clamp(imgTop, 6, 174);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Slide the object. Beyond the focus you get a real, flipped image; inside it, a magnified upright one.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 180" className="h-auto w-full">
          <line x1={6} y1={axisY} x2={294} y2={axisY} stroke="#e2e8f0" strokeWidth={1} />
          {/* lens */}
          <ellipse cx={lensX} cy={axisY} rx={9} ry={54} fill="#bfdbfe" opacity={0.6} stroke="#60a5fa" strokeWidth={1.5} />
          {/* foci */}
          {[lensX - f, lensX + f].map((fx) => (
            <text key={fx} x={fx} y={axisY + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">F</text>
          ))}
          {/* object arrow */}
          <line x1={xo} y1={axisY} x2={xo} y2={objTop} stroke="#16a34a" strokeWidth={2.5} markerEnd="url(#ro-g)" />
          {/* ray 1: parallel then through far F */}
          <line x1={xo} y1={objTop} x2={lensX} y2={objTop} stroke="#f59e0b" strokeWidth={1.3} />
          <line x1={lensX} y1={objTop} x2={ix} y2={iy} stroke="#f59e0b" strokeWidth={1.3} />
          {/* ray 2: through centre */}
          <line x1={xo} y1={objTop} x2={ix} y2={iy} stroke="#ef4444" strokeWidth={1.3} />
          {/* image arrow */}
          <line x1={ix} y1={axisY} x2={ix} y2={iy} stroke="#7c3aed" strokeWidth={2.5} markerEnd="url(#ro-v)" />
          <defs>
            <marker id="ro-g" markerWidth="8" markerHeight="8" refX="3" refY="6" orient="auto"><path d="M0,6 L3,0 L6,6 Z" fill="#16a34a" /></marker>
            <marker id="ro-v" markerWidth="8" markerHeight="8" refX="3" refY="6" orient="auto"><path d="M0,6 L3,0 L6,6 Z" fill="#7c3aed" /></marker>
          </defs>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Object distance u = <span className="font-bold text-indigo-700">{(u / f).toFixed(1)}·f</span>
          <input type="range" min={20} max={130} value={u} onChange={(e) => setU(+e.target.value)} className="mt-1 w-full accent-indigo-500" />
        </label>
      </div>
      <div className={"mt-3 rounded-xl border-l-4 bg-white p-3 text-xs font-semibold " + (real ? "border-violet-500 text-violet-700" : "border-emerald-500 text-emerald-700")}>
        {real
          ? `Real, inverted image · magnification ${m.toFixed(2)}×`
          : `Virtual, upright, magnified image ${Math.abs(m).toFixed(1)}× (like a magnifying glass)`}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Refraction & total internal reflection
// ============================================================================
function TIRDemo() {
  const [deg, setDeg] = useState(30); // incidence in glass
  const n1 = 1.5,
    n2 = 1.0;
  const critical = Math.asin(n2 / n1) * (180 / Math.PI); // ≈ 41.8°
  const th1 = (deg * Math.PI) / 180;
  const sin2 = (n1 / n2) * Math.sin(th1);
  const tir = sin2 > 1;
  const th2 = tir ? 0 : Math.asin(sin2);
  const cx = 150,
    cy = 80;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Past the critical angle, light can&apos;t escape the glass — it reflects entirely inside. That&apos;s fibre optics.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 300 160" className="h-auto w-full">
          <rect x={0} y={80} width={300} height={80} fill="#e0f2fe" />
          <text x={8} y={100} fontSize="8" fill="#0369a1">glass (n=1.5)</text>
          <text x={8} y={74} fontSize="8" fill="#94a3b8">air (n=1.0)</text>
          <line x1={cx} y1={20} x2={cx} y2={140} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 3" />
          {/* incident ray from below-left */}
          <line x1={cx - 70 * Math.sin(th1)} y1={cy + 70 * Math.cos(th1)} x2={cx} y2={cy} stroke="#0891b2" strokeWidth={2.5} markerEnd="url(#tir-a)" />
          {/* refracted (air) or reflected (TIR) */}
          {tir ? (
            <line x1={cx} y1={cy} x2={cx + 70 * Math.sin(th1)} y2={cy + 70 * Math.cos(th1)} stroke="#e11d48" strokeWidth={2.5} markerEnd="url(#tir-b)" />
          ) : (
            <line x1={cx} y1={cy} x2={cx + 70 * Math.sin(th2)} y2={cy - 70 * Math.cos(th2)} stroke="#16a34a" strokeWidth={2.5} markerEnd="url(#tir-c)" />
          )}
          <defs>
            {[["tir-a", "#0891b2"], ["tir-b", "#e11d48"], ["tir-c", "#16a34a"]].map(([id, c]) => (
              <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={c} /></marker>
            ))}
          </defs>
        </svg>
      </div>
      <div className="mt-3 rounded-2xl bg-white p-3 shadow-inner">
        <label className="text-xs font-medium text-slate-600">
          Angle of incidence = <span className="font-bold text-cyan-700">{deg}°</span>
          <input type="range" min={5} max={75} value={deg} onChange={(e) => setDeg(+e.target.value)} className="mt-1 w-full accent-cyan-500" />
        </label>
      </div>
      <div className={"mt-3 rounded-xl border-l-4 bg-white p-3 text-xs font-semibold " + (tir ? "border-rose-500 text-rose-700" : "border-emerald-500 text-emerald-700")}>
        {tir ? `Total internal reflection! (critical angle ≈ ${critical.toFixed(0)}°)` : `Refracts out into air at ${(th2 * 180 / Math.PI).toFixed(0)}°. Critical angle ≈ ${critical.toFixed(0)}°.`}
      </div>
    </div>
  );
}

export default function RayOpticsVizPremium() {
  const demos: DemoTab[] = [
    { id: "lens", title: "Lens image", emoji: "🔎", render: () => <LensDemo /> },
    { id: "tir", title: "Total internal reflection", emoji: "💎", render: () => <TIRDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-cyan-50 via-blue-50 to-indigo-50" />;
}
