/**
 * Sanitise a model-produced SVG before it is stored and later rendered via
 * `dangerouslySetInnerHTML`. Strips markdown fences and any prose around the
 * root, then removes scripts, foreignObjects, event handlers and javascript:
 * URLs. Mirrors the sanitiser in scripts/seed-lessons.mjs so lessons generated
 * locally and lessons generated from the admin dashboard are treated the same.
 *
 * Throws if the result isn't a well-formed <svg>…</svg> root, so a mangled
 * generation is rejected rather than stored.
 */
export function sanitizeSvg(raw: string): string {
  let svg = raw.trim();
  svg = svg.replace(/^```(?:svg|xml|html)?\s*\n?/i, "").replace(/\n?```\s*$/, "");
  svg = svg.trim();

  // If the model returned text before/after the <svg>...</svg>, extract just it.
  const open = svg.indexOf("<svg");
  const close = svg.lastIndexOf("</svg>");
  if (open >= 0 && close > open) {
    svg = svg.slice(open, close + "</svg>".length);
  }

  // Remove <script>...</script> blocks (case-insensitive, multiline).
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
  // Remove <foreignObject>...</foreignObject> blocks.
  svg = svg.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  // Remove any on* event-handler attribute.
  svg = svg.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  svg = svg.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
  // Strip javascript: URLs.
  svg = svg.replace(/javascript\s*:/gi, "");

  if (!svg.startsWith("<svg") || !svg.endsWith("</svg>")) {
    throw new Error("SVG output did not contain a valid <svg>…</svg> root.");
  }
  return svg;
}
