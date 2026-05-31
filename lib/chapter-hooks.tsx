import type { ReactNode } from "react";

export interface ChapterHookData {
  icon: string;
  miniViz: ReactNode;
  mindBlow: { stat: string; label: string };
  realWorld: { emoji: string; label: string }[];
  storyStrip: { emoji: string; title: string; text: string }[];
}

// Tiny reusable animated motifs (no external CSS — all inline)
const A = ({ className = "" }: { className?: string }) => (
  <style>{`
    @keyframes hk-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes hk-pulse { 0%,100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
    @keyframes hk-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes hk-orbit { from { transform: rotate(0deg) translateX(18px) rotate(0deg); } to { transform: rotate(360deg) translateX(18px) rotate(-360deg); } }
    @keyframes hk-wave { 0% { d: path('M0,40 Q25,20 50,40 T100,40'); } 50% { d: path('M0,40 Q25,60 50,40 T100,40'); } 100% { d: path('M0,40 Q25,20 50,40 T100,40'); } }
    @keyframes hk-grow { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
    @keyframes hk-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    @keyframes hk-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  `}{className && ""}</style>
);

// === Class 11 ===

const setsHook: ChapterHookData = {
  icon: "🎯",
  miniViz: (
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <circle cx="80" cy="60" r="40" fill="#60a5fa" fillOpacity="0.55" style={{ animation: "hk-float 3s ease-in-out infinite" }} />
      <circle cx="120" cy="60" r="40" fill="#c084fc" fillOpacity="0.55" style={{ animation: "hk-float 3s ease-in-out infinite 1.5s" }} />
      <circle cx="100" cy="60" r="6" fill="#fff" style={{ animation: "hk-pulse 1.8s ease-in-out infinite" }} />
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <rect x="20" y="50" width="40" height="20" rx="6" fill="#34d399" />
      <text x="40" y="64" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">x</text>
      <rect x="80" y="35" width="40" height="50" rx="8" fill="#10b981" style={{ animation: "hk-pulse 2s ease-in-out infinite" }} />
      <text x="100" y="65" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">f</text>
      <rect x="140" y="50" width="40" height="20" rx="6" fill="#34d399" />
      <text x="160" y="64" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">y</text>
      <line x1="60" y1="60" x2="80" y2="60" stroke="#059669" strokeWidth="3" />
      <line x1="120" y1="60" x2="140" y2="60" stroke="#059669" strokeWidth="3" />
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <circle cx="100" cy="60" r="40" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" />
      <g style={{ animation: "hk-spin 5s linear infinite", transformOrigin: "100px 60px" }}>
        <line x1="100" y1="60" x2="140" y2="60" stroke="#f59e0b" strokeWidth="3" />
        <circle cx="140" cy="60" r="6" fill="#f59e0b" />
      </g>
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={20 + i * 20} y="40" width="6" height="50"
          fill={`hsl(${260 + i * 5}, 70%, 55%)`}
          style={{ transformOrigin: `${26 + i * 20}px 90px`, animation: `hk-bounce 2s ease-in-out infinite ${i * 0.15}s` }} />
      ))}
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <line x1="20" y1="60" x2="180" y2="60" stroke="#6366f1" strokeWidth="1" />
      <line x1="100" y1="10" x2="100" y2="110" stroke="#6366f1" strokeWidth="1" />
      <g style={{ animation: "hk-spin 6s linear infinite", transformOrigin: "100px 60px" }}>
        <line x1="100" y1="60" x2="140" y2="30" stroke="#3b82f6" strokeWidth="3" />
        <circle cx="140" cy="30" r="7" fill="#3b82f6" />
      </g>
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <line x1="20" y1="60" x2="180" y2="60" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="60" y="55" width="120" height="10" fill="#f43f5e" style={{ animation: "hk-pulse 2s ease-in-out infinite" }} />
      <circle cx="60" cy="60" r="8" fill="white" stroke="#f43f5e" strokeWidth="3" />
      <text x="60" y="85" textAnchor="middle" fontSize="11" fill="#9f1239">a</text>
      <polygon points="180,60 170,55 170,65" fill="#f43f5e" />
    </svg>
  ),
  mindBlow: { stat: "₹ 0 ≤ Cost ≤ Budget", label: "Every business decision is solving inequalities — under the hood" },
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      {["A", "B", "C", "D"].map((c, i) => (
        <g key={i} style={{ animation: `hk-float 2.5s ease-in-out infinite ${i * 0.3}s` }}>
          <rect x={30 + i * 35} y="40" width="28" height="40" rx="4" fill="#a855f7" />
          <text x={44 + i * 35} y="65" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">{c}</text>
        </g>
      ))}
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      {[0, 1, 2, 3].map((row) => Array.from({ length: row + 1 }, (_, k) => {
        const x = 100 + (k - row / 2) * 26;
        const y = 25 + row * 22;
        return <circle key={`${row}-${k}`} cx={x} cy={y} r="9" fill="#3b82f6" style={{ animation: `hk-pulse 2s ease-in-out infinite ${(row + k) * 0.1}s` }} />;
      }))}
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      {[15, 30, 45, 60, 75, 90].map((h, i) => (
        <rect key={i} x={20 + i * 28} y={110 - h} width="20" height={h} rx="3" fill="#22c55e"
          style={{ transformOrigin: "bottom", animation: `hk-grow 1s ease-out ${i * 0.2}s both` }} />
      ))}
    </svg>
  ),
  mindBlow: { stat: "₹1 → ₹1 cr", label: "Double a rupee every day for 27 days → ₹1.3 crore. GPs are scary fast" },
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <line x1="20" y1="100" x2="180" y2="20" stroke="#475569" strokeWidth="3" style={{ animation: "hk-pulse 2.5s ease-in-out infinite" }} />
      <line x1="20" y1="60" x2="180" y2="60" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="100" y1="10" x2="100" y2="110" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="100" cy="60" r="5" fill="#475569" />
    </svg>
  ),
  mindBlow: { stat: "y = mx + c", label: "Six characters that describe every Uber fare, every electric bill, every linear pattern" },
  realWorld: [
    { emoji: "🚖", label: "Cab fare formula" },
    { emoji: "⚡", label: "Electricity bills" },
    { emoji: "📞", label: "Phone plans" },
    { emoji: "🏃", label: "Walking pace" },
    { emoji: "🌡️", label: "Temperature conversion" },
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <ellipse cx="100" cy="60" rx="60" ry="30" fill="none" stroke="#f97316" strokeWidth="3" style={{ animation: "hk-pulse 2s ease-in-out infinite" }} />
      <circle cx="60" cy="60" r="4" fill="#ef4444" />
      <circle cx="140" cy="60" r="4" fill="#ef4444" />
    </svg>
  ),
  mindBlow: { stat: "🌍", label: "Earth orbits the Sun in an ellipse. Every planet, every comet — conic sections" },
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <g style={{ animation: "hk-float 3s ease-in-out infinite" }}>
        <polygon points="80,40 120,30 140,55 100,65" fill="#a78bfa" />
        <polygon points="80,40 100,65 100,100 80,75" fill="#7c3aed" />
        <polygon points="140,55 100,65 100,100 140,90" fill="#6d28d9" />
      </g>
    </svg>
  ),
  mindBlow: { stat: "x, y, z", label: "GPS uses 3D coordinates to pin you within a metre — anywhere on Earth" },
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <circle cx="100" cy="60" r="40" fill="none" stroke="#ec4899" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="100" cy="60" r="25" fill="none" stroke="#ec4899" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="100" cy="60" r="12" fill="none" stroke="#ec4899" strokeWidth="1" />
      <circle cx="100" cy="60" r="4" fill="#ec4899" style={{ animation: "hk-pulse 1.5s ease-in-out infinite" }} />
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <rect x="40" y="40" width="30" height="40" rx="6" fill="#14b8a6" />
      <text x="55" y="65" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">T</text>
      <line x1="70" y1="60" x2="90" y2="60" stroke="#0d9488" strokeWidth="2" />
      <text x="100" y="64" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f766e">∧</text>
      <line x1="110" y1="60" x2="130" y2="60" stroke="#0d9488" strokeWidth="2" />
      <rect x="130" y="40" width="30" height="40" rx="6" fill="#14b8a6" style={{ animation: "hk-pulse 2s ease-in-out infinite" }} />
      <text x="145" y="65" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">F</text>
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      {[40, 70, 90, 60, 30].map((h, i) => (
        <rect key={i} x={20 + i * 35} y={110 - h} width="25" height={h} rx="3" fill="#06b6d4"
          style={{ transformOrigin: "bottom", animation: `hk-grow 0.8s ease-out ${i * 0.15}s both` }} />
      ))}
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      {[1, 2, 3].map((i) => (
        <g key={i} style={{ animation: `hk-bounce 2s ease-in-out infinite ${i * 0.4}s` }}>
          <rect x={20 + i * 50} y="40" width="40" height="40" rx="8" fill="#0891b2" />
          <text x={40 + i * 50} y="65" textAnchor="middle" fontSize="20" fill="white">⚀</text>
        </g>
      ))}
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      {[1, 2, 3].map((n, i) => (
        <g key={n}>
          <circle cx="50" cy={30 + i * 30} r="12" fill="#10b981" />
          <circle cx="150" cy={30 + i * 30} r="12" fill="#34d399" />
          <line x1="62" y1={30 + i * 30} x2="138" y2={30 + i * 30} stroke="#059669" strokeWidth="2" style={{ animation: `hk-pulse 2s ease-in-out infinite ${i * 0.3}s` }} />
        </g>
      ))}
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <path d="M 30 90 Q 100 30 170 30" fill="none" stroke="#f59e0b" strokeWidth="3" />
      <path d="M 170 30 Q 100 90 30 90" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="4 4" style={{ animation: "hk-pulse 2.5s ease-in-out infinite" }} />
      <circle cx="170" cy="30" r="5" fill="#f59e0b" />
      <circle cx="30" cy="90" r="5" fill="#f97316" />
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
        <rect key={`${r}-${c}`} x={50 + c * 30} y={20 + r * 30} width="22" height="22" rx="3"
          fill={`hsl(${220 + r * 20}, 60%, ${50 + c * 8}%)`}
          style={{ animation: `hk-pulse 2.5s ease-in-out infinite ${(r + c) * 0.15}s` }} />
      )))}
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <polygon points="60,80 140,75 160,40 80,45" fill="#94a3b8" fillOpacity="0.5" stroke="#475569" strokeWidth="2" style={{ animation: "hk-pulse 2.5s ease-in-out infinite" }} />
      <text x="100" y="100" textAnchor="middle" fontSize="11" fill="#475569" fontWeight="700">|det| = area</text>
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <path d="M 20 90 Q 60 30 100 60" fill="none" stroke="#6366f1" strokeWidth="3" />
      <circle cx="100" cy="60" r="5" fill="white" stroke="#6366f1" strokeWidth="2.5" />
      <circle cx="100" cy="30" r="5" fill="#6366f1" />
      <path d="M 100 30 Q 140 50 180 20" fill="none" stroke="#6366f1" strokeWidth="3" style={{ animation: "hk-pulse 2s ease-in-out infinite" }} />
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <path d="M 20 90 Q 60 20 100 60 T 180 30" fill="none" stroke="#e11d48" strokeWidth="3" />
      <circle cx="60" cy="40" r="6" fill="#fbbf24" style={{ animation: "hk-pulse 2s ease-in-out infinite" }} />
      <circle cx="100" cy="60" r="6" fill="#fbbf24" />
      <text x="60" y="28" textAnchor="middle" fontSize="10" fill="#92400e" fontWeight="700">max</text>
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <path d="M 20 90 Q 50 30 100 60 Q 150 90 180 30" fill="#f97316" fillOpacity="0.35" stroke="#ea580c" strokeWidth="3" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={30 + i * 40} y={50 + i * 5} width="35" height={40 - i * 5} fill="#fbbf24" fillOpacity="0.4" style={{ animation: `hk-pulse 2s ease-in-out infinite ${i * 0.2}s` }} />
      ))}
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <path d="M 20 100 Q 60 20 100 50 Q 140 80 180 30 L 180 100 Z" fill="#f43f5e" fillOpacity="0.4" stroke="#e11d48" strokeWidth="2" style={{ animation: "hk-pulse 3s ease-in-out infinite" }} />
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      {[20, 35, 55, 80, 105].map((y, i) => (
        <circle key={i} cx={30 + i * 35} cy={110 - y} r={4 + i * 1.5} fill="#6366f1" style={{ animation: `hk-grow 1.5s ease-out ${i * 0.2}s both` }} />
      ))}
      <path d="M 30 100 Q 100 80 170 10" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <defs><marker id="vahArr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#a855f7" /></marker></defs>
      <line x1="100" y1="80" x2="160" y2="40" stroke="#a855f7" strokeWidth="3.5" markerEnd="url(#vahArr)" style={{ animation: "hk-pulse 2s ease-in-out infinite" }} />
      <line x1="100" y1="80" x2="40" y2="60" stroke="#8b5cf6" strokeWidth="3" markerEnd="url(#vahArr)" />
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <polygon points="40,90 160,80 170,40 50,50" fill="#a78bfa" fillOpacity="0.35" stroke="#7c3aed" strokeWidth="2" />
      <line x1="100" y1="20" x2="100" y2="100" stroke="#ec4899" strokeWidth="3" style={{ animation: "hk-pulse 2s ease-in-out infinite" }} />
    </svg>
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
    <svg viewBox="0 0 200 120" className="h-full w-full">
      <A />
      <polygon points="40,90 120,90 140,60 80,40" fill="#22c55e" fillOpacity="0.4" stroke="#16a34a" strokeWidth="2" style={{ animation: "hk-pulse 2.5s ease-in-out infinite" }} />
      <circle cx="140" cy="60" r="8" fill="#f59e0b" stroke="white" strokeWidth="2" />
    </svg>
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
