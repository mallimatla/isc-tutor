"use client";

interface SkeletonLoaderProps {
  variant: "question" | "tutor-thinking";
}

export default function SkeletonLoader({ variant }: SkeletonLoaderProps) {
  if (variant === "question") {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <div className="skeleton-shimmer h-3 w-32 rounded-full" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="skeleton-shimmer h-1.5 w-4 rounded-full" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-[88%] rounded" />
          <div className="skeleton-shimmer h-4 w-[64%] rounded" />
        </div>
      </div>
    );
  }

  // tutor-thinking: three pulsing dots inside a bubble
  return (
    <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-slate-300" />
        <span
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-slate-300"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-slate-300"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
    </div>
  );
}
