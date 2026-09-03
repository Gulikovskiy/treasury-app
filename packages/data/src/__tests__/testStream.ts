/** Test helper shared by useAgentStream's test files: builds a fake SSE Response body. */
export function sseResponseFromFrames(frames: object[], init?: ResponseInit): Response {
  const encoder = new TextEncoder();
  let i = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i >= frames.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(frames[i])}\n\n`));
      i += 1;
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
    ...init,
  });
}
