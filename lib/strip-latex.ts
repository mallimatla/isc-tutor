/**
 * Converts LaTeX-laden text into something suitable for speech synthesis.
 * Replaces common math symbols with verbal equivalents and strips remaining LaTeX.
 */
export function stripLatexForSpeech(text: string): string {
  let out = text;

  // Handle display math blocks first ($$...$$)
  out = out.replace(/\$\$([^$]+)\$\$/g, (_, inner) => convertLatexInner(inner));

  // Handle inline math ($...$)
  out = out.replace(/\$([^$]+)\$/g, (_, inner) => convertLatexInner(inner));

  // Strip markdown bold/italic
  out = out.replace(/\*\*([^*]+)\*\*/g, "$1");
  out = out.replace(/\*([^*]+)\*/g, "$1");
  out = out.replace(/`([^`]+)`/g, "$1");

  // Collapse whitespace
  out = out.replace(/\n/g, " ");
  out = out.replace(/\s+/g, " ").trim();

  return out;
}

function convertLatexInner(latex: string): string {
  let s = latex;

  // Fractions: \frac{a}{b} → "a divided by b"
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 divided by $2");

  // Roots: \sqrt[n]{x} → "n-th root of x", \sqrt{x} → "square root of x"
  s = s.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, "$1-th root of $2");
  s = s.replace(/\\sqrt\{([^}]+)\}/g, "square root of $1");

  // Powers: x^{n} → "x to the power n", x^2 → "x squared", x^3 → "x cubed"
  s = s.replace(/\^{2}/g, " squared");
  s = s.replace(/\^2/g, " squared");
  s = s.replace(/\^{3}/g, " cubed");
  s = s.replace(/\^3/g, " cubed");
  s = s.replace(/\^\{([^}]+)\}/g, " to the power $1");
  s = s.replace(/\^(\w)/g, " to the power $1");

  // Subscripts: x_{n} → "x sub n"
  s = s.replace(/_\{([^}]+)\}/g, " sub $1");
  s = s.replace(/_(\w)/g, " sub $1");

  // Greek letters
  s = s.replace(/\\pi/g, "pi");
  s = s.replace(/\\theta/g, "theta");
  s = s.replace(/\\alpha/g, "alpha");
  s = s.replace(/\\beta/g, "beta");
  s = s.replace(/\\gamma/g, "gamma");
  s = s.replace(/\\delta/g, "delta");
  s = s.replace(/\\epsilon/g, "epsilon");
  s = s.replace(/\\lambda/g, "lambda");
  s = s.replace(/\\mu/g, "mu");
  s = s.replace(/\\sigma/g, "sigma");
  s = s.replace(/\\omega/g, "omega");
  s = s.replace(/\\phi/g, "phi");

  // Operators
  s = s.replace(/\\int/g, "integral");
  s = s.replace(/\\sum/g, "sum");
  s = s.replace(/\\prod/g, "product");
  s = s.replace(/\\infty/g, "infinity");
  s = s.replace(/\\pm/g, "plus or minus");
  s = s.replace(/\\times/g, "times");
  s = s.replace(/\\cdot/g, "times");
  s = s.replace(/\\div/g, "divided by");

  // Relations
  s = s.replace(/\\leq/g, "less than or equal to");
  s = s.replace(/\\geq/g, "greater than or equal to");
  s = s.replace(/\\neq/g, "not equal to");
  s = s.replace(/\\approx/g, "approximately");
  s = s.replace(/\\equiv/g, "equivalent to");

  // Set operations
  s = s.replace(/\\in/g, "in");
  s = s.replace(/\\cup/g, "union");
  s = s.replace(/\\cap/g, "intersection");
  s = s.replace(/\\subset/g, "subset of");
  s = s.replace(/\\subseteq/g, "subset of or equal to");
  s = s.replace(/\\emptyset/g, "empty set");

  // Trig
  s = s.replace(/\\sin/g, "sin");
  s = s.replace(/\\cos/g, "cos");
  s = s.replace(/\\tan/g, "tan");
  s = s.replace(/\\log/g, "log");
  s = s.replace(/\\ln/g, "natural log");

  // Misc formatting
  s = s.replace(/\\left/g, "");
  s = s.replace(/\\right/g, "");
  s = s.replace(/\\[,;:!]/g, " ");
  s = s.replace(/\\text\{([^}]+)\}/g, "$1");
  s = s.replace(/\\mathrm\{([^}]+)\}/g, "$1");
  s = s.replace(/\{/g, "");
  s = s.replace(/\}/g, "");

  // Strip any remaining backslash commands
  s = s.replace(/\\[a-zA-Z]+/g, " ");

  return ` ${s.trim()} `;
}
