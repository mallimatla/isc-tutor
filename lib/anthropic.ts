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

const MODEL =
  process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

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
      throw new ClaudeInternalError("Claude API request failed", {
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
      parsed = JSON.parse(textBlock.text.trim());
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
    parsed = JSON.parse(accumulated.trim());
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
