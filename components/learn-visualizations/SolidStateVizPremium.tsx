"use client";
import { useState } from "react";
import InteractiveDemoTabs, { type DemoTab } from "./InteractiveDemoTabs";

type CellType = "sc" | "bcc" | "fcc";

// ============================================================================
// Demo 1: Unit cells
// ============================================================================
function UnitCellDemo() {
  const [cell, setCell] = useState<CellType>("sc");
  const info: Record<CellType, { name: string; atoms: string; packing: string }> = {
    sc: { name: "Simple cubic", atoms: "1", packing: "52.4%" },
    bcc: { name: "Body-centred cubic", atoms: "2", packing: "68%" },
    fcc: { name: "Face-centred cubic", atoms: "4", packing: "74%" },
  };
  // cube corners in a simple 2.5D projection
  const s = 90;
  const ox = 40;
  const oy = 100;
  const dx = 45;
  const dy = -35;
  const corners = [
    [ox, oy],
    [ox + s, oy],
    [ox + s, oy - s],
    [ox, oy - s],
    [ox + dx, oy + dy],
    [ox + s + dx, oy + dy],
    [ox + s + dx, oy - s + dy],
    [ox + dx, oy - s + dy],
  ];
  const bodyCenter = [ox + s / 2 + dx / 2, oy - s / 2 + dy / 2];
  const faceCenters = [
    [ox + s / 2, oy - s / 2],
    [ox + s / 2 + dx, oy - s / 2 + dy],
    [ox + s / 2 + dx / 2, oy - s + dy / 2],
    [ox + s / 2 + dx / 2, oy + dy / 2],
    [ox + dx / 2, oy - s / 2 + dy / 2],
    [ox + s + dx / 2, oy - s / 2 + dy / 2],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  const cur = info[cell];
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        The unit cell is the smallest repeating box of a crystal. Where the atoms sit sets how tightly it packs.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 200 130" className="mx-auto h-40 w-auto">
          {edges.map(([a, b], i) => (
            <line key={i} x1={corners[a][0]} y1={corners[a][1]} x2={corners[b][0]} y2={corners[b][1]} stroke="#94a3b8" strokeWidth={1.2} />
          ))}
          {corners.map((c, i) => (
            <circle key={i} cx={c[0]} cy={c[1]} r={7} fill="#6366f1" />
          ))}
          {cell === "bcc" && <circle cx={bodyCenter[0]} cy={bodyCenter[1]} r={8} fill="#f59e0b" />}
          {cell === "fcc" && faceCenters.map((f, i) => <circle key={i} cx={f[0]} cy={f[1]} r={7} fill="#f59e0b" />)}
        </svg>
      </div>
      <div className="mt-3 flex gap-2">
        {(["sc", "bcc", "fcc"] as CellType[]).map((c) => (
          <button
            key={c}
            onClick={() => setCell(c)}
            className={"flex-1 rounded-full px-2 py-1.5 text-xs font-semibold uppercase transition " + (cell === c ? "bg-slate-900 text-white" : "bg-white text-slate-600")}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
        <div className="rounded-lg bg-indigo-50 p-2">
          <div className="text-[10px] uppercase text-slate-400">Type</div>
          <strong className="text-indigo-600">{cur.name}</strong>
        </div>
        <div className="rounded-lg bg-indigo-50 p-2">
          <div className="text-[10px] uppercase text-slate-400">Atoms/cell</div>
          <strong className="text-indigo-600">{cur.atoms}</strong>
        </div>
        <div className="rounded-lg bg-indigo-50 p-2">
          <div className="text-[10px] uppercase text-slate-400">Packing</div>
          <strong className="text-indigo-600">{cur.packing}</strong>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Demo 2: Point defects
// ============================================================================
function DefectDemo() {
  const [frenkel, setFrenkel] = useState(false);
  const cols = 5;
  const rows = 4;
  const cellsize = 34;
  const cx0 = 25;
  const cy0 = 20;
  // Schottky: remove a cation (2,1) and an anion (3,2)
  const schottkyMissing = new Set(["2-1", "3-2"]);
  // Frenkel: cation at (2,1) displaced to an interstitial spot
  const frenkelMissing = new Set(["2-1"]);
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        Real crystals have gaps. Two common point defects change the lattice in different ways.
      </h4>
      <div className="rounded-2xl bg-white p-3 shadow-inner">
        <svg viewBox="0 0 200 150" className="mx-auto h-40 w-auto">
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const key = `${c}-${r}`;
              const isCation = (r + c) % 2 === 0;
              const missing = frenkel ? frenkelMissing.has(key) : schottkyMissing.has(key);
              const x = cx0 + c * cellsize;
              const y = cy0 + r * cellsize;
              if (missing)
                return <rect key={key} x={x - 8} y={y - 8} width={16} height={16} fill="none" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="2 2" rx={8} />;
              return <circle key={key} cx={x} cy={y} r={isCation ? 7 : 9} fill={isCation ? "#6366f1" : "#f59e0b"} />;
            })
          )}
          {frenkel && <circle cx={cx0 + 2 * cellsize + 17} cy={cy0 + 1 * cellsize + 17} r={7} fill="#6366f1" stroke="#1e1b4b" strokeWidth={1.5} />}
        </svg>
        <div className="mt-1 flex justify-center gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-indigo-500" /> cation
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-amber-500" /> anion
          </span>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setFrenkel(false)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (!frenkel ? "bg-slate-900 text-white" : "bg-white text-slate-600")}
        >
          Schottky
        </button>
        <button
          onClick={() => setFrenkel(true)}
          className={"flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition " + (frenkel ? "bg-slate-900 text-white" : "bg-white text-slate-600")}
        >
          Frenkel
        </button>
      </div>
      <div className="mt-3 rounded-xl border-l-4 border-indigo-400 bg-white p-3 text-xs text-slate-600">
        {frenkel
          ? "Frenkel defect: a smaller ion (usually the cation) leaves its site for an interstitial hole. No ions are lost, so density is unchanged."
          : "Schottky defect: equal numbers of cations and anions are missing to stay neutral. Fewer ions in the same volume, so density decreases."}
      </div>
    </div>
  );
}

export default function SolidStateVizPremium() {
  const demos: DemoTab[] = [
    { id: "unitcell", title: "Unit cells", emoji: "🧊", render: () => <UnitCellDemo /> },
    { id: "defects", title: "Point defects", emoji: "🔀", render: () => <DefectDemo /> },
  ];
  return <InteractiveDemoTabs demos={demos} gradientClass="from-indigo-50 via-blue-50 to-sky-50" />;
}
