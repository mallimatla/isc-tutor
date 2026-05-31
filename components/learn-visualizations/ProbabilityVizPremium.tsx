"use client";
import { useState, useCallback } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

// ============================================================================
// Demo 1: Ball-pick simulator (empirical vs theoretical)
// ============================================================================
const BALLS: string[] = [...Array(4).fill("#ef4444"), ...Array(3).fill("#3b82f6"), ...Array(3).fill("#22c55e")];
const COLORS = { "#ef4444": "Red", "#3b82f6": "Blue", "#22c55e": "Green" };
const THEORY = { "#ef4444": 0.4, "#3b82f6": 0.3, "#22c55e": 0.3 };

function BallPickDemo() {
  const [picks, setPicks] = useState<string[]>([]);
  const [lastPick, setLastPick] = useState<string | null>(null);

  const pickBall = useCallback(() => {
    const color = BALLS[Math.floor(Math.random() * BALLS.length)];
    setPicks((prev) => [...prev, color]);
    setLastPick(color);
  }, []);

  const reset = () => { setPicks([]); setLastPick(null); };
  const counts: Record<string, number> = {};
  for (const c of picks) counts[c] = (counts[c] || 0) + 1;
  const total = picks.length || 1;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Reality converges to theory as you pick more balls.</h4>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white p-3 shadow-inner">
        {BALLS.map((c, i) => (
          <div key={i} className="h-8 w-8 rounded-full shadow-sm" style={{ backgroundColor: c, opacity: lastPick === c ? 1 : 0.6, transform: lastPick === c ? "scale(1.2)" : "scale(1)", transition: "all 0.2s" }} />
        ))}
      </div>
      <div className="mb-3 flex items-center justify-center gap-3">
        <button onClick={pickBall} className="rounded-full bg-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow">Pick</button>
        <button onClick={() => { for (let i = 0; i < 20; i++) setTimeout(pickBall, i * 30); }} className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow">×20</button>
        <button onClick={reset} className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-600">Reset</button>
        <span className="text-sm text-slate-500">{picks.length}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(Object.entries(COLORS) as [string, string][]).map(([hex, name]) => {
          const empirical = (counts[hex] || 0) / total;
          const theoretical = THEORY[hex as keyof typeof THEORY];
          return (
            <div key={hex} className="rounded-xl border bg-white p-3" style={{ borderColor: hex + "40" }}>
              <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: hex }} /><span className="text-[10px] uppercase text-slate-500">{name}</span></div>
              <div className="mt-1 text-xl font-bold" style={{ color: hex }}>{picks.length > 0 ? `${(empirical * 100).toFixed(0)}%` : "—"}</div>
              <div className="text-[10px] text-slate-400">th: {(theoretical * 100).toFixed(0)}%</div>
              <div className="mt-1 h-1.5 rounded-full bg-zinc-100"><div className="h-1.5 rounded-full" style={{ width: `${empirical * 100}%`, backgroundColor: hex }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Two-dice sum histogram
// ============================================================================
function TwoDiceDemo() {
  const [rolls, setRolls] = useState<number[]>([]);
  const counts: Record<number, number> = {};
  for (const r of rolls) counts[r] = (counts[r] || 0) + 1;
  const theory: Record<number, number> = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };
  const max = Math.max(...Object.values(counts), 6);
  const roll = () => setRolls((r) => [...r, Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6)]);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Sum of two dice. 7 is the most likely — there are 6 ways to make it.</h4>
      <div className="mb-3 flex justify-center gap-3">
        <button onClick={roll} className="rounded-full bg-cyan-600 px-5 py-2 text-sm font-semibold text-white">Roll once</button>
        <button onClick={() => { for (let i = 0; i < 50; i++) setTimeout(roll, i * 20); }} className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white">Roll 50×</button>
        <button onClick={() => setRolls([])} className="rounded-full border border-zinc-300 px-4 py-2 text-sm">Reset</button>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="flex h-32 items-end justify-center gap-1">
          {Object.keys(theory).map((k) => {
            const n = parseInt(k);
            const c = counts[n] || 0;
            const t = theory[n] / 36;
            return (
              <div key={n} className="flex flex-1 flex-col items-center">
                <div className="relative w-full">
                  <div className="absolute bottom-0 w-full rounded-t bg-cyan-200" style={{ height: `${(t / (6 / 36)) * 100}%`, opacity: 0.4 }} />
                  <div className="absolute bottom-0 w-full rounded-t bg-cyan-600" style={{ height: `${(c / max) * 100}%` }} />
                </div>
                <span className="mt-1 text-[10px] font-mono text-slate-600">{n}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-center text-xs text-slate-500">Rolls: {rolls.length}. Solid = empirical, light = theoretical.</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Conditional probability tree (Bayes-style)
// ============================================================================
function ConditionalTreeDemo() {
  const [pA, setPA] = useState(0.4);
  const [pBgivenA, setPBgivenA] = useState(0.7);
  const [pBgivenNotA, setPBgivenNotA] = useState(0.2);
  const pAB = pA * pBgivenA;
  const pNotAB = (1 - pA) * pBgivenNotA;
  const pB = pAB + pNotAB;
  const pAgivenB = pAB / pB;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Bayes' theorem — slide the probabilities to update P(A|B)."}</h4>
      <div className="mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-inner text-xs">
        <div className="flex items-center gap-2"><span className="w-24 font-mono">P(A) = {pA.toFixed(2)}</span><input type="range" min={0} max={1} step={0.05} value={pA} onChange={(e) => setPA(parseFloat(e.target.value))} className="flex-1 accent-cyan-500" /></div>
        <div className="flex items-center gap-2"><span className="w-24 font-mono">P(B|A) = {pBgivenA.toFixed(2)}</span><input type="range" min={0} max={1} step={0.05} value={pBgivenA} onChange={(e) => setPBgivenA(parseFloat(e.target.value))} className="flex-1 accent-sky-500" /></div>
        <div className="flex items-center gap-2"><span className="w-24 font-mono">{"P(B|A') = "}{pBgivenNotA.toFixed(2)}</span><input type="range" min={0} max={1} step={0.05} value={pBgivenNotA} onChange={(e) => setPBgivenNotA(parseFloat(e.target.value))} className="flex-1 accent-blue-500" /></div>
      </div>
      <svg viewBox="0 0 400 280" className="w-full rounded-2xl bg-white shadow-inner">
        <circle cx="50" cy="140" r="18" fill="#06b6d4" /><text x="50" y="145" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">Ω</text>
        <line x1="68" y1="130" x2="160" y2="60" stroke="#06b6d4" strokeWidth="2" />
        <text x="100" y="90" fontSize="11" fill="#0e7490">P(A)={pA.toFixed(2)}</text>
        <line x1="68" y1="150" x2="160" y2="220" stroke="#06b6d4" strokeWidth="2" />
        <text x="100" y="200" fontSize="11" fill="#0e7490">{`P(A')=${(1 - pA).toFixed(2)}`}</text>
        <circle cx="180" cy="60" r="16" fill="#3b82f6" /><text x="180" y="65" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">A</text>
        <circle cx="180" cy="220" r="16" fill="#94a3b8" /><text x="180" y="225" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">{"A'"}</text>
        <line x1="196" y1="55" x2="320" y2="40" stroke="#3b82f6" strokeWidth="2" />
        <text x="230" y="50" fontSize="11" fill="#1e40af">P(B|A)={pBgivenA.toFixed(2)}</text>
        <line x1="196" y1="70" x2="320" y2="100" stroke="#3b82f6" strokeWidth="2" />
        <line x1="196" y1="215" x2="320" y2="180" stroke="#94a3b8" strokeWidth="2" />
        <text x="230" y="195" fontSize="11" fill="#475569">{`P(B|A')=${pBgivenNotA.toFixed(2)}`}</text>
        <line x1="196" y1="225" x2="320" y2="245" stroke="#94a3b8" strokeWidth="2" />
        <text x="340" y="45" fontSize="13" fill="#1e40af">B: {pAB.toFixed(3)}</text>
        <text x="340" y="105" fontSize="13" fill="#1e40af">{"B'"}</text>
        <text x="340" y="185" fontSize="13" fill="#475569">B: {pNotAB.toFixed(3)}</text>
        <text x="340" y="250" fontSize="13" fill="#475569">{"B'"}</text>
      </svg>
      <div className="mt-3 rounded-xl bg-cyan-50 p-3 text-center">
        <div className="font-mono text-sm text-cyan-800">P(B) = {pB.toFixed(3)}</div>
        <div className="font-mono text-xl font-bold text-cyan-700">P(A|B) = {pAgivenB.toFixed(3)}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Coin flip — number of heads in n flips
// ============================================================================
function CoinFlipDemo() {
  const [flips, setFlips] = useState<("H" | "T")[]>([]);
  const flip = () => setFlips((f) => [...f, Math.random() < 0.5 ? "H" : "T"]);
  const flipMany = () => { for (let i = 0; i < 100; i++) setTimeout(flip, i * 10); };
  const heads = flips.filter((f) => f === "H").length;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Coin flip — heads ratio should approach 50% (Law of Large Numbers).</h4>
      <div className="mb-3 flex justify-center gap-3">
        <button onClick={flip} className="rounded-full bg-cyan-600 px-5 py-2 text-sm font-semibold text-white">Flip</button>
        <button onClick={flipMany} className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white">×100</button>
        <button onClick={() => setFlips([])} className="rounded-full border border-zinc-300 px-4 py-2 text-sm">Reset</button>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div><div className="text-[10px] uppercase text-amber-700">Heads</div><div className="text-3xl font-bold text-amber-600">{heads}</div></div>
          <div><div className="text-[10px] uppercase text-slate-700">Tails</div><div className="text-3xl font-bold text-slate-600">{flips.length - heads}</div></div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500" style={{ width: `${(heads / Math.max(1, flips.length)) * 100}%` }} />
        </div>
        <div className="mt-1 text-center text-xs text-slate-500">{flips.length > 0 ? `${((heads / flips.length) * 100).toFixed(1)}% heads` : "Flip to start"}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Independence vs dependence (sample with/without replacement)
// ============================================================================
function ReplacementDemo() {
  const [withRep, setWithRep] = useState(true);
  // Box has 5 red, 5 blue. Pick 2.
  // With replacement: P(2 red) = (5/10)^2 = 0.25
  // Without: P(2 red) = (5/10)*(4/9) = 0.222
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">5 red, 5 blue. Pick 2. Replacement changes the second probability.</h4>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setWithRep(true)} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold " + (withRep ? "bg-cyan-600 text-white" : "bg-white text-slate-600")}>With replacement</button>
        <button onClick={() => setWithRep(false)} className={"flex-1 rounded-full px-3 py-1.5 text-sm font-semibold " + (!withRep ? "bg-cyan-600 text-white" : "bg-white text-slate-600")}>Without</button>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="mb-3 text-xs uppercase text-slate-500">Box</div>
        <div className="mb-3 flex justify-center gap-1">
          {Array(5).fill(0).map((_, i) => <div key={"r" + i} className="h-7 w-7 rounded-full bg-red-500" />)}
          {Array(5).fill(0).map((_, i) => <div key={"b" + i} className="h-7 w-7 rounded-full bg-blue-500" />)}
        </div>
        <div className="space-y-2">
          <div className="rounded-lg border border-cyan-200 p-2">
            <span className="text-xs text-slate-600">First pick red:</span> <span className="font-mono font-bold text-cyan-700">5/10 = 0.500</span>
          </div>
          <div className="rounded-lg border border-cyan-200 p-2">
            <span className="text-xs text-slate-600">Second pick red {withRep ? "(box restored)" : "(one red removed)"}:</span>{" "}
            <span className="font-mono font-bold text-cyan-700">{withRep ? "5/10 = 0.500" : "4/9 ≈ 0.444"}</span>
          </div>
          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-2">
            <span className="text-xs text-slate-600">P(both red):</span>{" "}
            <span className="font-mono text-base font-bold text-emerald-700">{withRep ? (0.5 * 0.5).toFixed(3) : (5 / 10 * 4 / 9).toFixed(3)}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-cyan-500 bg-cyan-50 p-3 text-xs">
        {withRep ? "Events are independent — second pick doesn't 'know' about the first." : "Events are dependent — second probability depends on first pick."}
      </div>
    </div>
  );
}

export default function ProbabilityVizPremium() {
  const demos: DemoTab[] = [
    { id: "balls", title: "Ball picks", emoji: "🎱", render: () => <BallPickDemo /> },
    { id: "dice", title: "Two-dice sum", emoji: "🎲", render: () => <TwoDiceDemo /> },
    { id: "bayes", title: "Bayes tree", emoji: "🌳", render: () => <ConditionalTreeDemo /> },
    { id: "coin", title: "Coin flip", emoji: "🪙", render: () => <CoinFlipDemo /> },
    { id: "rep", title: "Replacement?", emoji: "🔁", render: () => <ReplacementDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-cyan-50 via-sky-50 to-blue-50" />;
}
