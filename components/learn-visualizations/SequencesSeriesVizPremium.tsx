"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: AP vs GP toggle (the original)
// ============================================================================
function APvsGPDemo() {
  const [kind, setKind] = useState<"AP" | "GP">("AP");
  const [a, setA] = useState(2);
  const [d, setD] = useState(3);
  const [r, setR] = useState(1.5);
  const N = 8;
  const terms = Array.from({ length: N }, (_, i) => (kind === "AP" ? a + i * d : a * Math.pow(r, i)));
  const sum = terms.reduce((s, t) => s + t, 0);
  const lastTerm = terms[N - 1];
  const minT = Math.min(...terms, 0), maxT = Math.max(...terms, 0);
  const range = maxT - minT || 1;
  const W = 520, H = 240, padX = 40, padY = 30, chartW = W - 2 * padX, chartH = H - 2 * padY;
  const xFor = (i: number) => padX + (i + 0.5) * (chartW / N);
  const yFor = (t: number) => padY + chartH - ((t - minT) / range) * chartH;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Toggle AP vs GP. Slide a, d, r.</h4>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setKind("AP")} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition " + (kind === "AP" ? "bg-lime-600 text-white" : "bg-white text-slate-600")}>Arithmetic</button>
        <button onClick={() => setKind("GP")} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition " + (kind === "GP" ? "bg-lime-600 text-white" : "bg-white text-slate-600")}>Geometric</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-white shadow-inner">
        <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="#cbd5e1" />
        {kind === "AP"
          ? terms.map((t, i) => (
            <g key={i}>
              <line x1={xFor(i)} y1={yFor(0)} x2={xFor(i)} y2={yFor(t)} stroke="#84cc16" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx={xFor(i)} cy={yFor(t)} r="9" fill="#84cc16" stroke="#fff" strokeWidth="2" />
              <text x={xFor(i)} y={H - padY + 16} fill="#475569" fontSize="11" textAnchor="middle">{i + 1}</text>
            </g>
          ))
          : terms.map((t, i) => {
            const barH = ((t - Math.min(0, minT)) / range) * chartH;
            const barY = t >= 0 ? yFor(t) : yFor(0);
            return (<g key={i}><rect x={xFor(i) - 18} y={barY} width="36" height={Math.abs(barH)} fill="#22c55e" rx="4" /><text x={xFor(i)} y={H - padY + 16} fill="#475569" fontSize="11" textAnchor="middle">{i + 1}</text></g>);
          })}
      </svg>
      <div className="mt-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">a = {a}</span><input type="range" min="-5" max="10" step="1" value={a} onChange={(e) => setA(Number(e.target.value))} className="flex-1 accent-lime-600" /></div>
        {kind === "AP"
          ? <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">d = {d}</span><input type="range" min="-3" max="5" step="1" value={d} onChange={(e) => setD(Number(e.target.value))} className="flex-1 accent-green-600" /></div>
          : <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">r = {r.toFixed(1)}</span><input type="range" min="0.5" max="2" step="0.1" value={r} onChange={(e) => setR(Number(e.target.value))} className="flex-1 accent-emerald-600" /></div>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-lime-50 p-3 text-center"><div className="text-[10px] uppercase text-lime-700">{N}th term</div><div className="text-xl font-bold text-lime-700">{lastTerm.toFixed(2)}</div></div>
        <div className="rounded-xl bg-green-50 p-3 text-center"><div className="text-[10px] uppercase text-green-700">Sum S<sub>{N}</sub></div><div className="text-xl font-bold text-green-700">{sum.toFixed(2)}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: AP sum formula visualizer (n/2 [first + last])
// ============================================================================
function APSumDemo() {
  const [n, setN] = useState(6);
  const [a, setA] = useState(2);
  const [d, setD] = useState(3);
  const last = a + (n - 1) * d;
  const sum = (n / 2) * (a + last);
  const bars = Array.from({ length: n }, (_, i) => a + i * d);
  const maxB = Math.max(...bars, 1);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{'AP sum = n/2 · (first + last). The "pair up the ends" trick.'}</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">n = {n}</span><input type="range" min={2} max={10} value={n} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-lime-600" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">a = {a}</span><input type="range" min={-5} max={10} value={a} onChange={(e) => setA(parseInt(e.target.value))} className="flex-1 accent-green-600" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">d = {d}</span><input type="range" min={-3} max={5} value={d} onChange={(e) => setD(parseInt(e.target.value))} className="flex-1 accent-emerald-600" /></div>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex h-32 items-end justify-center gap-2">
          {bars.map((v, i) => {
            const h = (Math.max(0, v) / Math.max(1, maxB)) * 100;
            return (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-500">{v}</span>
                <div className="w-6 rounded-t bg-gradient-to-t from-lime-500 to-green-400" style={{ height: `${h}%`, minHeight: 4 }} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-500 bg-white p-3 text-sm font-mono">
        S<sub>n</sub> = ({n}/2) · ({a} + {last}) = <span className="text-emerald-600 font-bold">{sum}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Infinite GP sum (only converges if |r| < 1)
// ============================================================================
function InfiniteGPDemo() {
  const [a, setA] = useState(1);
  const [r, setR] = useState(0.5);
  const converges = Math.abs(r) < 1;
  const sum = converges ? a / (1 - r) : Infinity;
  const N = 15;
  const terms = Array.from({ length: N }, (_, i) => a * Math.pow(r, i));
  let cum = 0;
  const cumPath: string[] = [];
  terms.forEach((t, i) => {
    cum += t;
    cumPath.push(`${i === 0 ? "M" : "L"}${30 + i * 30},${180 - Math.min(180, Math.abs(cum) * (converges ? 100 / Math.abs(sum) : 5))}`);
  });
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Infinite GP. If |r| &lt; 1, the partial sums hug a limit S = a/(1−r).</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">a = {a}</span><input type="range" min={1} max={5} value={a} onChange={(e) => setA(parseInt(e.target.value))} className="flex-1 accent-lime-600" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">r = {r.toFixed(2)}</span><input type="range" min={-1.2} max={1.2} step={0.05} value={r} onChange={(e) => setR(parseFloat(e.target.value))} className="flex-1 accent-green-600" /></div>
      </div>
      <svg viewBox="0 0 520 220" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="30" y1="180" x2="500" y2="180" stroke="#cbd5e1" />
        {converges && <line x1="30" y1="80" x2="500" y2="80" stroke="#10b981" strokeDasharray="4 4" />}
        <path d={cumPath.join(" ")} fill="none" stroke="#22c55e" strokeWidth="2.5" />
      </svg>
      <div className={"mt-3 rounded-xl border-l-4 p-3 text-sm font-mono " + (converges ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-rose-500 bg-rose-50 text-rose-800")}>
        {converges ? <>Converges! S<sub>∞</sub> = {a} / (1 − {r.toFixed(2)}) = <strong>{sum.toFixed(3)}</strong></> : <>{"Diverges ❌ |r| ≥ 1 → terms don't shrink → no finite sum."}</>}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: AM, GM, HM comparison
// ============================================================================
function MeansDemo() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(9);
  const AM = (a + b) / 2;
  const GM = Math.sqrt(a * b);
  const HM = (2 * a * b) / (a + b);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">For two positive numbers, AM ≥ GM ≥ HM always.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">a = {a}</span><input type="range" min={1} max={20} value={a} onChange={(e) => setA(parseInt(e.target.value))} className="flex-1 accent-lime-600" /></div>
        <div className="flex items-center gap-2"><span className="w-16 text-xs font-mono">b = {b}</span><input type="range" min={1} max={20} value={b} onChange={(e) => setB(parseInt(e.target.value))} className="flex-1 accent-green-600" /></div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        {[
          { name: "AM (arithmetic)", val: AM, color: "#16a34a" },
          { name: "GM (geometric)", val: GM, color: "#22c55e" },
          { name: "HM (harmonic)", val: HM, color: "#84cc16" },
        ].map((m) => {
          const max = Math.max(a, b);
          return (
            <div key={m.name} className="mb-2">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-600">{m.name}</span>
                <span className="font-mono font-bold" style={{ color: m.color }}>{m.val.toFixed(3)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full" style={{ width: `${(m.val / max) * 100}%`, backgroundColor: m.color }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm">
        AM ≥ GM ≥ HM: {AM.toFixed(2)} ≥ {GM.toFixed(2)} ≥ {HM.toFixed(2)} ✓ (equality only when a = b)
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Compound interest as GP
// ============================================================================
function CompoundInterestDemo() {
  const [P, setP] = useState(1000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);
  const amounts = Array.from({ length: years + 1 }, (_, i) => P * Math.pow(1 + rate / 100, i));
  const final = amounts[years];
  const maxA = Math.max(...amounts);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Compound interest = GP with ratio (1 + r/100). Watch it snowball.</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner">
        <div className="flex items-center gap-2"><span className="w-24 text-xs font-mono">P = ₹{P}</span><input type="range" min={100} max={5000} step={100} value={P} onChange={(e) => setP(parseInt(e.target.value))} className="flex-1 accent-lime-600" /></div>
        <div className="flex items-center gap-2"><span className="w-24 text-xs font-mono">r = {rate}% / yr</span><input type="range" min={1} max={20} value={rate} onChange={(e) => setRate(parseInt(e.target.value))} className="flex-1 accent-green-600" /></div>
        <div className="flex items-center gap-2"><span className="w-24 text-xs font-mono">{years} years</span><input type="range" min={1} max={25} value={years} onChange={(e) => setYears(parseInt(e.target.value))} className="flex-1 accent-emerald-600" /></div>
      </div>
      <svg viewBox="0 0 520 200" className="w-full rounded-2xl bg-white shadow-inner">
        <line x1="30" y1="170" x2="500" y2="170" stroke="#cbd5e1" />
        {amounts.map((a, i) => {
          const x = 30 + (i / years) * 460;
          const y = 170 - (a / maxA) * 140;
          return <circle key={i} cx={x} cy={y} r="4" fill="#16a34a" />;
        })}
        <path d={amounts.map((a, i) => {
          const x = 30 + (i / years) * 460;
          const y = 170 - (a / maxA) * 140;
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        }).join(" ")} fill="none" stroke="#22c55e" strokeWidth="2" />
      </svg>
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-center">
        <div className="text-[10px] uppercase text-emerald-700">After {years} years</div>
        <div className="text-2xl font-bold text-emerald-700">₹{final.toFixed(0)}</div>
        <div className="text-xs text-slate-500">grew by ₹{(final - P).toFixed(0)}</div>
      </div>
    </div>
  );
}

export default function SequencesSeriesVizPremium() {
  const demos: DemoTab[] = [
    { id: "apgp", title: "AP vs GP", emoji: "📈", render: () => <APvsGPDemo /> },
    { id: "apsum", title: "AP sum trick", emoji: "➕", render: () => <APSumDemo /> },
    { id: "inf", title: "Infinite GP", emoji: "∞", render: () => <InfiniteGPDemo /> },
    { id: "means", title: "AM/GM/HM", emoji: "⚖️", render: () => <MeansDemo /> },
    { id: "compound", title: "Compound interest", emoji: "💰", render: () => <CompoundInterestDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-lime-50 via-green-50 to-emerald-50" />;
}
