"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

const POOL_COLORS = ["#8b5cf6", "#a855f7", "#c084fc", "#d946ef", "#e879f9", "#ec4899", "#f472b6", "#fb7185", "#fbbf24", "#f59e0b"];

// ============================================================================
// Demo 1: nPr vs nCr calculator
// ============================================================================
function PvsCDemo() {
  const [n, setN] = useState(5);
  const [r, setR] = useState(3);
  const safeR = Math.min(r, n);
  const nFact = factorial(n);
  const rFact = factorial(safeR);
  const nMinusRFact = factorial(n - safeR);
  const nPr = nFact / nMinusRFact;
  const nCr = nPr / rFact;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{"Tap +/− to change n and r. Permutations care about order; combinations don't."}</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="mb-2 text-[10px] font-semibold uppercase text-slate-500">Pool of {n}</div>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold text-white" style={{ backgroundColor: POOL_COLORS[i % POOL_COLORS.length] }}>
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <div className="mb-2 text-[10px] font-semibold uppercase text-slate-500">Pick {safeR}</div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: safeR }, (_, i) => (
            <div key={i} className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-dashed border-violet-300 font-mono text-xs font-bold text-white" style={{ backgroundColor: POOL_COLORS[i % POOL_COLORS.length] + "cc" }}>
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white p-3 shadow-sm text-center">
          <div className="text-[10px] uppercase text-violet-700">n = {n}</div>
          <div className="flex justify-center gap-1.5 mt-1">
            <button onClick={() => setN(Math.max(1, n - 1))} className="h-7 w-7 rounded-full bg-violet-100 font-bold text-violet-700">−</button>
            <button onClick={() => setN(Math.min(10, n + 1))} className="h-7 w-7 rounded-full bg-violet-100 font-bold text-violet-700">+</button>
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm text-center">
          <div className="text-[10px] uppercase text-fuchsia-700">r = {safeR}</div>
          <div className="flex justify-center gap-1.5 mt-1">
            <button onClick={() => setR(Math.max(0, r - 1))} className="h-7 w-7 rounded-full bg-fuchsia-100 font-bold text-fuchsia-700">−</button>
            <button onClick={() => setR(Math.min(n, r + 1))} className="h-7 w-7 rounded-full bg-fuchsia-100 font-bold text-fuchsia-700">+</button>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-violet-50 p-3 text-center"><div className="text-[10px] uppercase text-violet-700"><sup>{n}</sup>P<sub>{safeR}</sub> order matters</div><div className="text-2xl font-bold text-violet-700">{nPr.toLocaleString()}</div></div>
        <div className="rounded-xl bg-fuchsia-50 p-3 text-center"><div className="text-[10px] uppercase text-fuchsia-700"><sup>{n}</sup>C<sub>{safeR}</sub>{" order doesn't"}</div><div className="text-2xl font-bold text-fuchsia-700">{nCr.toLocaleString()}</div></div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Arrangement builder — show ABC, ACB, BAC, BCA, CAB, CBA
// ============================================================================
function ArrangementDemo() {
  const [letters, setLetters] = useState(["A", "B", "C"]);
  const arrangements: string[][] = [];
  const permute = (arr: string[], left: string[]) => {
    if (left.length === 0) arrangements.push(arr);
    else for (let i = 0; i < left.length; i++) permute([...arr, left[i]], [...left.slice(0, i), ...left.slice(i + 1)]);
  };
  permute([], letters);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">All n! ways to arrange {letters.length} letters in a row.</h4>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setLetters((l) => l.length < 5 ? [...l, String.fromCharCode(65 + l.length)] : l)} className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">+ Add letter</button>
        <button onClick={() => setLetters((l) => l.length > 2 ? l.slice(0, -1) : l)} className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold text-slate-700">− Remove</button>
        <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-mono">{letters.length}! = {factorial(letters.length)}</span>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {arrangements.map((a, i) => (
            <div key={i} className="flex gap-0.5 justify-center rounded-lg bg-violet-50 px-2 py-1.5">
              {a.map((c, j) => (<span key={j} className="font-mono text-sm font-bold text-violet-700">{c}</span>))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 3: Pascal's triangle (nCr highlighter)
// ============================================================================
function PascalDemo() {
  const [hoverN, setHoverN] = useState(4);
  const [hoverR, setHoverR] = useState(2);
  const rows = 8;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Tap a cell — see which nCr it represents.</h4>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        {Array.from({ length: rows }, (_, n) => (
          <div key={n} className="flex justify-center gap-1.5">
            {Array.from({ length: n + 1 }, (_, r) => {
              const v = factorial(n) / (factorial(r) * factorial(n - r));
              const active = n === hoverN && r === hoverR;
              return (
                <button key={r} onClick={() => { setHoverN(n); setHoverR(r); }} className={"h-9 w-9 rounded-lg text-xs font-bold transition " + (active ? "scale-125 bg-violet-600 text-white shadow-lg" : "bg-violet-50 text-violet-700 hover:bg-violet-100")}>
                  {v}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-violet-50 p-3 text-center">
        <span className="font-mono text-sm text-violet-800"><sup>{hoverN}</sup>C<sub>{hoverR}</sub> = {factorial(hoverN) / (factorial(hoverR) * factorial(hoverN - hoverR))}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 4: Letters with repetition (MISSISSIPPI style)
// ============================================================================
function WithRepetitionDemo() {
  const WORDS = ["MOM", "PEPPER", "BANANA", "MISSISSIPPI", "BOOK"];
  const [word, setWord] = useState(WORDS[2]);
  const counts: Record<string, number> = {};
  for (const c of word) counts[c] = (counts[c] || 0) + 1;
  let denom = 1;
  for (const k of Object.keys(counts)) denom *= factorial(counts[k]);
  const distinct = factorial(word.length) / denom;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Words with repeated letters — divide by k! for each repeat.</h4>
      <div className="mb-3 flex flex-wrap gap-2">
        {WORDS.map((w) => (
          <button key={w} onClick={() => setWord(w)} className={"rounded-full px-3 py-1.5 text-xs font-semibold " + (word === w ? "bg-violet-600 text-white" : "bg-white text-slate-600")}>{w}</button>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-inner">
        <div className="flex justify-center gap-1">
          {word.split("").map((c, i) => (
            <div key={i} className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 font-mono text-sm font-bold text-violet-700">{c}</div>
          ))}
        </div>
        <div className="mt-3 text-center font-mono text-sm">
          <div className="text-slate-500">{word.length}! / ({Object.entries(counts).map(([, v]) => `${v}!`).join(" · ")})</div>
          <div className="text-slate-500">= {factorial(word.length).toLocaleString()} / {denom}</div>
          <div className="text-2xl font-bold text-violet-700">= {distinct.toLocaleString()}</div>
          <div className="text-xs text-slate-500">distinct arrangements</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 5: Circular arrangements
// ============================================================================
function CircularDemo() {
  const [n, setN] = useState(5);
  const linear = factorial(n);
  const circular = factorial(n - 1);
  const cx = 130, cy = 130, r = 90;
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">In a circle, rotations look the same — so divide linear by n.</h4>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-inner">
        <span className="text-sm font-medium text-slate-600">n =</span>
        <input type="range" min={3} max={8} value={n} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-violet-500" />
        <span className="w-6 text-center text-lg font-bold text-violet-600">{n}</span>
      </div>
      <svg viewBox="0 0 260 260" className="mx-auto rounded-2xl bg-white shadow-inner">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c4b5fd" strokeDasharray="4 4" />
        {Array.from({ length: n }, (_, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2;
          return (
            <g key={i}>
              <circle cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="14" fill={POOL_COLORS[i % POOL_COLORS.length]} stroke="#fff" strokeWidth="2" />
              <text x={cx + r * Math.cos(angle)} y={cy + r * Math.sin(angle) + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">{String.fromCharCode(65 + i)}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white p-3 text-center"><div className="text-[10px] uppercase text-slate-500">Linear: n!</div><div className="text-xl font-bold text-slate-700">{linear.toLocaleString()}</div></div>
        <div className="rounded-xl bg-violet-50 p-3 text-center"><div className="text-[10px] uppercase text-violet-700">Circular: (n−1)!</div><div className="text-xl font-bold text-violet-700">{circular.toLocaleString()}</div></div>
      </div>
    </div>
  );
}

export default function PermutationsVizPremium() {
  const demos: DemoTab[] = [
    { id: "pvc", title: "P vs C", emoji: "🎴", render: () => <PvsCDemo /> },
    { id: "arrange", title: "All arrangements", emoji: "🔀", render: () => <ArrangementDemo /> },
    { id: "pascal", title: "Pascal's triangle", emoji: "🔺", render: () => <PascalDemo /> },
    { id: "repeat", title: "With repetition", emoji: "🔁", render: () => <WithRepetitionDemo /> },
    { id: "circle", title: "Circular", emoji: "⭕", render: () => <CircularDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-violet-50 via-fuchsia-50 to-purple-50" />;
}
