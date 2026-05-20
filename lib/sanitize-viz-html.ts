/**
 * Sanitizes AI-generated HTML for rendering in a sandboxed iframe.
 * The iframe uses sandbox="allow-scripts" (no allow-same-origin), which is
 * the real security boundary. This is defense-in-depth.
 */

const BLOCKED_PATTERNS = [
  { pattern: /\bdocument\.cookie\b/gi, label: "document.cookie" },
  { pattern: /\blocalStorage\b/gi, label: "localStorage" },
  { pattern: /\bsessionStorage\b/gi, label: "sessionStorage" },
  { pattern: /\bindexedDB\b/gi, label: "indexedDB" },
  { pattern: /\bfetch\s*\(/gi, label: "fetch()" },
  { pattern: /\bXMLHttpRequest\b/gi, label: "XMLHttpRequest" },
  { pattern: /\bWebSocket\b/gi, label: "WebSocket" },
  { pattern: /\beval\s*\(/gi, label: "eval()" },
  { pattern: /\bnew\s+Function\s*\(/gi, label: "new Function()" },
];

const POSTMESSAGE_BLOCKED = /postMessage\s*\(/gi;
const POSTMESSAGE_ALLOWED = /parent\.postMessage\s*\(\s*\{\s*type\s*:\s*["']ready["']\s*\}/;

const CSP_META = '<meta http-equiv="Content-Security-Policy" content="default-src \'unsafe-inline\' \'unsafe-eval\' data: blob:; img-src \'self\' data: blob:; connect-src \'none\'">';

export function sanitizeVizHtml(html: string): {
  safe: string;
  warnings: string[];
} {
  const warnings: string[] = [];
  let safe = html;

  // Check each blocked pattern
  for (const { pattern, label } of BLOCKED_PATTERNS) {
    if (pattern.test(safe)) {
      warnings.push(`Blocked: ${label}`);
      safe = safe.replace(pattern, `/* BLOCKED: ${label} */`);
    }
    pattern.lastIndex = 0;
  }

  // Handle postMessage specially
  if (POSTMESSAGE_BLOCKED.test(safe)) {
    POSTMESSAGE_BLOCKED.lastIndex = 0;
    if (!POSTMESSAGE_ALLOWED.test(safe)) {
      warnings.push("Blocked: postMessage (non-ready pattern)");
      safe = safe.replace(
        /postMessage\s*\([^)]*\)/gi,
        "/* BLOCKED: postMessage */"
      );
    }
  }

  // Inject CSP meta tag into <head>
  if (safe.includes("<head>")) {
    safe = safe.replace("<head>", `<head>\n${CSP_META}`);
  } else if (safe.includes("<html>")) {
    safe = safe.replace("<html>", `<html><head>${CSP_META}</head>`);
  } else {
    // Wrap in full HTML structure
    safe = `<!DOCTYPE html><html><head>${CSP_META}</head><body>${safe}</body></html>`;
  }

  // If too many blocked patterns, the HTML is fundamentally unsafe
  const blockedCount = warnings.filter((w) => w.startsWith("Blocked:")).length;
  if (blockedCount >= 3) {
    return {
      safe: "",
      warnings: [...warnings, "Rejected: too many unsafe patterns"],
    };
  }

  return { safe, warnings };
}
