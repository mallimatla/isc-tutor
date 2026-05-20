const BLOCKED_PATTERNS = [
  { pattern: /\beval\s*\(/gi, label: "eval()" },
  { pattern: /\bnew\s+Function\s*\(/gi, label: "new Function()" },
  { pattern: /\bfetch\s*\(/gi, label: "fetch()" },
  { pattern: /\bXMLHttpRequest\b/gi, label: "XMLHttpRequest" },
  { pattern: /\bWebSocket\b/gi, label: "WebSocket" },
  { pattern: /\blocalStorage\b/gi, label: "localStorage" },
  { pattern: /\bsessionStorage\b/gi, label: "sessionStorage" },
  { pattern: /\bindexedDB\b/gi, label: "indexedDB" },
  { pattern: /\bdocument\.cookie\b/gi, label: "document.cookie" },
  { pattern: /<script\s+src\s*=/gi, label: "<script src=>" },
  { pattern: /<link\s+rel\s*=/gi, label: "<link rel=>" },
  { pattern: /<img\s+[^>]*src\s*=\s*["']https?:/gi, label: "<img src=http>" },
  { pattern: /<iframe/gi, label: "nested <iframe>" },
  { pattern: /\bimport\s*\(/gi, label: "dynamic import()" },
];

// postMessage is allowed ONLY for the ready signal pattern
const POSTMESSAGE_BLOCKED = /postMessage\s*\(/gi;
const POSTMESSAGE_ALLOWED = /parent\.postMessage\s*\(\s*\{\s*type\s*:\s*["']ready["']\s*\}/;

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
    // Reset regex lastIndex
    pattern.lastIndex = 0;
  }

  // Handle postMessage specially
  if (POSTMESSAGE_BLOCKED.test(safe)) {
    POSTMESSAGE_BLOCKED.lastIndex = 0;
    if (!POSTMESSAGE_ALLOWED.test(safe)) {
      warnings.push("Blocked: postMessage (non-ready pattern)");
      safe = safe.replace(
        /postMessage\s*\([^)]*\)/gi,
        '/* BLOCKED: postMessage */'
      );
    }
  }

  // Strip <meta http-equiv> tags
  const metaPattern = /<meta\s+http-equiv[^>]*>/gi;
  if (metaPattern.test(safe)) {
    warnings.push("Stripped: <meta http-equiv>");
    safe = safe.replace(metaPattern, "");
  }

  // Strip on* event handlers containing URLs
  const onHandlerPattern = /\bon\w+\s*=\s*["'][^"']*https?:[^"']*["']/gi;
  if (onHandlerPattern.test(safe)) {
    warnings.push("Stripped: on* handler with URL");
    safe = safe.replace(onHandlerPattern, "");
  }

  // Check for external URL patterns in script content (not in allowed HTML attributes)
  const urlInScript =
    /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = urlInScript.exec(safe)) !== null) {
    const scriptContent = match[1];
    if (/https?:\/\//i.test(scriptContent)) {
      warnings.push("Warning: URL found in script content");
    }
  }

  // If too many blocked patterns, the HTML is fundamentally unsafe
  const blockedCount = warnings.filter((w) => w.startsWith("Blocked:")).length;
  if (blockedCount >= 3) {
    return { safe: "", warnings: [...warnings, "Rejected: too many unsafe patterns"] };
  }

  return { safe, warnings };
}
