"use client";

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 32, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="20" cy="20" r="19" fill="#18181b" stroke="#3f3f46" strokeWidth="0.5" />
        {/* Integral symbol forming stylized 'i' */}
        <path
          d="M22 8c-2 0-3.5 1.5-3.5 3l-1 18c-.2 1.5-1.5 3-3.5 3"
          stroke="#60a5fa"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Dot above */}
        <circle cx="23" cy="6" r="1.8" fill="#60a5fa" />
        {/* Sigma accent */}
        <path
          d="M26 16l4-3h-5l5 6h-5l4 3"
          stroke="#a78bfa"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
        />
        {/* Grid lines */}
        <line x1="8" y1="20" x2="13" y2="20" stroke="#3f3f46" strokeWidth="0.4" opacity="0.5" />
        <line x1="10.5" y1="17" x2="10.5" y2="23" stroke="#3f3f46" strokeWidth="0.4" opacity="0.5" />
      </svg>
      {showText && (
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          ISC Tutor
        </span>
      )}
    </div>
  );
}
