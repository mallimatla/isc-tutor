/**
 * Convert LaTeX-laden text into a compact Unicode-friendly string suitable
 * for copy/paste destinations like WhatsApp, SMS, or plain-text email —
 * where math fonts aren't available but Unicode glyphs are.
 *
 * Conversion philosophy: keep it readable on a phone keyboard, prefer
 * common Unicode glyphs (π, √, ², ₁, ∫) over verbose words. Falls back
 * gracefully when there's no good glyph.
 */

const SUPERSCRIPT: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
  "n": "ⁿ", "i": "ⁱ",
};

const SUBSCRIPT: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
  "n": "ₙ", "i": "ᵢ", "k": "ₖ", "r": "ᵣ",
};

function toSup(s: string): string {
  return [...s].map((c) => SUPERSCRIPT[c] ?? `^${c}`).join("");
}
function toSub(s: string): string {
  return [...s].map((c) => SUBSCRIPT[c] ?? `_${c}`).join("");
}

function convertInner(latex: string): string {
  let s = latex;

  // \frac{a}{b} → (a)/(b) — parens added when the parts contain operators
  s = s.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (_, a, b) => {
    const needsA = /[+\-*/=]/.test(a);
    const needsB = /[+\-*/=]/.test(b);
    return `${needsA ? `(${a})` : a}/${needsB ? `(${b})` : b}`;
  });

  // \sqrt[n]{x} → ⁿ√(x); \sqrt{x} → √(x) or √x for single chars
  s = s.replace(/\\sqrt\s*\[([^\]]+)\]\s*\{([^{}]+)\}/g, (_, n, x) => `${toSup(n)}√(${x})`);
  s = s.replace(/\\sqrt\s*\{([^{}]+)\}/g, (_, x) => (x.length === 1 ? `√${x}` : `√(${x})`));

  // Superscripts: x^{...} and x^c
  s = s.replace(/\^\s*\{([^{}]+)\}/g, (_, inside) => toSup(inside));
  s = s.replace(/\^\s*([0-9A-Za-z+\-])/g, (_, c) => toSup(c));

  // Subscripts: x_{...} and x_c
  s = s.replace(/_\s*\{([^{}]+)\}/g, (_, inside) => toSub(inside));
  s = s.replace(/_\s*([0-9A-Za-z+\-])/g, (_, c) => toSub(c));

  // Greek letters → Unicode
  const greek: Record<string, string> = {
    "\\\\alpha": "α", "\\\\beta": "β", "\\\\gamma": "γ", "\\\\delta": "δ",
    "\\\\epsilon": "ε", "\\\\zeta": "ζ", "\\\\eta": "η", "\\\\theta": "θ",
    "\\\\iota": "ι", "\\\\kappa": "κ", "\\\\lambda": "λ", "\\\\mu": "μ",
    "\\\\nu": "ν", "\\\\xi": "ξ", "\\\\pi": "π", "\\\\rho": "ρ",
    "\\\\sigma": "σ", "\\\\tau": "τ", "\\\\upsilon": "υ", "\\\\phi": "φ",
    "\\\\chi": "χ", "\\\\psi": "ψ", "\\\\omega": "ω",
    "\\\\Alpha": "Α", "\\\\Beta": "Β", "\\\\Gamma": "Γ", "\\\\Delta": "Δ",
    "\\\\Theta": "Θ", "\\\\Lambda": "Λ", "\\\\Pi": "Π", "\\\\Sigma": "Σ",
    "\\\\Phi": "Φ", "\\\\Psi": "Ψ", "\\\\Omega": "Ω",
  };
  for (const [pat, glyph] of Object.entries(greek)) {
    s = s.replace(new RegExp(pat, "g"), glyph);
  }

  // Operators & relations
  const ops: Record<string, string> = {
    "\\\\times": "×", "\\\\cdot": "·", "\\\\div": "÷",
    "\\\\pm": "±", "\\\\mp": "∓",
    "\\\\leq": "≤", "\\\\geq": "≥", "\\\\neq": "≠",
    "\\\\approx": "≈", "\\\\equiv": "≡", "\\\\sim": "~",
    "\\\\to": "→", "\\\\rightarrow": "→", "\\\\leftarrow": "←",
    "\\\\Rightarrow": "⇒", "\\\\Leftarrow": "⇐", "\\\\Leftrightarrow": "⇔",
    "\\\\infty": "∞", "\\\\partial": "∂", "\\\\nabla": "∇",
    "\\\\int": "∫", "\\\\iint": "∬", "\\\\iiint": "∭",
    "\\\\sum": "∑", "\\\\prod": "∏",
    "\\\\in": "∈", "\\\\notin": "∉", "\\\\subset": "⊂", "\\\\supset": "⊃",
    "\\\\subseteq": "⊆", "\\\\cup": "∪", "\\\\cap": "∩",
    "\\\\emptyset": "∅", "\\\\varnothing": "∅",
    "\\\\forall": "∀", "\\\\exists": "∃",
    "\\\\angle": "∠", "\\\\perp": "⊥", "\\\\parallel": "∥",
    "\\\\degree": "°", "\\\\circ": "°",
  };
  for (const [pat, glyph] of Object.entries(ops)) {
    s = s.replace(new RegExp(pat, "g"), glyph);
  }

  // Trig and log keep their names, but as plain text (drop the backslash)
  s = s.replace(/\\(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|sinh|cosh|tanh|log|ln|exp|min|max|lim|det|gcd|lcm)\b/g, "$1");

  // \text{...} and \mathrm{...} — keep the text inside
  s = s.replace(/\\text\s*\{([^{}]+)\}/g, "$1");
  s = s.replace(/\\mathrm\s*\{([^{}]+)\}/g, "$1");
  s = s.replace(/\\mathbb\s*\{([^{}]+)\}/g, "$1");

  // Spacing commands → space
  s = s.replace(/\\[,;:!\s]/g, " ");
  s = s.replace(/\\quad/g, "  ");
  s = s.replace(/\\qquad/g, "    ");

  // \left and \right are just sizing hints — drop them
  s = s.replace(/\\left/g, "");
  s = s.replace(/\\right/g, "");

  // Drop any remaining unknown backslash commands
  s = s.replace(/\\[a-zA-Z]+/g, "");

  // Strip stray braces
  s = s.replace(/[{}]/g, "");

  return s;
}

export function latexToUnicode(text: string): string {
  if (!text) return "";
  let out = text;

  // Display math $$...$$
  out = out.replace(/\$\$([^$]+)\$\$/g, (_, inner) => convertInner(inner));
  // Inline math $...$
  out = out.replace(/\$([^$]+)\$/g, (_, inner) => convertInner(inner));

  // Markdown emphasis — drop the markers but keep the text
  out = out.replace(/\*\*([^*]+)\*\*/g, "$1");
  out = out.replace(/\*([^*]+)\*/g, "$1");
  out = out.replace(/`([^`]+)`/g, "$1");

  // Collapse extra whitespace but preserve intentional line breaks
  out = out.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
  return out;
}
