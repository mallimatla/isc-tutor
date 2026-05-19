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
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              n <= level
                ? "bg-blue-600 dark:bg-blue-400"
                : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-zinc-500">Level {level}/5</span>
    </div>
  );
}
