import { createParser } from "eventsource-parser";
import type { StreamFrame } from "./types";

/**
 * Reads a `text/event-stream` response body and invokes `onFrame` for each
 * parsed event. Never throws for malformed payloads (FR-007) — a bad `data:`
 * line becomes a typed `{ type: "error" }` frame instead. Read errors from
 * the underlying stream (e.g. an aborted fetch) reject the returned promise;
 * the caller distinguishes an intentional abort from a genuine failure.
 */
export async function parseStream(
  body: ReadableStream<Uint8Array>,
  onFrame: (frame: StreamFrame) => void,
): Promise<void> {
  const decoder = new TextDecoder();
  const parser = createParser({
    onEvent(event) {
      onFrame(decodeFrame(event.data));
    },
  });

  const reader = body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.feed(decoder.decode(value, { stream: true }));
    }
  } finally {
    reader.releaseLock();
  }
}

function decodeFrame(raw: string): StreamFrame {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { type: "error", message: `malformed frame JSON: ${raw}` };
  }
  if (isStreamFrame(parsed)) {
    return parsed;
  }
  return { type: "error", message: `unrecognized frame shape: ${raw}` };
}

function isStreamFrame(value: unknown): value is StreamFrame {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }
  const type = (value as { type: unknown }).type;
  if (type === "chunk") {
    return typeof (value as { text?: unknown }).text === "string";
  }
  if (type === "done") {
    return true;
  }
  if (type === "error") {
    return typeof (value as { message?: unknown }).message === "string";
  }
  return false;
}
