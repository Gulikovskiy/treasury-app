import { describe, expect, it } from "vitest";
import { parseStream } from "../parseStream";
import type { StreamFrame } from "../types";

function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chunks[i]));
      i += 1;
    },
  });
}

async function collect(body: ReadableStream<Uint8Array>): Promise<StreamFrame[]> {
  const frames: StreamFrame[] = [];
  await parseStream(body, (frame) => frames.push(frame));
  return frames;
}

describe("parseStream", () => {
  it("parses a single frame delivered in one chunk", async () => {
    const body = streamFromChunks(['data: {"type":"chunk","text":"hello"}\n\n']);
    const frames = await collect(body);
    expect(frames).toEqual([{ type: "chunk", text: "hello" }]);
  });

  it("reassembles a frame whose data line is split across chunk boundaries", async () => {
    // The `data:` line itself is split mid-field, exactly the failure mode a
    // hand-rolled `split('\n\n')` parser gets wrong (verifies FR-002).
    const body = streamFromChunks([
      'data: {"type":"chunk",',
      '"text":"hello"}\n\n',
    ]);
    const frames = await collect(body);
    expect(frames).toEqual([{ type: "chunk", text: "hello" }]);
  });

  it("reassembles a frame whose blank-line delimiter is split across chunk boundaries", async () => {
    const body = streamFromChunks([
      'data: {"type":"chunk","text":"hello"}\n',
      "\n",
      'data: {"type":"done"}\n\n',
    ]);
    const frames = await collect(body);
    expect(frames).toEqual([{ type: "chunk", text: "hello" }, { type: "done" }]);
  });

  it("parses multiple frames arriving as one chunk, in order", async () => {
    const body = streamFromChunks([
      'data: {"type":"chunk","text":"a"}\n\ndata: {"type":"chunk","text":"b"}\n\ndata: {"type":"done"}\n\n',
    ]);
    const frames = await collect(body);
    expect(frames).toEqual([
      { type: "chunk", text: "a" },
      { type: "chunk", text: "b" },
      { type: "done" },
    ]);
  });

  it("surfaces a malformed data payload as a typed error frame, not a thrown exception (verifies FR-007)", async () => {
    const body = streamFromChunks(["data: {not valid json\n\n"]);
    await expect(collect(body)).resolves.toEqual([
      { type: "error", message: expect.stringContaining("malformed") },
    ]);
  });
});
