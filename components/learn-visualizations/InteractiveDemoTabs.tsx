"use client";
import { useState, type ReactNode } from "react";

export interface DemoTab {
  id: string;
  title: string;
  emoji?: string;
  render: () => ReactNode;
}

interface Props {
  demos: DemoTab[];
  gradientClass?: string;
}

export default function InteractiveDemoTabs({ demos, gradientClass = "from-slate-50 via-zinc-50 to-slate-50" }: Props) {
  const [active, setActive] = useState(0);
  const current = demos[active] ?? demos[0];

  return (
    <div className={`rounded-3xl bg-gradient-to-br ${gradientClass} p-3 shadow-sm sm:p-5`}>
      <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2">
        {demos.map((d, i) => {
          const isActive = i === active;
          return (
            <button
              key={d.id}
              onClick={() => setActive(i)}
              className={
                "flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm " +
                (isActive
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100")
              }
              aria-pressed={isActive}
            >
              <span className="mr-1">{d.emoji ?? "✨"}</span>
              {d.title}
            </button>
          );
        })}
      </div>
      <div className="rounded-2xl bg-white/60 p-2 sm:p-3">
        {current.render()}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>Demo {active + 1} of {demos.length}</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            disabled={active === 0}
            className="rounded-full bg-white px-3 py-1 font-medium shadow-sm transition hover:bg-slate-100 disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            onClick={() => setActive((a) => Math.min(demos.length - 1, a + 1))}
            disabled={active === demos.length - 1}
            className="rounded-full bg-white px-3 py-1 font-medium shadow-sm transition hover:bg-slate-100 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
