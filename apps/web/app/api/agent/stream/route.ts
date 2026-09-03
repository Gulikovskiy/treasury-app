/**
 * Stub SSE endpoint (contracts/agent-stream.md). The response content here
 * is a deterministic canned message — this feature covers the transport
 * mechanism only, not the agent's actual reasoning (spec.md Non-Goals).
 */
const CANNED_FRAGMENTS = [
  "Based on the Safe's current position, ",
  "the health factor is comfortably above the target threshold, ",
  "with no immediate action required.",
];

const FRAGMENT_DELAY_MS = 30;

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as { conversationId?: unknown }).conversationId !== "string" ||
    typeof (body as { prompt?: unknown }).prompt !== "string"
  ) {
    return new Response("Expected { conversationId: string; prompt: string }", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      const onAbort = () => close();
      request.signal.addEventListener("abort", onAbort);

      const send = (frame: object) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(frame)}\n\n`));
      };

      try {
        for (const fragment of CANNED_FRAGMENTS) {
          if (request.signal.aborted) return;
          send({ type: "chunk", text: fragment });
          await delay(FRAGMENT_DELAY_MS);
        }
        if (!request.signal.aborted) {
          send({ type: "done" });
        }
      } finally {
        request.signal.removeEventListener("abort", onAbort);
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
