"use client";

interface SkeletonLoaderProps {
  variant: "question" | "tutor-message";
}

export default function SkeletonLoader({ variant }: SkeletonLoaderProps) {
  if (variant === "question") {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header strip: chapter + difficulty */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-2.5 w-2.5 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700"
              />
            ))}
          </div>
        </div>
        {/* Question body lines */}
        <div className="flex flex-col gap-3">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-[85%] animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-[60%] animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  // tutor-message: three pulsing dots
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500" />
        <span
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
    </div>
  );
}
