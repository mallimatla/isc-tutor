"use client";

interface DifficultyIndicatorProps {
  level: 1 | 2 | 3 | 4 | 5;
}

export default function DifficultyIndicator({
  level,
}: DifficultyIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`inline-block h-1.5 w-4 rounded-full transition ${
              n <= level ? "bg-indigo-500" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        L{level}
      </span>
    </div>
  );
}
