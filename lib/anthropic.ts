import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";

// --- Typed errors ---

export class ClaudeRateLimitError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ClaudeRateLimitError";
  }
}

export class ClaudeMalformedOutputError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ClaudeMalformedOutputError";
  }
}

export class ClaudeTimeoutError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ClaudeTimeoutError";
  }
}

export class ClaudeInternalError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ClaudeInternalError";
  }
}

// --- Client ---

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The current default reasoning model.
const DEFAULT_MODEL = "claude-sonnet-5";

// Models Anthropic has retired — requests to these now return 404, which the
// app surfaces as "Claude API request failed". If a stale ANTHROPIC_MODEL env
// var (e.g. left over in a Vercel/`.env` config) still points at one, ignore it
// and fall back to DEFAULT_MODEL rather than hard-failing every request.
const RETIRED_MODELS = new Set(["claude-sonnet-4-20250514"]);

function resolveModel(): string {
  const envModel = process.env.ANTHROPIC_MODEL?.trim();
  if (envModel && !RETIRED_MODELS.has(envModel)) return envModel;
  return DEFAULT_MODEL;
}

// Exported so routes log the model actually used (provenance) instead of
// re-reading the env var and disagreeing with the real request.
export const MODEL = resolveModel();

/**
 * Defensively strip ```json / ``` fences and surrounding whitespace before JSON.parse.
 * Claude sometimes wraps strict-JSON output in markdown fences even when asked not to;
 * use this helper at every Claude-JSON parsing site.
 */
export function safeParseClaudeJson(raw: string): unknown {
  let text = raw.trim();

  // Strip a leading ```json or ``` fence (with optional language tag)
  text = text.replace(/^```(?:json|JSON)?\s*\n?/, "");
  // Strip a trailing ``` fence
  text = text.replace(/\n?```\s*$/, "");

  // Some models prepend a sentence before the JSON; grab the first {...} block as a fallback.
  text = text.trim();
  if (!text.startsWith("{") && !text.startsWith("[")) {
    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");
    const start =
      firstBrace === -1
        ? firstBracket
        : firstBracket === -1
          ? firstBrace
          : Math.min(firstBrace, firstBracket);
    if (start > 0) text = text.slice(start);
  }

  return JSON.parse(text);
}

// --- Main function ---

interface CallClaudeParams<TSchema extends z.ZodSchema> {
  system: string;
  user: string;
  schema: TSchema;
  promptVersion: string;
}

interface CallClaudeResult<T> {
  data: T;
  usage: { input: number; output: number };
  latencyMs: number;
}

export async function callClaude<TSchema extends z.ZodSchema>(
  params: CallClaudeParams<TSchema>
): Promise<CallClaudeResult<z.infer<TSchema>>> {
  const { system, user, schema } = params;
  const maxRetries = 2;
  let lastError: Error | null = null;

  const start = Date.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const userMessage =
      attempt === 0
        ? user
        : `${user}\n\nYour previous response was not valid JSON. Output ONLY the JSON object.`;

    let response: Anthropic.Message;
    try {
      response = await client.messages.create(
        {
          model: MODEL,
          max_tokens: 4096,
          // Sonnet 5 turns adaptive thinking ON when `thinking` is omitted,
          // which would consume the max_tokens budget and add latency. These
          // are short, schema-validated JSON responses on a latency-sensitive
          // path, so keep the fast, non-thinking behavior explicitly.
          thinking: { type: "disabled" },
          system,
          messages: [{ role: "user", content: userMessage }],
        },
        { timeout: 30_000 }
      );
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) {
        throw new ClaudeRateLimitError("Claude API rate limited", {
          cause: err,
        });
      }
      if (
        err instanceof Error &&
        (err.name === "TimeoutError" || err.message.includes("timed out"))
      ) {
        throw new ClaudeTimeoutError("Claude API request timed out", {
          cause: err,
        });
      }
      // Include the real HTTP status + API message so the failure is
      // diagnosable from logs (and the client banner) instead of an opaque
      // "Claude API request failed" — e.g. a 404 for a retired model or a 401
      // for a bad key.
      const detail =
        err instanceof Anthropic.APIError
          ? ` (${err.status ?? "no status"}: ${err.message})`
          : err instanceof Error
            ? `: ${err.message}`
            : "";
      throw new ClaudeInternalError(`Claude API request failed${detail}`, {
        cause: err,
      });
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      lastError = new ClaudeMalformedOutputError(
        "No text block in Claude response"
      );
      continue;
    }

    let parsed: unknown;
    try {
      parsed = safeParseClaudeJson(textBlock.text);
    } catch {
      lastError = new ClaudeMalformedOutputError(
        `Invalid JSON from Claude: ${textBlock.text.slice(0, 200)}`
      );
      continue;
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      lastError = new ClaudeMalformedOutputError(
        `Schema validation failed: ${result.error.message}`
      );
      continue;
    }

    const latencyMs = Date.now() - start;
    return {
      data: result.data as z.infer<TSchema>,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
      latencyMs,
    };
  }

  throw lastError ?? new ClaudeMalformedOutputError("All retries exhausted");
}

// --- Streaming variant ---

export async function callClaudeStreaming<TSchema extends z.ZodSchema>(
  params: CallClaudeParams<TSchema>,
  onDelta: (text: string) => void
): Promise<CallClaudeResult<z.infer<TSchema>>> {
  const { system, user, schema } = params;
  const start = Date.now();

  let accumulated = "";
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    const stream = client.messages.stream(
      {
        model: MODEL,
        max_tokens: 4096,
        // Keep the fast, non-thinking path (see callClaude above) — adaptive
        // thinking is on by default on Sonnet 5 when `thinking` is omitted.
        thinking: { type: "disabled" },
        system,
        messages: [{ role: "user", content: user }],
      },
      { timeout: 60_000 }
    );

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        accumulated += event.delta.text;
        onDelta(event.delta.text);
      }
    }

    const finalMessage = await stream.finalMessage();
    inputTokens = finalMessage.usage.input_tokens;
    outputTokens = finalMessage.usage.output_tokens;
  } catch (err) {
    // If we got partial data, try to parse it; otherwise fall back to non-streaming
    if (!accumulated) {
      if (err instanceof Anthropic.RateLimitError) {
        throw new ClaudeRateLimitError("Claude API rate limited", {
          cause: err,
        });
      }
      // Fallback: retry with non-streaming
      return callClaude(params);
    }
    // We have partial data — try to parse what we got
  }

  let parsed: unknown;
  try {
    parsed = safeParseClaudeJson(accumulated);
  } catch {
    // Streaming produced invalid JSON — fall back to non-streaming retry
    return callClaude(params);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    // Schema validation failed — fall back to non-streaming retry
    return callClaude(params);
  }

  const latencyMs = Date.now() - start;
  return {
    data: result.data as z.infer<TSchema>,
    usage: { input: inputTokens, output: outputTokens },
    latencyMs,
  };
}

// --- Plain-text streaming variant ---
//
// Unlike callClaude / callClaudeStreaming (which expect the model to return a
// strict-JSON object validated against a Zod schema), this streams the model's
// prose answer directly. Use it for open-ended, conversational replies — e.g.
// the "Ask a doubt" tutor — where the output is markdown/LaTeX text meant to be
// rendered as-is, not parsed. Deltas are clean answer text, so nothing has to
// strip a JSON wrapper on the client.

interface CallClaudeTextParams {
  system: string;
  user: string;
  promptVersion: string;
  maxTokens?: number;
}

interface CallClaudeTextResult {
  text: string;
  usage: { input: number; output: number };
  latencyMs: number;
}

/**
 * Non-streaming plain-text call. Used server-side where we just need the full
 * text back (e.g. admin lesson generation: narrative JSON + SVG diagrams).
 */
export async function callClaudeText(
  params: CallClaudeTextParams
): Promise<CallClaudeTextResult> {
  const { system, user, maxTokens = 4096 } = params;
  const start = Date.now();
  try {
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: maxTokens,
        thinking: { type: "disabled" },
        system,
        messages: [{ role: "user", content: user }],
      },
      { timeout: 120_000 }
    );
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new ClaudeMalformedOutputError("No text block in Claude response");
    }
    return {
      text: textBlock.text,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    if (err instanceof ClaudeMalformedOutputError) throw err;
    if (err instanceof Anthropic.RateLimitError) {
      throw new ClaudeRateLimitError("Claude API rate limited", { cause: err });
    }
    if (
      err instanceof Error &&
      (err.name === "TimeoutError" || err.message.includes("timed out"))
    ) {
      throw new ClaudeTimeoutError("Claude API request timed out", {
        cause: err,
      });
    }
    const detail =
      err instanceof Anthropic.APIError
        ? ` (${err.status ?? "no status"}: ${err.message})`
        : err instanceof Error
          ? `: ${err.message}`
          : "";
    throw new ClaudeInternalError(`Claude API request failed${detail}`, {
      cause: err,
    });
  }
}

export async function callClaudeTextStreaming(
  params: CallClaudeTextParams,
  onDelta: (text: string) => void
): Promise<CallClaudeTextResult> {
  const { system, user, maxTokens = 2048 } = params;
  const start = Date.now();

  let accumulated = "";
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    const stream = client.messages.stream(
      {
        model: MODEL,
        max_tokens: maxTokens,
        // Non-thinking, fast path (see callClaude) — the prompt itself asks the
        // model to reason step-by-step in the visible answer.
        thinking: { type: "disabled" },
        system,
        messages: [{ role: "user", content: user }],
      },
      { timeout: 60_000 }
    );

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        accumulated += event.delta.text;
        onDelta(event.delta.text);
      }
    }

    const finalMessage = await stream.finalMessage();
    inputTokens = finalMessage.usage.input_tokens;
    outputTokens = finalMessage.usage.output_tokens;
  } catch (err) {
    // No output at all → surface a typed error the route can turn into an SSE
    // error event. If we already streamed some text, keep it (the reader has
    // seen those deltas) and return the partial answer.
    if (!accumulated) {
      if (err instanceof Anthropic.RateLimitError) {
        throw new ClaudeRateLimitError("Claude API rate limited", {
          cause: err,
        });
      }
      if (
        err instanceof Error &&
        (err.name === "TimeoutError" || err.message.includes("timed out"))
      ) {
        throw new ClaudeTimeoutError("Claude API request timed out", {
          cause: err,
        });
      }
      const detail =
        err instanceof Anthropic.APIError
          ? ` (${err.status ?? "no status"}: ${err.message})`
          : err instanceof Error
            ? `: ${err.message}`
            : "";
      throw new ClaudeInternalError(`Claude API request failed${detail}`, {
        cause: err,
      });
    }
  }

  return {
    text: accumulated,
    usage: { input: inputTokens, output: outputTokens },
    latencyMs: Date.now() - start,
  };
}
