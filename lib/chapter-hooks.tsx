import type { ReactNode } from "react";

export interface ChapterHookData {
  icon: string;
  miniViz: ReactNode;
  mindBlow: { stat: string; label: string };
  realWorld: { emoji: string; label: string }[];
  storyStrip: { emoji: string; title: string; text: string }[];
}

// Shared keyframe injector — placed inside each SVG so animations are guaranteed available
const KF = () => (
  <defs>
    <style>{`
      @keyframes hk-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes hk-pulse { 0%,100% { opacity: 0.7; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.15); } }
      @keyframes hk-float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(0,-8px); } }
      @keyframes hk-grow { from { transform: scaleY(0.2); opacity: 0.3; } to { transform: scaleY(1); opacity: 1; } }
      @keyframes hk-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      @keyframes hk-shimmer { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 60; } }
      @keyframes hk-fade { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
      @keyframes hk-slide { 0%,100% { transform: translateX(0); } 50% { transform: translateX(12px); } }
      @keyframes hk-fall { 0% { transform: rotate(0); } 60% { transform: rotate(-72deg); } 100% { transform: rotate(-72deg); } }
    `}</style>
  </defs>
);

const SVG = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
    <KF />
    {children}
  </svg>
);

// === Class 11 ===

const setsHook: ChapterHookData = {
  icon: "🎯",
  miniViz: (
    <SVG>
      <circle cx="80" cy="60" r="36" fill="#3b82f6" fillOpacity="0.55" stroke="#1d4ed8" strokeWidth="2.5" style={{ animation: "hk-float 2.5s ease-in-out infinite", transformOrigin: "80px 60px" }} />
      <circle cx="120" cy="60" r="36" fill="#a855f7" fillOpacity="0.55" stroke="#7c3aed" strokeWidth="2.5" style={{ animation: "hk-float 2.5s ease-in-out infinite 1.25s", transformOrigin: "120px 60px" }} />
      <text x="60" y="65" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1e3a8a">A</text>
      <text x="140" y="65" textAnchor="middle" fontSize="14" fontWeight="800" fill="#581c87">B</text>
      <circle cx="100" cy="60" r="5" fill="#fbbf24" stroke="#92400e" strokeWidth="1.5" style={{ animation: "hk-pulse 1.4s ease-in-out infinite", transformOrigin: "100px 60px" }} />
    </SVG>
  ),
  mindBlow: { stat: "260M+", label: "Netflix accounts where set intersections decide what you watch tonight" },
  realWorld: [
    { emoji: "🎬", label: "Netflix matches" },
    { emoji: "🛒", label: "Amazon 'frequently bought'" },
    { emoji: "🎵", label: "Spotify Discover Weekly" },
    { emoji: "📱", label: "App permissions" },
    { emoji: "🩺", label: "Symptom diagnosis" },
  ],
  storyStrip: [
    { emoji: "🤔", title: "The problem", text: "How does Spotify decide what songs you'll like?" },
    { emoji: "💡", title: "The trick", text: "Treat each user's taste as a set. Overlap = similarity." },
    { emoji: "✨", title: "The magic", text: "Set algebra runs billions of times a day to power what you see." },
  ],
};

const functionsHook: ChapterHookData = {
  icon: "⚙️",
  miniViz: (
    <SVG>
      <rect x="14" y="48" width="40" height="28" rx="8" fill="#10b981" stroke="#047857" strokeWidth="2" />
      <text x="34" y="68" textAnchor="middle" fontSize="14" fontWeight="800" fill="white">x</text>
      <line x1="54" y1="62" x2="78" y2="62" stroke="#047857" strokeWidth="3" markerEnd="url(#fnArr)" />
      <rect x="78" y="32" width="44" height="60" rx="10" fill="#059669" stroke="#064e3b" strokeWidth="2.5" style={{ animation: "hk-pulse 1.8s ease-in-out infinite", transformOrigin: "100px 62px" }} />
      <text x="100" y="68" textAnchor="middle" fontSize="18" fontWeight="800" fill="white">f</text>
      <line x1="122" y1="62" x2="146" y2="62" stroke="#047857" strokeWidth="3" markerEnd="url(#fnArr)" />
      <rect x="146" y="48" width="40" height="28" rx="8" fill="#10b981" stroke="#047857" strokeWidth="2" />
      <text x="166" y="68" textAnchor="middle" fontSize="14" fontWeight="800" fill="white">y</text>
      <defs>
        <marker id="fnArr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#047857" /></marker>
      </defs>
    </SVG>
  ),
  mindBlow: { stat: "∞", label: "Every Instagram filter is a function: input pixels → output pixels" },
  realWorld: [
    { emoji: "📸", label: "Photo filters" },
    { emoji: "🌡️", label: "°C → °F converter" },
    { emoji: "💱", label: "Currency convert" },
    { emoji: "🚗", label: "Speed → fuel use" },
    { emoji: "🎚️", label: "Volume knob" },
  ],
  storyStrip: [
    { emoji: "🎁", title: "A rule, not a number", text: "A function is a recipe: feed it x, it gives back exactly one y." },
    { emoji: "🔁", title: "It always behaves", text: "Same input twice? Same output twice. No surprises." },
    { emoji: "🌍", title: "Hidden everywhere", text: "Touch ID, GPS distance, weather forecasts — all functions." },
  ],
};

const trigHook: ChapterHookData = {
  icon: "🎡",
  miniViz: (
    <SVG>
      <circle cx="100" cy="60" r="42" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 3" />
      <line x1="56" y1="60" x2="144" y2="60" stroke="#fde68a" strokeWidth="1.5" />
      <line x1="100" y1="16" x2="100" y2="104" stroke="#fde68a" strokeWidth="1.5" />
      <g style={{ animation: "hk-spin 4s linear infinite", transformOrigin: "100px 60px" }}>
        <line x1="100" y1="60" x2="142" y2="60" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="142" cy="60" r="8" fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
      </g>
    </SVG>
  ),
  mindBlow: { stat: "440 Hz", label: "An A note = sine wave hitting your ear 440 times a second" },
  realWorld: [
    { emoji: "🎶", label: "Music & sound" },
    { emoji: "🏗️", label: "Engineering" },
    { emoji: "🛰️", label: "GPS triangulation" },
    { emoji: "🌊", label: "Ocean tides" },
    { emoji: "🎢", label: "Roller coasters" },
  ],
  storyStrip: [
    { emoji: "🎠", title: "Round-and-round", text: "Anything spinning, swinging, or repeating uses trig under the hood." },
    { emoji: "📐", title: "Angle → length", text: "Trig is the bridge between rotations and straight-line distances." },
    { emoji: "🎵", title: "Even your music", text: "Every sound your AirPods play is a stack of sine waves." },
  ],
};

const inductionHook: ChapterHookData = {
  icon: "🁢",
  miniViz: (
    <SVG>
      <line x1="10" y1="98" x2="190" y2="98" stroke="#475569" strokeWidth="2" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect
          key={i}
          x={20 + i * 19}
          y={42}
          width="9"
          height="56"
          rx="2"
          fill={`hsl(${320 + i * 5}, 75%, ${55 - i * 1.5}%)`}
          stroke="#9d174d"
          strokeWidth="1.2"
          style={{
            transformOrigin: `${29 + i * 19}px 98px`,
            animation: `hk-fall 2.5s ease-out infinite ${i * 0.18}s`,
          }}
        />
      ))}
    </SVG>
  ),
  mindBlow: { stat: "1 → ∞", label: "Prove ONE step, prove ALL steps — induction is climbing infinite stairs" },
  realWorld: [
    { emoji: "🁢", label: "Domino chains" },
    { emoji: "🪜", label: "Climbing ladder" },
    { emoji: "🧬", label: "DNA replication" },
    { emoji: "💻", label: "Recursive code" },
    { emoji: "🎯", label: "Lottery proofs" },
  ],
  storyStrip: [
    { emoji: "🛹", title: "The hardest move", text: "Showing something is true for ALL of infinity seems impossible." },
    { emoji: "🪄", title: "The cheat code", text: "Just show: it works once, and each step pushes the next." },
    { emoji: "🌌", title: "Infinity, tamed", text: "Two checks → a proof that covers literally every counting number." },
  ],
};

const complexHook: ChapterHookData = {
  icon: "🌀",
  miniViz: (
    <SVG>
      <line x1="14" y1="60" x2="186" y2="60" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="100" y1="10" x2="100" y2="110" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="182" y="74" fontSize="9" fill="#475569" fontWeight="700">Re</text>
      <text x="104" y="16" fontSize="9" fill="#475569" fontWeight="700">Im</text>
      <g style={{ animation: "hk-spin 5s linear infinite", transformOrigin: "100px 60px" }}>
        <line x1="100" y1="60" x2="140" y2="30" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="140" cy="30" r="9" fill="#6366f1" stroke="#312e81" strokeWidth="2" />
        <text x="148" y="24" fontSize="13" fontWeight="800" fill="#312e81">z</text>
      </g>
    </SVG>
  ),
  mindBlow: { stat: "√−1 = i", label: "Mathematicians invented a new number to solve x² = −1 — and built quantum physics on it" },
  realWorld: [
    { emoji: "📡", label: "Wi-Fi signals" },
    { emoji: "⚛️", label: "Quantum mechanics" },
    { emoji: "🎚️", label: "Audio mixing" },
    { emoji: "🔌", label: "AC circuits" },
    { emoji: "🌈", label: "Fractal art" },
  ],
  storyStrip: [
    { emoji: "🚫", title: "An 'impossible' equation", text: "x² + 1 = 0 has no real solution. But maths refused to give up." },
    { emoji: "🆕", title: "Invent a new number", text: "Define i so that i² = −1. Now you have a whole new plane to play in." },
    { emoji: "🤯", title: "Builds modern tech", text: "Your phone's signal processing literally cannot work without i." },
  ],
};

const inequalitiesHook: ChapterHookData = {
  icon: "⚖️",
  miniViz: (
    <SVG>
      <line x1="14" y1="60" x2="186" y2="60" stroke="#475569" strokeWidth="2" />
      {[-3, -2, -1, 0, 1, 2, 3].map((n) => (
        <g key={n}>
          <line x1={100 + n * 22} y1="54" x2={100 + n * 22} y2="66" stroke="#64748b" strokeWidth="1.5" />
          <text x={100 + n * 22} y="86" textAnchor="middle" fontSize="9" fill="#475569">{n}</text>
        </g>
      ))}
      <rect x="56" y="56" width="130" height="8" fill="#ef4444" rx="2" style={{ animation: "hk-fade 1.8s ease-in-out infinite" }} />
      <circle cx="56" cy="60" r="9" fill="white" stroke="#dc2626" strokeWidth="3" />
      <polygon points="186,60 174,52 174,68" fill="#dc2626" />
    </SVG>
  ),
  mindBlow: { stat: "0 ≤ Cost ≤ Budget", label: "Every business decision is solving inequalities — under the hood" },
  realWorld: [
    { emoji: "🛒", label: "Shopping budget" },
    { emoji: "🚦", label: "Speed limits" },
    { emoji: "💊", label: "Drug dosage range" },
    { emoji: "🏗️", label: "Load tolerance" },
    { emoji: "🌡️", label: "Body temp range" },
  ],
  storyStrip: [
    { emoji: "⚖️", title: "Not equality", text: "Sometimes 'equal' is too strict. Real life lives between min and max." },
    { emoji: "📏", title: "A region, not a point", text: "Solutions become rays, half-planes, or whole regions." },
    { emoji: "💸", title: "Everywhere", text: "From your shopping cart to airline pricing — inequalities run the show." },
  ],
};

const permsHook: ChapterHookData = {
  icon: "🎴",
  miniViz: (
    <SVG>
      {["A", "B", "C", "D"].map((c, i) => (
        <g key={i} style={{ animation: `hk-float 2.5s ease-in-out infinite ${i * 0.3}s`, transformOrigin: `${44 + i * 36}px 62px` }}>
          <rect x={26 + i * 36} y="36" width="32" height="50" rx="5" fill="#a855f7" stroke="#581c87" strokeWidth="2.5" />
          <text x={42 + i * 36} y="66" textAnchor="middle" fontSize="18" fontWeight="800" fill="white">{c}</text>
        </g>
      ))}
    </SVG>
  ),
  mindBlow: { stat: "52! ≈ 8 × 10⁶⁷", label: "Shuffle a deck — odds are NO ONE in history has ever seen that exact order" },
  realWorld: [
    { emoji: "🔐", label: "PIN codes" },
    { emoji: "🃏", label: "Card shuffles" },
    { emoji: "🏁", label: "Race podiums" },
    { emoji: "🍕", label: "Menu combos" },
    { emoji: "🧬", label: "DNA sequences" },
  ],
  storyStrip: [
    { emoji: "❓", title: "Counting without listing", text: "How many ways to arrange 10 people? 3.6 million. Don't try to list them." },
    { emoji: "✨", title: "Order matters or not", text: "P counts arrangements (order), C counts selections (no order)." },
    { emoji: "🃏", title: "Vegas runs on this", text: "Every casino game odd is a permutation/combination calculation." },
  ],
};

const binomialHook: ChapterHookData = {
  icon: "🔺",
  miniViz: (
    <SVG>
      {[0, 1, 2, 3].map((row) => Array.from({ length: row + 1 }, (_, k) => {
        const x = 100 + (k - row / 2) * 28;
        const y = 24 + row * 24;
        return (
          <g key={`${row}-${k}`} style={{ animation: `hk-pulse 2s ease-in-out infinite ${(row + k) * 0.12}s`, transformOrigin: `${x}px ${y}px` }}>
            <circle cx={x} cy={y} r="11" fill="#0ea5e9" stroke="#075985" strokeWidth="2" />
          </g>
        );
      }))}
    </SVG>
  ),
  mindBlow: { stat: "(a+b)¹⁰⁰", label: "Has 101 terms. Pascal's triangle gives them all instantly — no FOIL needed" },
  realWorld: [
    { emoji: "🎲", label: "Probability bins" },
    { emoji: "🧪", label: "Drug trials" },
    { emoji: "📈", label: "Stock options" },
    { emoji: "🎯", label: "Galton boards" },
    { emoji: "🧬", label: "Genetic ratios" },
  ],
  storyStrip: [
    { emoji: "😱", title: "Expanding nightmare", text: "Try expanding (x + y)⁷ by hand. We'll wait." },
    { emoji: "🔮", title: "Pascal's shortcut", text: "Coefficients appear in a triangle of numbers. Just add!" },
    { emoji: "🪄", title: "From algebra to luck", text: "Same numbers tell you flip-7-heads probability. Beautiful." },
  ],
};

const sequencesHook: ChapterHookData = {
  icon: "📈",
  miniViz: (
    <SVG>
      <line x1="14" y1="104" x2="186" y2="104" stroke="#475569" strokeWidth="2" />
      {[16, 28, 44, 60, 76, 92].map((h, i) => (
        <rect
          key={i}
          x={22 + i * 28}
          y={104 - h}
          width="20"
          height={h}
          rx="3"
          fill="#22c55e"
          stroke="#15803d"
          strokeWidth="2"
          style={{ transformOrigin: `${32 + i * 28}px 104px`, animation: `hk-grow 1.6s ease-out infinite ${i * 0.25}s` }}
        />
      ))}
    </SVG>
  ),
  mindBlow: { stat: "₹1 → ₹1.3 cr", label: "Double a rupee every day for 27 days → ₹1.3 crore. GPs are scary fast" },
  realWorld: [
    { emoji: "💰", label: "Compound interest" },
    { emoji: "📈", label: "Stock returns" },
    { emoji: "🦠", label: "Viral spread" },
    { emoji: "📉", label: "Loan payments" },
    { emoji: "🎂", label: "Population growth" },
  ],
  storyStrip: [
    { emoji: "🔢", title: "Patterns in numbers", text: "2, 4, 6, 8 — add 2 each time. 2, 4, 8, 16 — double each time. Two flavours." },
    { emoji: "🧮", title: "Sums without effort", text: "Add 1 to 1000? Don't add 1000 numbers. Use a formula." },
    { emoji: "💸", title: "Money math", text: "Every fixed deposit, EMI, and investment runs on these formulas." },
  ],
};

const linesHook: ChapterHookData = {
  icon: "📏",
  miniViz: (
    <SVG>
      <line x1="14" y1="100" x2="186" y2="100" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="100" y1="14" x2="100" y2="110" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="20" y1="100" x2="180" y2="20" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" style={{ animation: "hk-fade 2s ease-in-out infinite" }} />
      <circle cx="100" cy="60" r="8" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
      <line x1="100" y1="60" x2="140" y2="60" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="140" y1="60" x2="140" y2="40" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
    </SVG>
  ),
  mindBlow: { stat: "y = mx + c", label: "Six characters that describe every Uber fare, every electric bill, every linear pattern" },
  realWorld: [
    { emoji: "🚖", label: "Cab fare formula" },
    { emoji: "⚡", label: "Electricity bills" },
    { emoji: "📞", label: "Phone plans" },
    { emoji: "🏃", label: "Walking pace" },
    { emoji: "🌡️", label: "Temperature convert" },
  ],
  storyStrip: [
    { emoji: "↗️", title: "Straight, simple, everywhere", text: "Any constant-rate change traces a straight line — that's most of life." },
    { emoji: "📐", title: "Slope = rate", text: "How much does y change per step of x? That single number is the line's identity." },
    { emoji: "💡", title: "Predict the future", text: "Two data points and you can extrapolate where things go." },
  ],
};

const conicsHook: ChapterHookData = {
  icon: "🥚",
  miniViz: (
    <SVG>
      <ellipse cx="100" cy="60" rx="64" ry="32" fill="#ffedd5" stroke="#ea580c" strokeWidth="3.5" style={{ animation: "hk-pulse 2.5s ease-in-out infinite", transformOrigin: "100px 60px" }} />
      <circle cx="60" cy="60" r="6" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
      <circle cx="140" cy="60" r="6" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
      <text x="60" y="84" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7f1d1d">F₁</text>
      <text x="140" y="84" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7f1d1d">F₂</text>
    </SVG>
  ),
  mindBlow: { stat: "🌍 → ☀️", label: "Earth orbits the Sun in an ellipse. Every planet, every comet — conic sections" },
  realWorld: [
    { emoji: "🛰️", label: "Satellite orbits" },
    { emoji: "📡", label: "Dish antennas" },
    { emoji: "🔦", label: "Headlight reflectors" },
    { emoji: "🌉", label: "Bridge arches" },
    { emoji: "☄️", label: "Comet paths" },
  ],
  storyStrip: [
    { emoji: "🍦", title: "Slice a cone", text: "Tilt the slicing plane and you get 4 shapes from one cone." },
    { emoji: "🪐", title: "Kepler's secret", text: "Planets don't orbit in circles — they orbit in ellipses. Conics rule the heavens." },
    { emoji: "📡", title: "Dishes & headlights", text: "Parabolas focus signals/light to a point. That's engineering." },
  ],
};

const threeDHook: ChapterHookData = {
  icon: "🧊",
  miniViz: (
    <SVG>
      <g style={{ animation: "hk-float 3s ease-in-out infinite", transformOrigin: "100px 65px" }}>
        <polygon points="70,40 130,28 156,52 96,64" fill="#c4b5fd" stroke="#5b21b6" strokeWidth="2.5" />
        <polygon points="70,40 96,64 96,104 70,80" fill="#8b5cf6" stroke="#5b21b6" strokeWidth="2.5" />
        <polygon points="156,52 96,64 96,104 156,92" fill="#7c3aed" stroke="#5b21b6" strokeWidth="2.5" />
      </g>
    </SVG>
  ),
  mindBlow: { stat: "(x, y, z)", label: "GPS uses 3D coordinates to pin you within a metre — anywhere on Earth" },
  realWorld: [
    { emoji: "🗺️", label: "GPS location" },
    { emoji: "🎮", label: "3D games" },
    { emoji: "🛸", label: "Drones/aerospace" },
    { emoji: "🩻", label: "MRI imaging" },
    { emoji: "🏗️", label: "Architecture" },
  ],
  storyStrip: [
    { emoji: "📍", title: "One more axis", text: "2D needs (x, y). 3D adds z — the depth dimension. Same maths, more freedom." },
    { emoji: "🛰️", title: "GPS magic", text: "Satellites use 3D distances + math to nail your position to a metre." },
    { emoji: "🎮", title: "Game worlds", text: "Every 3D game scene is built from points, lines, planes in xyz." },
  ],
};

const limitsHook: ChapterHookData = {
  icon: "🎯",
  miniViz: (
    <SVG>
      <circle cx="100" cy="60" r="44" fill="none" stroke="#fce7f3" strokeWidth="2" />
      <circle cx="100" cy="60" r="32" fill="none" stroke="#f9a8d4" strokeWidth="2" />
      <circle cx="100" cy="60" r="20" fill="none" stroke="#ec4899" strokeWidth="2.5" />
      <circle cx="100" cy="60" r="10" fill="none" stroke="#be185d" strokeWidth="2.5" style={{ animation: "hk-pulse 1.4s ease-in-out infinite", transformOrigin: "100px 60px" }} />
      <circle cx="100" cy="60" r="4" fill="#be185d" style={{ animation: "hk-pulse 1.4s ease-in-out infinite", transformOrigin: "100px 60px" }} />
    </SVG>
  ),
  mindBlow: { stat: "h → 0", label: "Calculus rests on getting infinitely close — without ever arriving" },
  realWorld: [
    { emoji: "🚗", label: "Instant speed" },
    { emoji: "📉", label: "Stock derivatives" },
    { emoji: "🧪", label: "Reaction rates" },
    { emoji: "🌡️", label: "Cooling curves" },
    { emoji: "🏎️", label: "F1 lap times" },
  ],
  storyStrip: [
    { emoji: "🤔", title: "Frozen moment", text: "How fast is a car going right now? Speedometer averages — but real instant?" },
    { emoji: "🔬", title: "Zoom in forever", text: "Limits let you ask: 'what value approaches as I shrink the gap to zero?'" },
    { emoji: "🚀", title: "Birth of calculus", text: "Newton & Leibniz built all of physics on this one idea." },
  ],
};

const reasoningHook: ChapterHookData = {
  icon: "🧠",
  miniViz: (
    <SVG>
      <rect x="22" y="40" width="44" height="44" rx="8" fill="#06b6d4" stroke="#155e75" strokeWidth="2.5" style={{ animation: "hk-pulse 1.8s ease-in-out infinite", transformOrigin: "44px 62px" }} />
      <text x="44" y="70" textAnchor="middle" fontSize="22" fontWeight="800" fill="white">T</text>
      <text x="100" y="68" textAnchor="middle" fontSize="22" fontWeight="800" fill="#0e7490">∧</text>
      <rect x="134" y="40" width="44" height="44" rx="8" fill="#14b8a6" stroke="#134e4a" strokeWidth="2.5" style={{ animation: "hk-pulse 1.8s ease-in-out infinite 0.9s", transformOrigin: "156px 62px" }} />
      <text x="156" y="70" textAnchor="middle" fontSize="22" fontWeight="800" fill="white">F</text>
    </SVG>
  ),
  mindBlow: { stat: "0 & 1", label: "Every computer chip is logic gates: AND, OR, NOT — the same connectives you'll study" },
  realWorld: [
    { emoji: "💻", label: "Computer logic" },
    { emoji: "⚖️", label: "Law contracts" },
    { emoji: "🐞", label: "Debugging code" },
    { emoji: "🎮", label: "Game rules" },
    { emoji: "📜", label: "Proofs" },
  ],
  storyStrip: [
    { emoji: "💬", title: "Statements with truth", text: "Not 'how are you?' — sentences that are definitely true or false." },
    { emoji: "🔗", title: "Stick them together", text: "AND, OR, IF-THEN: 6 connectives, infinite logical machines." },
    { emoji: "🖥️", title: "Powers everything digital", text: "Every CPU instruction is built from these tiny logic blocks." },
  ],
};

const statsHook: ChapterHookData = {
  icon: "📊",
  miniViz: (
    <SVG>
      <line x1="14" y1="100" x2="186" y2="100" stroke="#475569" strokeWidth="2" />
      {[34, 60, 84, 56, 28].map((h, i) => (
        <rect
          key={i}
          x={24 + i * 32}
          y={100 - h}
          width="24"
          height={h}
          rx="3"
          fill="#0284c7"
          stroke="#075985"
          strokeWidth="2"
          style={{ transformOrigin: `${36 + i * 32}px 100px`, animation: `hk-grow 1.5s ease-out infinite ${i * 0.18}s` }}
        />
      ))}
    </SVG>
  ),
  mindBlow: { stat: "2.5 quintillion", label: "Bytes of data generated every day. Statistics is how we make sense of any of it" },
  realWorld: [
    { emoji: "📈", label: "Cricket stats" },
    { emoji: "🗳️", label: "Election polls" },
    { emoji: "🏥", label: "Medical trials" },
    { emoji: "🎯", label: "A/B testing" },
    { emoji: "🌡️", label: "Climate data" },
  ],
  storyStrip: [
    { emoji: "🌪️", title: "Drowning in data", text: "100 marks, 1000 cricket innings, 1M tweets. How to summarize?" },
    { emoji: "🎯", title: "One number, big picture", text: "Mean, median, std dev — compress chaos into clear signals." },
    { emoji: "🔍", title: "Spot the patterns", text: "Statistics is the lens that turns raw numbers into stories." },
  ],
};

const probabilityHook: ChapterHookData = {
  icon: "🎲",
  miniViz: (
    <SVG>
      {[0, 1, 2].map((i) => (
        <g key={i} style={{ animation: `hk-bounce 1.8s ease-in-out infinite ${i * 0.35}s`, transformOrigin: `${52 + i * 48}px 62px` }}>
          <rect x={28 + i * 48} y="34" width="48" height="56" rx="10" fill="#0891b2" stroke="#155e75" strokeWidth="2.5" />
          <circle cx={42 + i * 48} cy="48" r="3.5" fill="white" />
          <circle cx={62 + i * 48} cy="48" r="3.5" fill="white" />
          <circle cx={52 + i * 48} cy="62" r="3.5" fill="white" />
          <circle cx={42 + i * 48} cy="76" r="3.5" fill="white" />
          <circle cx={62 + i * 48} cy="76" r="3.5" fill="white" />
        </g>
      ))}
    </SVG>
  ),
  mindBlow: { stat: "1 in 13M", label: "Chance of winning Powerball. Probability is the maths of luck, weather, AI, everything" },
  realWorld: [
    { emoji: "🌦️", label: "Weather forecast" },
    { emoji: "🏥", label: "Disease testing" },
    { emoji: "🃏", label: "Card games" },
    { emoji: "🤖", label: "Machine learning" },
    { emoji: "🚗", label: "Self-driving cars" },
  ],
  storyStrip: [
    { emoji: "🎲", title: "The future, quantified", text: "We can't see what'll happen — but we can put numbers on how likely." },
    { emoji: "🌧️", title: "70% chance of rain", text: "That's not a guess. It's an actual count of past patterns." },
    { emoji: "🤖", title: "AI's secret language", text: "Every Netflix recommendation, every Gmail spam filter — probability." },
  ],
};

// === Class 12 ===

const relations12Hook: ChapterHookData = {
  icon: "🔗",
  miniViz: (
    <SVG>
      {[0, 1, 2].map((i) => (
        <g key={i} style={{ animation: `hk-slide 2s ease-in-out infinite ${i * 0.3}s` }}>
          <circle cx="50" cy={32 + i * 26} r="13" fill="#10b981" stroke="#065f46" strokeWidth="2.5" />
          <circle cx="150" cy={32 + i * 26} r="13" fill="#34d399" stroke="#065f46" strokeWidth="2.5" />
          <line x1="63" y1={32 + i * 26} x2="137" y2={32 + i * 26} stroke="#047857" strokeWidth="3" markerEnd="url(#relArr)" />
        </g>
      ))}
      <defs>
        <marker id="relArr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#047857" /></marker>
      </defs>
    </SVG>
  ),
  mindBlow: { stat: "1 → 1, no skips", label: "Bijections are why every WhatsApp message reaches exactly one inbox" },
  realWorld: [
    { emoji: "📲", label: "Message routing" },
    { emoji: "🔑", label: "Encryption keys" },
    { emoji: "🆔", label: "Aadhaar IDs" },
    { emoji: "🏷️", label: "Barcodes" },
    { emoji: "🔢", label: "Phone book" },
  ],
  storyStrip: [
    { emoji: "🤝", title: "How things relate", text: "Friend-of, parent-of, equal-to — relations are connection rules." },
    { emoji: "🔁", title: "Special properties", text: "Reflexive, symmetric, transitive — like a checklist for fairness." },
    { emoji: "↔️", title: "Inverses & composition", text: "Build functions, undo them, chain them. The language of structure." },
  ],
};

const inverseTrigHook: ChapterHookData = {
  icon: "↪️",
  miniViz: (
    <SVG>
      <path d="M 30 95 Q 100 25 170 25" fill="none" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 170 25 Q 100 95 30 95" fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="6 4" style={{ animation: "hk-shimmer 2s linear infinite" }} />
      <circle cx="170" cy="25" r="7" fill="#d97706" stroke="#78350f" strokeWidth="2" />
      <circle cx="30" cy="95" r="7" fill="#f97316" stroke="#78350f" strokeWidth="2" />
    </SVG>
  ),
  mindBlow: { stat: "θ = sin⁻¹(opp/hyp)", label: "Your phone's compass uses inverse trig 60 times a second" },
  realWorld: [
    { emoji: "🧭", label: "Compass & navigation" },
    { emoji: "📐", label: "Surveying land" },
    { emoji: "🚀", label: "Rocket trajectories" },
    { emoji: "📷", label: "Camera angles" },
    { emoji: "⛵", label: "Sail trim angles" },
  ],
  storyStrip: [
    { emoji: "❓", title: "Reverse the question", text: "If sin θ = 0.5, what's θ? That's inverse trig." },
    { emoji: "⚠️", title: "But which θ?", text: "Many angles give the same sine. Need a principal value to be unique." },
    { emoji: "🧭", title: "Always in navigation", text: "Any time you compute 'what angle?' from distances, you used arcsin/cos/tan." },
  ],
};

const matricesHook: ChapterHookData = {
  icon: "🔢",
  miniViz: (
    <SVG>
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
        <g key={`${r}-${c}`} style={{ animation: `hk-pulse 2.4s ease-in-out infinite ${(r + c) * 0.15}s`, transformOrigin: `${65 + c * 28}px ${35 + r * 28}px` }}>
          <rect
            x={50 + c * 28}
            y={20 + r * 28}
            width="24"
            height="24"
            rx="4"
            fill={`hsl(${220 + r * 18}, 65%, ${48 + c * 10}%)`}
            stroke="#1e293b"
            strokeWidth="1.8"
          />
          <text x={62 + c * 28} y={36 + r * 28} textAnchor="middle" fontSize="10" fontWeight="800" fill="white">{r * 3 + c + 1}</text>
        </g>
      )))}
    </SVG>
  ),
  mindBlow: { stat: "3D rotation = matrix", label: "Every spin in every video game = a matrix multiplied per frame, 60× per second" },
  realWorld: [
    { emoji: "🎮", label: "Game engines" },
    { emoji: "🤖", label: "Neural networks" },
    { emoji: "📷", label: "Image rotation" },
    { emoji: "🔐", label: "Cryptography" },
    { emoji: "🌐", label: "Web graphics" },
  ],
  storyStrip: [
    { emoji: "📦", title: "Grids with power", text: "Matrices look like spreadsheets but ACT like transformations." },
    { emoji: "🌀", title: "One operation, big change", text: "Rotate, scale, project — entire image, in one matrix multiplication." },
    { emoji: "🤖", title: "The brain of AI", text: "Every neural network is matrices multiplied billions of times." },
  ],
};

const determinantsHook: ChapterHookData = {
  icon: "📐",
  miniViz: (
    <SVG>
      <polygon
        points="50,90 150,82 168,42 68,50"
        fill="#cbd5e1"
        fillOpacity="0.7"
        stroke="#1e293b"
        strokeWidth="3"
        style={{ animation: "hk-pulse 2.5s ease-in-out infinite", transformOrigin: "100px 66px" }}
      />
      <text x="100" y="108" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1e293b">|det| = area</text>
    </SVG>
  ),
  mindBlow: { stat: "det = 0", label: "When determinant is zero, the system has infinite solutions OR none — engineers fear this number" },
  realWorld: [
    { emoji: "📊", label: "Solving systems" },
    { emoji: "🏗️", label: "Structural analysis" },
    { emoji: "📐", label: "Area calculations" },
    { emoji: "🔄", label: "Coordinate change" },
    { emoji: "⚙️", label: "Robotics" },
  ],
  storyStrip: [
    { emoji: "🧮", title: "A single magic number", text: "Squeeze a whole matrix into one number that tells you tons about it." },
    { emoji: "📐", title: "Geometric meaning", text: "It's the area (or volume) the matrix carves out of space." },
    { emoji: "🚨", title: "Zero = warning sign", text: "det = 0 means the matrix collapses dimensions. Engineers watch for this." },
  ],
};

const continuityHook: ChapterHookData = {
  icon: "🪜",
  miniViz: (
    <SVG>
      <path d="M 16 95 Q 60 20 100 60" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="60" r="7" fill="white" stroke="#4f46e5" strokeWidth="3" />
      <circle cx="100" cy="28" r="7" fill="#4f46e5" stroke="#312e81" strokeWidth="2" style={{ animation: "hk-pulse 1.6s ease-in-out infinite", transformOrigin: "100px 28px" }} />
      <path d="M 100 28 Q 140 50 184 14" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
    </SVG>
  ),
  mindBlow: { stat: "No jumps allowed", label: "Why your video doesn't suddenly skip frames — frames are continuous functions" },
  realWorld: [
    { emoji: "🎬", label: "Video frames" },
    { emoji: "🌡️", label: "Temperature curves" },
    { emoji: "📈", label: "Stock charts" },
    { emoji: "🎨", label: "Smooth animations" },
    { emoji: "🚗", label: "Speed dial gauges" },
  ],
  storyStrip: [
    { emoji: "✏️", title: "Draw without lifting", text: "A continuous function is one you can sketch in one stroke." },
    { emoji: "🪛", title: "Where it breaks", text: "Jumps, holes, vertical asymptotes — discontinuities are the interesting bits." },
    { emoji: "📐", title: "Smooth = differentiable", text: "Even smoother: no sharp corners. The setup for all of calculus." },
  ],
};

const appDerivHook: ChapterHookData = {
  icon: "🎢",
  miniViz: (
    <SVG>
      <path d="M 16 100 Q 60 14 100 64 T 184 26" fill="none" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
      <line x1="38" y1="44" x2="80" y2="44" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 3" />
      <circle cx="60" cy="44" r="9" fill="#fbbf24" stroke="#78350f" strokeWidth="2.5" style={{ animation: "hk-pulse 1.6s ease-in-out infinite", transformOrigin: "60px 44px" }} />
      <text x="60" y="28" textAnchor="middle" fontSize="11" fontWeight="800" fill="#78350f">max</text>
    </SVG>
  ),
  mindBlow: { stat: "max ↔ min", label: "Tesla optimizes battery range using exactly this — calculus picks the best speed" },
  realWorld: [
    { emoji: "🔋", label: "Battery range" },
    { emoji: "📦", label: "Box packing" },
    { emoji: "🏗️", label: "Material costs" },
    { emoji: "🚗", label: "Speed efficiency" },
    { emoji: "🎯", label: "Profit maximization" },
  ],
  storyStrip: [
    { emoji: "🤔", title: "Where's the peak?", text: "Profit peaks where? Cost is least at what production? Calculus answers." },
    { emoji: "📈", title: "Slopes tell the story", text: "Derivative = 0 marks max/min. Sign-change tells which." },
    { emoji: "💸", title: "Worth billions", text: "Every Amazon shipment box size was optimized this way." },
  ],
};

const integralsHook: ChapterHookData = {
  icon: "🌊",
  miniViz: (
    <SVG>
      <path d="M 16 96 Q 60 20 100 60 Q 140 96 184 28 L 184 100 L 16 100 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="3" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={26 + i * 40}
          y={48 + i * 6}
          width="38"
          height={52 - i * 6}
          fill="#fb923c"
          fillOpacity="0.55"
          stroke="#c2410c"
          strokeWidth="1.5"
          style={{ animation: `hk-fade 2s ease-in-out infinite ${i * 0.2}s` }}
        />
      ))}
    </SVG>
  ),
  mindBlow: { stat: "∫ = total", label: "Spotify shows your year's listening time — that's integration of your daily play, all year" },
  realWorld: [
    { emoji: "📊", label: "Distance from speed" },
    { emoji: "💧", label: "Water flow totals" },
    { emoji: "📉", label: "Total revenue" },
    { emoji: "🔋", label: "Battery used" },
    { emoji: "🏊", label: "Calories burned" },
  ],
  storyStrip: [
    { emoji: "➕", title: "Adding the infinite", text: "Add up infinitely many tiny pieces to get one big total." },
    { emoji: "↩️", title: "Undo a derivative", text: "Integral = anti-derivative. Newton's stunning insight." },
    { emoji: "🌍", title: "Whole quantities", text: "Total distance, area, volume, charge — anything cumulative." },
  ],
};

const appIntegralsHook: ChapterHookData = {
  icon: "🖼️",
  miniViz: (
    <SVG>
      <path d="M 14 100 Q 60 14 100 50 Q 140 86 184 22 L 184 100 Z" fill="#fb7185" fillOpacity="0.5" stroke="#be123c" strokeWidth="3" style={{ animation: "hk-fade 2.5s ease-in-out infinite" }} />
      <text x="100" y="78" textAnchor="middle" fontSize="22" fontWeight="800" fill="#9f1239">∫ f dx</text>
    </SVG>
  ),
  mindBlow: { stat: "πr²", label: "Why is the area of a circle πr²? Slice it into rings, integrate. That's it" },
  realWorld: [
    { emoji: "🏞️", label: "Land area surveys" },
    { emoji: "💧", label: "Water reservoir vol" },
    { emoji: "🌽", label: "Crop field measure" },
    { emoji: "📡", label: "Dish design" },
    { emoji: "🛢️", label: "Tank capacity" },
  ],
  storyStrip: [
    { emoji: "📐", title: "Real shape, real answer", text: "Find area of any curved region — not just squares and triangles." },
    { emoji: "🥧", title: "Slice & sum", text: "Cut the shape into thin strips, sum their areas. That's an integral." },
    { emoji: "🛠️", title: "Engineers love this", text: "Bridges, dams, dishes — designed using these area & volume formulas." },
  ],
};

const diffEqnsHook: ChapterHookData = {
  icon: "🦠",
  miniViz: (
    <SVG>
      {[16, 28, 44, 64, 88].map((y, i) => (
        <circle
          key={i}
          cx={26 + i * 36}
          cy={104 - y}
          r={5 + i * 2}
          fill="#7c3aed"
          stroke="#3b0764"
          strokeWidth="2"
          style={{ transformOrigin: `${26 + i * 36}px ${104 - y}px`, animation: `hk-grow 1.4s ease-out infinite ${i * 0.2}s` }}
        />
      ))}
      <path d="M 26 88 Q 100 60 174 16" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="4 3" />
    </SVG>
  ),
  mindBlow: { stat: "dN/dt = kN", label: "One equation describes COVID spread, bank interest, AND nuclear decay. Mind-blowing" },
  realWorld: [
    { emoji: "🦠", label: "Disease spread" },
    { emoji: "💰", label: "Compound growth" },
    { emoji: "☢️", label: "Radioactive decay" },
    { emoji: "🌡️", label: "Cooling/heating" },
    { emoji: "🚀", label: "Rocket motion" },
  ],
  storyStrip: [
    { emoji: "🧬", title: "Rates, not values", text: "Don't say 'how many?' — say 'how fast is it changing?' Then solve back." },
    { emoji: "🌍", title: "Models the world", text: "Physics, biology, finance — all built on differential equations." },
    { emoji: "🔭", title: "Predict the future", text: "Given today's state, project tomorrow. The maths of forecasting." },
  ],
};

const vectorsHook: ChapterHookData = {
  icon: "➡️",
  miniViz: (
    <SVG>
      <defs>
        <marker id="vahArr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#7c3aed" /></marker>
        <marker id="vahArr2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#a855f7" /></marker>
      </defs>
      <line x1="100" y1="80" x2="166" y2="32" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" markerEnd="url(#vahArr)" style={{ animation: "hk-fade 2s ease-in-out infinite" }} />
      <line x1="100" y1="80" x2="34" y2="60" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" markerEnd="url(#vahArr2)" />
      <circle cx="100" cy="80" r="4" fill="#1e293b" />
    </SVG>
  ),
  mindBlow: { stat: "v = (3, 4, 0)", label: "Every Pokémon move, every shot in PUBG, every football kick — a vector calculation" },
  realWorld: [
    { emoji: "🎮", label: "Game physics" },
    { emoji: "✈️", label: "Wind & flight" },
    { emoji: "🚀", label: "Rocket forces" },
    { emoji: "⚽", label: "Ball trajectories" },
    { emoji: "🧭", label: "Navigation" },
  ],
  storyStrip: [
    { emoji: "💪", title: "Magnitude + direction", text: "Distance alone isn't enough. Vectors carry where AND how much." },
    { emoji: "➕", title: "Combine forces", text: "Add 2 vectors → resultant. That's how all physics builds up." },
    { emoji: "🎯", title: "Dot vs cross", text: "Two ways to multiply vectors. One gives a number, one gives a vector." },
  ],
};

const threeDFullHook: ChapterHookData = {
  icon: "🛩️",
  miniViz: (
    <SVG>
      <polygon points="30,90 170,80 178,38 38,48" fill="#e9d5ff" fillOpacity="0.7" stroke="#7c3aed" strokeWidth="3" />
      <line x1="100" y1="16" x2="100" y2="104" stroke="#ec4899" strokeWidth="4" strokeLinecap="round" style={{ animation: "hk-fade 1.8s ease-in-out infinite" }} />
      <circle cx="100" cy="60" r="5" fill="#ec4899" stroke="#831843" strokeWidth="2" />
      <text x="106" y="20" fontSize="11" fontWeight="800" fill="#831843">n</text>
    </SVG>
  ),
  mindBlow: { stat: "ax + by + cz = d", label: "One equation defines an entire infinite plane. Architecture, robotics, aviation use this daily" },
  realWorld: [
    { emoji: "✈️", label: "Flight paths" },
    { emoji: "🤖", label: "Robot arms" },
    { emoji: "🏗️", label: "CAD modeling" },
    { emoji: "📡", label: "Satellite tracking" },
    { emoji: "🎮", label: "3D rendering" },
  ],
  storyStrip: [
    { emoji: "📍", title: "Lines & planes in space", text: "2D had x, y. Now we add z — and lines/planes become richer." },
    { emoji: "📐", title: "Distance & angle math", text: "Find shortest distance, angle between, intersection — all in 3D." },
    { emoji: "🎯", title: "Powers real-world tech", text: "From CAD design to GPS, this chapter is engineering's daily bread." },
  ],
};

const lpHook: ChapterHookData = {
  icon: "🎯",
  miniViz: (
    <SVG>
      <polygon
        points="30,96 116,96 150,58 78,38"
        fill="#bbf7d0"
        fillOpacity="0.7"
        stroke="#15803d"
        strokeWidth="3"
        style={{ animation: "hk-fade 2.5s ease-in-out infinite" }}
      />
      <circle cx="150" cy="58" r="10" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" style={{ animation: "hk-pulse 1.6s ease-in-out infinite", transformOrigin: "150px 58px" }} />
      <text x="150" y="32" textAnchor="middle" fontSize="11" fontWeight="800" fill="#78350f">optimal</text>
    </SVG>
  ),
  mindBlow: { stat: "$1 trillion", label: "Saved per year by airlines using LP to schedule planes, crew, and routes optimally" },
  realWorld: [
    { emoji: "✈️", label: "Airline scheduling" },
    { emoji: "🚚", label: "Logistics & delivery" },
    { emoji: "🏭", label: "Factory production" },
    { emoji: "📈", label: "Investment mix" },
    { emoji: "🍕", label: "Diet planning" },
  ],
  storyStrip: [
    { emoji: "🎯", title: "Maximize / minimize", text: "Get the most profit, the least cost — within rules you can't break." },
    { emoji: "🎁", title: "The corner trick", text: "Best answer ALWAYS sits at a corner of the allowed region. Just check corners." },
    { emoji: "💰", title: "Saves billions", text: "FedEx, Amazon, Indian Railways all run LP behind the scenes." },
  ],
};

const registry: Record<string, ChapterHookData> = {
  sets: setsHook,
  "relations-functions": functionsHook,
  "trigonometric-functions": trigHook,
  "principle-mathematical-induction": inductionHook,
  "complex-numbers-quadratic": complexHook,
  "linear-inequalities": inequalitiesHook,
  "permutations-combinations": permsHook,
  "binomial-theorem": binomialHook,
  "sequences-series": sequencesHook,
  "straight-lines": linesHook,
  "conic-sections": conicsHook,
  "intro-3d-geometry": threeDHook,
  "limits-derivatives": limitsHook,
  "mathematical-reasoning": reasoningHook,
  statistics: statsHook,
  probability: probabilityHook,
  "relations-functions-12": relations12Hook,
  "inverse-trigonometric-functions": inverseTrigHook,
  matrices: matricesHook,
  determinants: determinantsHook,
  "continuity-differentiability": continuityHook,
  "applications-derivatives": appDerivHook,
  integrals: integralsHook,
  "applications-integrals": appIntegralsHook,
  "differential-equations": diffEqnsHook,
  vectors: vectorsHook,
  "3d-geometry": threeDFullHook,
  "linear-programming": lpHook,
  "probability-12": probabilityHook,
};

export function getChapterHook(chapterId: string): ChapterHookData | null {
  return registry[chapterId] ?? null;
}
